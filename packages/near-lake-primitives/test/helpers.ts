import { readFile } from "fs/promises";
import { Block } from "../src";

export async function getBlock(blockHeight: number) {
  const streamerMessageBuffer = await readFile(
    `${__dirname}/../../../blocks/${blockHeight}.json`
  );
  const streamerMessage = JSON.parse(streamerMessageBuffer.toString());
  return Block.fromStreamerMessage(streamerMessage);
}