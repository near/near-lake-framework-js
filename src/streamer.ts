import { S3Client } from "@aws-sdk/client-s3";
import { listBlocks, fetchStreamerMessage } from "./s3fetchers";
import { LakeConfig, BlockHeight, StreamerMessage } from "./types";
import { sleep } from "./utils";

export async function startStream(
  config: LakeConfig,
  onStreamerMessageReceived: (data: StreamerMessage) => Promise<void>
) {
  const s3Client = new S3Client({ region: config.s3RegionName });

  let lastProcessedBlockHash: string;
  let startFromBlockHeight = config.startBlockHeight;
  let queue: Promise<void>[] = [];

  while (true) {
    let blockHeights;
    try {
      blockHeights = await listBlocks(
        s3Client,
        config.s3BucketName,
        startFromBlockHeight
      );
    } catch (err) {
      console.error("Failed to list blocks. Retrying.", err);
      continue;
    }
    if (blockHeights.length > 0) {
      startFromBlockHeight = blockHeights[blockHeights.length - 1];
    } else {
      await sleep(2000);
      continue;
    }
    for (let blockHeight of blockHeights) {
      const streamerMessage = await fetchStreamerMessage(
        s3Client,
        config.s3BucketName,
        blockHeight
      );
      // check if we have `lastProcessedBlockHash` (might be not set only on start)
      // compare lastProcessedBlockHash` with `streamerMessage.block.header.prevHash` of the current
      // block (ensure we never skip blocks even if there is some incident on Lake Indexer side)
      // retrieve the data from S3 if hashes don't match and repeat the main loop step
      if (
        lastProcessedBlockHash &&
        lastProcessedBlockHash !== streamerMessage.block.header.prevHash
      ) {
        console.log(
          "The hash of the last processed block doesn't match the prevHash of the new one. Refetching the data from S3 in 200ms"
        );
        await sleep(200);
        break;
      }
      // `queue` here is used to achieve throttling as streamer would run ahead without a stop
      // and if we start from genesis it will spawn millions of `onStreamerMessageReceived` callbacks.
      // This implementation has a pipeline that fetches the data from S3 while `onStreamerMessageReceived`
      // is being processed, so even with a queue size of 1 there is already a benefit.
      queue.push(onStreamerMessageReceived(streamerMessage));
      if (queue.length > 10) {
        await queue.shift();
      }
      lastProcessedBlockHash = streamerMessage.block.header.hash;
    }
  }
}
