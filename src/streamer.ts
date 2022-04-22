import { S3Client } from '@aws-sdk/client-s3';
import { listBlocks, fetchStreamerMessage } from './s3fetchers';
import { LakeConfig, BlockHeight, StreamerMessage } from './types';

export async function startStream(
  config: LakeConfig,
  onStreamerMessageReceived: (data: StreamerMessage) => Promise<void>
) {
  const s3Client = new S3Client({ region: config.s3RegionName });

  let lastProcessedBlockHash: string;
  let startFromBlockHeight = config.startBlockHeight;
  let queue: Promise<void>[] = [];

  while (true) {
    const blockHeights = await listBlocks(s3Client, config.s3BucketName, startFromBlockHeight);
    if (blockHeights.length > 0) {
      startFromBlockHeight = blockHeights[blockHeights.length - 1];
    } else {
      setTimeout(() => {}, 2000);
      continue;
    }
    for (let blockHeight of blockHeights) {
      const streamerMessage = await fetchStreamerMessage(s3Client, config.s3BucketName, blockHeight);
      if (lastProcessedBlockHash && lastProcessedBlockHash !== streamerMessage.block.header.prevHash) {
        startFromBlockHeight = blockHeight - 1;
        continue;
      }
      queue.push(onStreamerMessageReceived(streamerMessage));
      if (queue.length > 10) {
        await queue.shift();
      }
      lastProcessedBlockHash = streamerMessage.block.header.hash;
    }
  }
}
