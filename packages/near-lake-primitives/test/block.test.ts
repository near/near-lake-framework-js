import { readFile } from 'fs/promises';

import { Block } from '../src/types';

describe('Block', () => {
  it('serializes meta transactions', async () => {
    let streamerMessageBuffer = await readFile(`${__dirname}/../../../blocks/105793821.json`);
    let streamerMessage = JSON.parse(streamerMessageBuffer.toString());
    let block = Block.fromStreamerMessage(streamerMessage);

    const actions = block.actionByReceiptId('Dpego7SpsK36PyXjUMrFoSze8ZpNsB9xhb3XJJYtXSix');
    expect(actions?.operations[0]).toMatchSnapshot();
  });
});
