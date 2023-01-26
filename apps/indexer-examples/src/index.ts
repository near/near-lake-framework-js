
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
interface EventLogData {
    standard: string,
    version: string,
    event: string,
    data?: unknown,
}

interface ParasEventLogData {
    owner_id: string,
    token_ids: string[],
}

interface MintbaseEventLogData {
    owner_id: string,
    memo: string,
}

async function handleStreamerMessage(
    streamerMessage: types.StreamerMessage
): Promise<void> {
    const createdOn = new Date(streamerMessage.block.header.timestamp / 1000000);
    const relevantOutcomes = streamerMessage
        .shards
        .flatMap(shard => shard.receiptExecutionOutcomes)
        .map(outcome => ({
            receipt: {
                id: outcome.receipt.receiptId,
                receiverId: outcome.receipt.receiverId,
            },
            events: outcome.executionOutcome.outcome.logs.map(
                (log: string): EventLogData => {
                    const [_, probablyEvent] = log.match(/^EVENT_JSON:(.*)$/) ?? [];
                    try {
                        return JSON.parse(probablyEvent);
                    } catch (e) {
                        return;
                    }
                }
            )
                .filter(event => event !== undefined)
        }))
        .filter(relevantOutcome =>
            relevantOutcome.events.some(
                event => event.standard === 'nep171' && event.event === 'nft_mint'
            )
        );

    const output = [];
    for (const relevantOutcome of relevantOutcomes) {
        let marketplace = 'Unknown';
        let nfts = [];
        if (relevantOutcome.receipt.receiverId.endsWith('.paras.near')) {
            marketplace = 'Paras';
            nfts = relevantOutcome.events.flatMap(event => {
                return (event.data as ParasEventLogData[])
                    .map(eventData => ({
                        owner: eventData.owner_id,
                        links: eventData.token_ids.map(
                            tokenId => `https://paras.id/token/${relevantOutcome.receipt.receiverId}::${tokenId.split(':')[0]}/${tokenId}`
                        )
                    })
                    );
            });
        } else if (relevantOutcome.receipt.receiverId.match(/\.mintbase\d+\.near$/)) {
            marketplace = 'Mintbase';
            nfts = relevantOutcome.events.flatMap(event => {
                return (event.data as MintbaseEventLogData[])
                    .map(eventData => {
                        const memo = JSON.parse(eventData.memo);
                        return {
                            owner: eventData.owner_id,
                            links: [`https://mintbase.io/thing/${memo['meta_id']}:${relevantOutcome.receipt.receiverId}`]
                        };
                    });
            });
        } else {
            nfts = relevantOutcome.events.flatMap(event => event.data);
        }
        output.push({
            receiptId: relevantOutcome.receipt.id,
            marketplace,
            createdOn,
            nfts,
        });

    }
    if (output.length) {
        console.log('We caught freshly minted NFTs!');
        console.dir(output, { depth: 5 });
    }
}

(async () => {
    await startStream(lakeConfig, handleStreamerMessage);
})();
