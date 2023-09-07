import { Block, Receipt } from "../src/types";
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
    expect(block.blockHash).toEqual(mockData.block.header.hash);
  });

  it("should correctly get prevBlockHash", () => {
    expect(block.prevBlockHash).toEqual(mockData.block.header.prevHash);
  });

  it("should correctly get blockHeight", () => {
    expect(block.blockHeight).toEqual(mockData.block.header.height);
  });

  it("should return executed receipts", () => {
    const receipts = block.receipts();
    expect(receipts).toBeInstanceOf(Array);
    expect(receipts[0]).toBeInstanceOf(Receipt);
  });

  it("should return actions from receipts", () => {
    const actions = block.actions();
    expect(actions[0]).toHaveProperty('receiptId');
    expect(actions[0]).toHaveProperty('signerId');

  });

  it("should return events from logs", () => {
    const events = block.events();
    expect(events).toBeInstanceOf(Array);
    expect(events[0]).toHaveProperty("relatedReceiptId");
    expect(events[0]).toHaveProperty("rawEvent");
  });

});
