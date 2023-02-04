declare const Buffer; // ref: https://stackoverflow.com/a/38877890

import { PrismaClient } from '@prisma/client'

import { startStream, types } from '@near-lake/framework';

const lakeConfig: types.LakeConfig = {
    s3BucketName: "near-lake-data-mainnet",
    s3RegionName: "eu-central-1",
    startBlockHeight: 83953337,
};

const SOCIAL_DB = 'social.near';

const prisma = new PrismaClient()

function base64decode(encodedValue: string): object {
    let buff = Buffer.from(encodedValue, 'base64');
    return JSON.parse(buff.toString('utf-8'));
}

async function handleStreamerMessage(
    block: types.Block,
    ctx: types.LakeContext,
): Promise<void> {
    const nearSocialReceipts = block.receipts().filter(receipt => receipt.receiverId === SOCIAL_DB)
    // .flatMap(action =>
    //     action
    //         .operations
    //         .map(operation => operation['FunctionCall'])
    //         .filter(operation => operation?.methodName === 'set')
    //         .map(functionCallOperation => ({
    //             ...functionCallOperation,
    //             args: base64decode(functionCallOperation.args)
    //         }))
    //         .filter(functionCall =>
    //             'post' in functionCall.args.data[action.predecessorId]
    //         )
    // );
    if (nearSocialReceipts.length > 0) {
        const blockHeight = block.blockHeight;
        console.log(blockHeight);
        nearSocialReceipts.forEach(async receipt => {
            let action = block.actionByReceiptId(receipt.receiptId)
            action.operations.
                forEach(async (operation) => {
                    let functionCall = operation['FunctionCall']
                    if (functionCall) {
                        let args_decoded = base64decode(functionCall.args)
                        let receipt_status = receipt.status.hasOwnProperty("Failure") ? "Failure" : receipt.status === "Postponed" ? "Postponed" : "Success"
                        await prisma.receipts.create({
                            data: {
                                receipt_id: receipt.receiptId,
                                signer_id: action.signerId,
                                block_height: blockHeight,
                                outcome_index: Number(receipt.executionOutcomeId) || 0,
                                account_id: receipt.receiverId,
                                method_name: functionCall?.methodName,
                                status: receipt_status,
                                args: JSON.stringify(args_decoded),
                            }
                        })
                    }
                }
                )
        })
    }
}

(async () => {
    await startStream(lakeConfig, handleStreamerMessage);
})();
