# NEAR Lake Framework

NEAR Lake Framework is a syntactical framework for accessing the NEAR Lake Indexer Data. It is a wrapper around the AWS API.

## Simple Example

```ts
import { startStream, types } from '@near-lake/framework';

const lakeConfig: types.LakeConfig = {
    s3BucketName: 'near-lake-data-mainnet',
    s3RegionName: 'eu-central-1',
    startBlockHeight: 66264389,
};

async function handleStreamerMessage(
    block: types.Block,
    context: types.LakeContext
): Promise<void> {
    let events = block.eventsByAccountId("x.paras.near")
    console.log(events)
}

(async () => {
    await startStream(lakeConfig, handleStreamerMessage);
})();
```

The interface to capture data about an event has the following arguments:

- `standard`: name of standard, e.g. nep171
- `version`: e.g. 1.0.0
- `event`: type of the event, e.g. nft_mint
- `data`: associate event data. Strictly typed for each set {standard, version, event} inside corresponding NEP
