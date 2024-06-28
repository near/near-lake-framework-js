import {
  isMatchingReceiptStatus,
  isMatchingReceiver,
  isMatchingReceiverSingle,
} from "../src/helpers";
import { ExecutionStatus, ReceiptStatusFilter } from "../src/types/core/types";
import { describe } from "node:test";

describe("Helpers", () => {
  describe("isMatchingReceiverSingle", () => {
    it("should match wildcard", () => {
      expect(isMatchingReceiverSingle("test", "*")).toBeTruthy();
    });

    it("should not match different contract", () => {
      expect(isMatchingReceiverSingle("test", "acc.near")).toEqual(false);
    });

    it("should match sub-sub-account", () => {
      expect(isMatchingReceiverSingle("a.acc.near", "*.acc.near")).toEqual(
        true
      );
    });

    it("should match sub-sub-account", () => {
      expect(isMatchingReceiverSingle("a.b.acc.near", "*.acc.near")).toEqual(
        true
      );
    });
  });

  describe("isMatchingReceiver", () => {
    it("should match wildcard", () => {
      expect(isMatchingReceiver("test", "*")).toEqual(true);
    });
    it("should not match different contract", () => {
      expect(isMatchingReceiverSingle("test", "test1")).toEqual(false);
    });
  });

  describe("isMatchingReceiptStatus", () => {
    const table: {
      receiptStatus: ExecutionStatus;
      statusFilter: ReceiptStatusFilter;
      expected: boolean;
    }[] = [
      {
        receiptStatus: { SuccessValue: new Uint8Array() },
        statusFilter: "all",
        expected: true,
      },
      {
        receiptStatus: { SuccessValue: new Uint8Array() },
        statusFilter: "onlyFailed",
        expected: false,
      },
      {
        receiptStatus: { SuccessValue: new Uint8Array() },
        statusFilter: "onlySuccessful",
        expected: true,
      },
      {
        receiptStatus: { Failure: "" },
        statusFilter: "onlySuccessful",
        expected: false,
      },
      {
        receiptStatus: { Failure: "" },
        statusFilter: "onlyFailed",
        expected: true,
      },
    ];
    it.each(table)(
      "should return `$expected` for `$receiptStatus` with filter `$statusFilter`",
      ({ receiptStatus, statusFilter, expected }) => {
        expect(isMatchingReceiptStatus(receiptStatus, statusFilter)).toEqual(
          expected
        );
      }
    );
  });
});
