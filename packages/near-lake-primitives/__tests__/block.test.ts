import { Block } from "../src/types/block";
const fs = require("fs");

const mockData = JSON.parse(
  fs.readFileSync("__tests__/streamer-message-mocks/100596707.json", "utf8")
);

describe("Block class", () => {
  let block: Block;
  beforeEach(() => {
    block = Block.fromStreamerMessage(mockData);
  });

  it("should correctly get blockHash", () => {
    console.log(block.blockHash)
    expect(block.blockHash).toEqual(mockData.block.header.hash);
  });

  it("should correctly get prevBlockHash", () => {
    expect(block.prevBlockHash).toEqual(mockData.block.header.prevHash);
  });

  it("should correctly get blockHeight", () => {
    expect(block.blockHeight).toEqual(mockData.block.header.height);
  });
});
