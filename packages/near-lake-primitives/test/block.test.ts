import { borsh } from "../src";
import { getBlock } from "./helpers";

describe("Block", () => {
  it("serializes meta transactions", async () => {
    const block = await getBlock(105793821);

    const actions = block.actionByReceiptId(
      "Dpego7SpsK36PyXjUMrFoSze8ZpNsB9xhb3XJJYtXSix"
    );
    expect(actions?.operations[0]).toMatchSnapshot();
  });

  it("parses event logs", async () => {
    const block = await getBlock(61321189);

    expect(block.events()).toMatchSnapshot();
  });

  function base64toHex(encodedValue: string) {
    let buff = Buffer.from(encodedValue, "base64");
    return buff.toString("hex");
  }

  it("deserializes using borsch", async () => {
    const block = await getBlock(114158749);

    const stateChanges = block.streamerMessage.shards
      .flatMap((e) => e.stateChanges)
      .filter(
        (stateChange) =>
          stateChange.change.accountId === "devgovgigs.near" &&
          stateChange.type === "data_update"
      );

    const addOrEditPost = stateChanges
      .map((stateChange) => stateChange.change)
      .filter((change) => base64toHex(change.keyBase64).startsWith("05"))
      .map((c) => ({
        k: Buffer.from(c.keyBase64, "base64"),
        v: Buffer.from(c.valueBase64, "base64"),
      }));

    const authorToPostId = Object.fromEntries(
      addOrEditPost.map((kv) => {
        return [
          kv.v
            .slice(13, 13 + kv.v.slice(9, 13).readUInt32LE())
            .toString("utf-8"),
          Number(kv.k.slice(1).readBigUInt64LE()),
        ];
      })
    );

    expect(
      borsh.fromBorsh("u64", addOrEditPost[0].k.slice(1)) ===
        addOrEditPost[0].k.slice(1).readBigUInt64LE()
    );
    expect(
      borsh.fromBorsh("u32", addOrEditPost[0].v.slice(9, 13)) ===
        addOrEditPost[0].v.slice(9, 13).readUInt32LE()
    );
    expect(authorToPostId).toMatchSnapshot();
  });
});
