
import { startStream, types } from 'near-lake-framework';

const lakeConfig: types.LakeConfig = {
    s3BucketName: 'near-lake-data-mainnet',
    s3RegionName: 'eu-central-1',
    startBlockHeight: 66264389,
};

// Interface to capture data about an event
// Arguments
// * `standard`: name of standard, e.g. nep171
// * `version`: e.g. 1.0.0
// * `event`: type of the event, e.g. nft_mint
// * `data`: associate event data. Strictly typed for each set {standard, version, event} inside corresponding NEP

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
