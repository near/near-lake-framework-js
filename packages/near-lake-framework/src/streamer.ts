import { S3Client } from '@aws-sdk/client-s3';
import { listBlocks, fetchStreamerMessage } from './s3fetchers';
import { LakeConfig } from './types';
import { Block, StreamerMessage, LakeContext } from "@near-lake/primitives"
import { sleep } from './utils';

const FATAL_ERRORS = ['CredentialsProviderError'];

async function* batchStream(
    config: LakeConfig
): AsyncIterableIterator<Promise<StreamerMessage>[]> {
    const s3Client = new S3Client({
        credentials: config.credentials,
        region: config.s3RegionName,
        endpoint: config.s3Endpoint,
        forcePathStyle: config.s3ForcePathStyle
    });

    let startBlockHeight = config.startBlockHeight;

    while (true) {
        let blockHeights;
        try {
            blockHeights = await listBlocks(
                s3Client,
                config.s3BucketName,
                startBlockHeight,
                config.blocksPreloadPoolSize
            );
        } catch (err) {
            if (FATAL_ERRORS.includes(err.name)) {
                throw err;
            }

            console.error('Failed to list blocks. Retrying.', err);
            continue;
        }

        if (blockHeights.length === 0) {
            // Throttling when there are no new blocks
            const NO_NEW_BLOCKS_THROTTLE_MS = 700;
            await sleep(NO_NEW_BLOCKS_THROTTLE_MS);
            continue;
        }

        yield blockHeights.map(blockHeight => fetchStreamerMessage(s3Client, config.s3BucketName, blockHeight));
        // eslint-disable-next-line prefer-spread
        startBlockHeight = Math.max.apply(Math, blockHeights) + 1;
    }
}

async function* fetchAhead<T>(seq: AsyncIterable<T>, stepsAhead = 10): AsyncIterableIterator<T> {
    const queue = [];
    while (true) {
        while (queue.length < stepsAhead) {
            queue.push(seq[Symbol.asyncIterator]().next());
        }

        const { value, done } = await queue.shift();
        if (done) return;
        yield value;
    }
}

export async function* stream(
    config: LakeConfig
): AsyncIterableIterator<StreamerMessage> {
    let lastProcessedBlockHash: string;
    let startBlockHeight = config.startBlockHeight;

    while (true) {
        try {
            for await (const promises of fetchAhead(batchStream({ ...config, startBlockHeight }))) {
                for (const promise of promises) {
                    const streamerMessage = await promise;
                    // check if we have `lastProcessedBlockHash` (might be not set only on start)
                    // compare lastProcessedBlockHash` with `streamerMessage.block.header.prevHash` of the current
                    // block (ensure we never skip blocks even if there is some incident on Lake Indexer side)
                    // retrieve the data from S3 if hashes don't match and repeat the main loop step
                    if (
                        lastProcessedBlockHash &&
                        lastProcessedBlockHash !== streamerMessage.block.header.prevHash
                    ) {
                        throw new Error(
                            `The hash of the last processed block ${lastProcessedBlockHash} doesn't match the prevHash ${streamerMessage.block.header.prevHash} of the new one ${streamerMessage.block.header.hash}.`);
                    }

                    yield streamerMessage;

                    lastProcessedBlockHash = streamerMessage.block.header.hash;
                    startBlockHeight = streamerMessage.block.header.height + 1;
                }
            }
        } catch (e) {
            if (FATAL_ERRORS.includes(e.name)) {
                throw e;
            }

            // TODO: Should there be limit for retries?
            console.log('Retrying on error when fetching blocks', e, 'Refetching the data from S3 in 200ms');
            await sleep(200);
        }
    }
}

export async function startStream(
    config: LakeConfig,
    onStreamerMessageReceived: (data: Block, context: LakeContext) => Promise<void>
) {
    let context = new LakeContext();
    const queue: Promise<void>[] = [];
    for await (const streamerMessage of stream(config)) {
        // `queue` here is used to achieve throttling as streamer would run ahead without a stop
        // and if we start from genesis it will spawn millions of `onStreamerMessageReceived` callbacks.
        // This implementation has a pipeline that fetches the data from S3 while `onStreamerMessageReceived`
        // is being processed, so even with a queue size of 1 there is already a benefit.
        // TODO: Reliable error propagation for onStreamerMessageReceived?
        let block = Block.fromStreamerMessage(streamerMessage)
        queue.push(onStreamerMessageReceived(block, context));
        if (queue.length > 10) {
            await queue.shift();
        }
    }
}
