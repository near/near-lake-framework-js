[![npm version](https://badge.fury.io/js/near-lake-framework.svg)](https://badge.fury.io/js/near-lake-framework)

# NEAR Lake Framework JS

Available in programming languages: [Rust](https://github.com/near/near-lake-framework) | **Javascript**

**ATTENTION!** This library is in beta and hasn't been tested in production yet.

NEAR Lake Framework is a small library companion to [NEAR Lake](https://github.com/near/near-lake). It allows you to build
your own indexer that subscribes to the stream of blocks from the NEAR Lake data source and create your own logic to process
the NEAR Protocol data.

---

[Official NEAR Lake Framework launch announcement](https://gov.near.org/t/announcement-near-lake-framework-brand-new-word-in-indexer-building-approach/17668) has been published on the NEAR Gov Forum
Greetings from the Data Platform Team! We are happy and proud to announce an MVP release of a brand new word in indexer building approach - NEAR Lake Framework.

---

## Example

```typescript
import { startStream, types } from "near-lake-framework";

const lakeConfig: types.LakeConfig = {
  s3BucketName: "near-lake-data-mainnet",
  s3RegionName: "eu-central-1",
  startBlockHeight: 63804051,
};

async function handleStreamerMessage(
  streamerMessage: types.StreamerMessage
): Promise<void> {
  console.log(
    `Block #${streamerMessage.block.header.height} Shards: ${streamerMessage.shards.length}`
  );
}

(async () => {
  await startStream(lakeConfig, handleStreamerMessage);
})();
```

## Tutorial

Please, read the tutorial [JavaScript NEAR Lake indexer basic tutorial](https://near-indexers.io/tutorials/lake/js-lake-indexer)

## How to use

## Custom S3 storage

In case you want to run your own [near-lake](https://github.com/near/near-lake) instance and store data in some S3 compatible storage ([Minio](https://min.io/) or [Localstack](https://localstack.cloud/) as example)
You can owerride default S3 API endpoint by using `s3_endpoint` option

- run minio

```bash
$ mkdir -p /data/near-lake-custom && minio server /data
```

- add `s3_endpoint` parameter to LakeConfig instance

```typescript
const localEndpoint: types.EndpointConfig = {
    protocol: 'http',
    hostname: '0.0.0.0',
    port: 9000,
    path: '/',
};

const lakeConfig: types.LakeConfig = {
  s3Endpoint: localEndpoint,
  s3BucketName: "near-lake-custom",
  s3RegionName: "eu-central-1",
  s3ForcePathStyle: true,
  startBlockHeight: 0,
};
```

### AWS S3 Credentials

In order to be able to get objects from the AWS S3 bucket you need to provide the AWS credentials.

AWS default profile configuration with aws configure looks similar to the following:

`~/.aws/credentials`

```
[default]
aws_access_key_id=AKIAIOSFODNN7EXAMPLE
aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

[AWS docs: Configuration and credential file settings](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)

### Dependencies

Install `near-lake-framework`

```bash
$ npm i near-lake-framework
```

After that import in your code:

```ts
import { startStream, types } from 'near-lake-framework';
```

## Configuration

Everything should be configured before the start of your indexer application via `LakeConfig` struct.

Available parameters:

- `s3Endpoint: string` - provide the AWS S3 custom API ednpoint
- `s3BucketName: string` - provide the AWS S3 bucket name (`near-lake-testnet`, `near-lake-mainnet` or yours if you run your own NEAR Lake)
- `s3RegionName: string` - provide the region for AWS S3 bucket
- `startBlockHeight: number` - block height to start the stream from
- `blocksPreloadPoolSize: number` - provide the number of blocks to preload (default: 200)

## Cost estimates

**TL;DR** approximately $18.15 per month (for AWS S3 access, paid directly to AWS) for the reading of fresh blocks

Explanation:

Assuming NEAR Protocol produces accurately 1 block per second (which is really not, the average block production time is 1.3s). A full day consists of 86400 seconds, that's the max number of blocks that can be produced.

According the [Amazon S3 prices](https://aws.amazon.com/s3/pricing/?nc1=h_ls) `list` requests are charged for $0.005 per 1000 requests and `get` is charged for $0.0004 per 1000 requests.

Calculations (assuming we are following the tip of the network all the time):

```
86400 blocks per day * 5 requests for each block / 1000 requests * $0.0004 per 1k requests = $0.173 * 30 days = $5.19
```

**Note:** 5 requests for each block means we have 4 shards (1 file for common block data and 4 separate files for each shard)

And a number of `list` requests we need to perform for 30 days:

```
86400 blocks per day / 1000 requests * $0.005 per 1k list requests = $0.432 * 30 days = $12.96

$5.19 + $12.96 = $18.15
```

The price depends on the number of shards

## Future plans

**The main NEAR Lake Framework library we develop is a Rust-lang version. The JS version is following the main one, so there is might be some delays in delivering fixes and features**

We use Milestones with clearly defined acceptance criteria:

- [x] [MVP](https://github.com/near/near-lake-framework/milestone/1)
- [ ] [1.0](https://github.com/near/near-lake-framework/milestone/2)
