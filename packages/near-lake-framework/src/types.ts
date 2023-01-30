import { CredentialProvider } from '@aws-sdk/types';
import { StreamerMessage as StreamerMessageType, Block as BlockType, LakeContext as LakeContextType } from '@near-lake/indexer-primitives';
export type BlockHeight = number;

export interface EndpointConfig {
  protocol: string,
  hostname: string,
  port: number,
  path: string,
}

export interface LakeConfig {
  credentials?: CredentialProvider;
  s3Endpoint?: EndpointConfig;
  s3BucketName: string;
  s3RegionName: string;
  startBlockHeight: number;
  blocksPreloadPoolSize?: number;
  s3ForcePathStyle?: boolean;
}

export type StreamerMessage = StreamerMessageType;
export type Block = BlockType;
export type LakeContext = LakeContextType
