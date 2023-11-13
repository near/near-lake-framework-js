import { readFile } from 'fs/promises';

import { Block } from '../src/types';

describe('Block', () => {
  it('parses event logs', async () => {
    let streamerMessageBuffer = await readFile(`${__dirname}/../../../blocks/61321189.json`);
    let streamerMessage = JSON.parse(streamerMessageBuffer.toString());
    let block = Block.fromStreamerMessage(streamerMessage);

    expect(block.events()).toMatchSnapshot();
  })
});
