import { getBlock } from "./helpers";

describe("Block", () => {
  describe("functionCalls", () => {
    it("gets successful function calls", async () => {
      let block = await getBlock(105793821);
      const functionCalls = block.functionCalls();
      console.log(JSON.stringify(functionCalls, null, 2));

    });
  });
});
