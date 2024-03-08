import * as borsh from "borsh";
export * from "borsher";

export const fromBorsh = (schema: borsh.Schema, encoded: Uint8Array) =>
  borsh.deserialize(schema, encoded);
