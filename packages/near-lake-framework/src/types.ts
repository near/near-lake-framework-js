import { CredentialProvider } from '@aws-sdk/types';

export { StreamerMessage, Block, LakeContext } from '@near-lake/primitives';
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
