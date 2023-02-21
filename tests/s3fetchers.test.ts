import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import * as fs from 'fs';

import { fetchStreamerMessage } from '../src/s3fetchers';

describe('fetchStreamerMessage', () => {
  it('serializes meta transactions', async () => {
    const client = {
      send: jest.fn()
        .mockResolvedValueOnce({
            Body: fs.createReadStream('./tests/__data__/879765/block.json'),
        })
        .mockResolvedValueOnce({
            Body: fs.createReadStream('./tests/__data__/879765/shard_0.json'),
        }),
    } as any as S3Client;

    const bucket = 'bucket';
    const blockHeight = 879765;
    const streamerMessage = await fetchStreamerMessage(client, bucket, blockHeight);

    expect(client.send).toBeCalledTimes(2);
    expect(JSON.stringify((client.send as jest.Mock).mock.calls[0][0])).toEqual(
      JSON.stringify(
        new GetObjectCommand({
          Bucket: bucket,
          Key: `000000${blockHeight}/block.json`,
          RequestPayer: 'requester'
        })
      )
    );
    expect(JSON.stringify((client.send as jest.Mock).mock.calls[1][0])).toEqual(
      JSON.stringify(
        new GetObjectCommand({
          Bucket: bucket,
          Key: `000000${blockHeight}/shard_0.json`,
          RequestPayer: 'requester'
        })
      )
    );

    const delegateAction = {
      Delegate: {
        delegateAction: {
          senderId: "test.near",
          receiverId: "test.near",
          actions: [
            {
              AddKey: {
                publicKey: "ed25519:CnQMksXTTtn81WdDujsEMQgKUMkFvDJaAjDeDLTxVrsg",
                accessKey: {
                  nonce: 0,
                  permission: "FullAccess"
                }
              }
            }
          ],
          nonce: 879546,
          maxBlockHeight: 100,
          publicKey: "ed25519:8Rn4FJeeRYcrLbcrAQNFVgvbZ2FCEQjgydbXwqBwF1ib"
        },
        signature: "ed25519:25uGrsJNU3fVgUpPad3rGJRy2XQum8gJxLRjKFCbd7gymXwUxQ9r3tuyBCD6To7SX5oSJ2ScJZejwqK1ju8WdZfS"
      }
    };
    expect(streamerMessage.shards[0].chunk?.transactions[0].transaction.actions[0]).toEqual(delegateAction);
    expect(streamerMessage.shards[0].chunk?.receipts[0].receipt['Action'].actions[0]).toEqual(delegateAction);
    expect(streamerMessage.shards[0].receiptExecutionOutcomes[0].receipt?.receipt['Action'].actions[0]).toEqual(delegateAction);
  });
});
