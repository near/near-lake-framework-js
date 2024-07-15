import { getBlock } from "./helpers";

describe("Block", () => {
  describe("functionCalls", () => {
    it("gets single failed function call in 114158749", async () => {
      let block = await getBlock(114158749);
      const functionCalls = block.functionCalls("*", "onlyFailed");
      expect(functionCalls.length).toEqual(1);
    });

    it("gets args for devgovgigs.near add_post to in 114158749", async () => {
      let block = await getBlock(114158749);
      const functionCalls = block.functionCalls("devgovgigs.near", "all");
      expect(functionCalls.length).toEqual(1);
      const call = functionCalls[0];
      expect(call.methodName).toEqual("add_post");
      const jsonArgs = call.argsAsJSON();
      expect(jsonArgs).toHaveProperty("parent_id");
      expect(jsonArgs).toHaveProperty("labels");
      expect(jsonArgs).toHaveProperty("body");

      expect(call).toEqual(
        block.functionCallsToReceiver("devgovgigs.near", "add_post")[0]
      );
    });

    it("allows to extract ft_transfer events from function calls to token.sweat", async () => {
      const block = await getBlock(114158749);
      const functionCalls = block.functionCallsToReceiver(
        "token.sweat",
        "ft_transfer"
      );
      expect(functionCalls.length).toEqual(17);
      expect(
        functionCalls
          .flatMap((fc) => fc.events)
          .every((event) => event.standard === "nep141")
      ).toBeTruthy();
    });
  });
});
