import {
  ExecutionOutcomeWithReceipt,
  ExecutionStatus,
  ReceiptView,
  ActionReceipt,
} from "./core/types";
import { Events, Event, RawEvent } from "./events";

/**
 * This field is a simplified representation of the `ReceiptView` structure from [near-primitives](https://github.com/near/nearcore/tree/master/core/primitives).
 */
export class Receipt implements Events {
  constructor(
    /**
     * Defined the type of the `Receipt`: `Action` or `Data` representing the `ActionReceipt` and `DataReceipt`.
     */
    readonly receiptKind: ReceiptKind,

    /**
     * The ID of the `Receipt` of the `CryptoHash` type.
     */
    readonly receiptId: string,

    /**
     * The receiver account id of the `Receipt`.
     */
    readonly receiverId: string,

    /**
     * The predecessor account id of the `Receipt`.
     */
    readonly predecessorId: string,

    /**
     * Represents the status of `ExecutionOutcome` of the `Receipt`.
     */
    readonly status: ExecutionStatus,

    /**
     * The id of the `ExecutionOutcome` for the `Receipt`. Returns `null` if the `Receipt` isn’t executed yet and has a postponed status.
     */
    readonly executionOutcomeId?: string | undefined,

    /**
     * The original logs of the corresponding `ExecutionOutcome` of the `Receipt`.
     *
     * **Note:** not all the logs might be parsed as JSON Events (`Events`).
     */
    readonly logs: string[] = []
  ) {}

  /**
   * Returns an Array of `Events` for the `Receipt`, if any. This might be empty if the `logs` field is empty or doesn’t contain JSON Events compatible log records.
   */
  get events(): Event[] {
    return this.logs
      .filter((log) => RawEvent.isEvent(log))
      .map((log) => Event.fromLog(log, this.receiptId));
  }

  static fromOutcomeWithReceipt = (
    outcomeWithReceipt: ExecutionOutcomeWithReceipt
  ): Receipt => {
    const kind =
      "Action" in outcomeWithReceipt.receipt
        ? ReceiptKind.Action
        : ReceiptKind.Data;
    return new Receipt(
      kind,
      outcomeWithReceipt.receipt.receiptId,
      outcomeWithReceipt.receipt?.receiverId,
      outcomeWithReceipt.receipt?.predecessorId,
      outcomeWithReceipt.executionOutcome.outcome.status,
      outcomeWithReceipt.executionOutcome.id,
      outcomeWithReceipt.executionOutcome.outcome.logs
    );
  };
}

/**
 * `ReceiptKind` a simple `enum` to represent the `Receipt` type: either `Action` or `Data`.
 */
export enum ReceiptKind {
  Action = "Action",
  Data = "Data",
}

/**
 * `Action` is the structure with the fields and data relevant to an `ActionReceipt`.
 *
 * Basically, `Action` is the structure that indexer developers will be encouraged to work the most in their action-oriented indexers.
 */
export class Action {
  constructor(
    /**
     * The id of the corresponding `Receipt`
     */
    readonly receiptId: string,

    /**
     * The status of the corresponding `Receipt`
     */
    readonly receiptStatus: ExecutionStatus,

    /**
     * The predecessor account id of the corresponding `Receipt`.
     * This field is a piece of denormalization of the structures (`Receipt` and `Action`).
     */
    readonly predecessorId: string,

    /**
     * The receiver account id of the corresponding `Receipt`.
     * This field is a piece of denormalization of the structures (`Receipt` and `Action`).
     */
    readonly receiverId: string,

    /**
     * The signer account id of the corresponding `Receipt`
     */
    readonly signerId: string,

    /**
     * The signer’s PublicKey for the corresponding `Receipt`
     */
    readonly signerPublicKey: string,

    /**
     * An array of `Operation` for this `ActionReceipt`
     */
    readonly operations: Operation[],

    /**
     * An array of log messages for this `ActionReceipt`
     */
    readonly logs: string[] = []
  ) {}

  /**
   * An array of events complying to NEP-0297 standard for this `ActionReceipt`
   */
  get events(): Event[] {
    return this.logs
      .filter(RawEvent.isEvent)
      .map((log) => Event.fromLog(log, this.receiptId));
  }

  static isActionReceipt = (receipt: ReceiptView) => {
    return (
      typeof receipt.receipt === "object" &&
      Object(receipt.receipt).hasOwnProperty("Action")
    );
  };

  static fromOutcomeWithReceipt = (
    outcomeWithReceipt: ExecutionOutcomeWithReceipt
  ): Action | null => {
    if (!this.isActionReceipt(outcomeWithReceipt.receipt)) return null;
    const receiptView = outcomeWithReceipt.receipt;
    const { Action: action } = receiptView.receipt as ActionReceipt;
    return new Action(
      receiptView.receiptId,
      outcomeWithReceipt.executionOutcome.outcome.status,
      receiptView.predecessorId,
      receiptView.receiverId,
      action.signerId,
      action.signerPublicKey,
      action.actions.map((a) => a) as Operation[],
      outcomeWithReceipt.executionOutcome.outcome.logs
    );
  };
}

export class DeployContract {
  constructor(readonly code: Uint8Array) {}
}

export class FunctionCall {
  constructor(
    readonly methodName: string,
    readonly args: string,
    readonly gas: number,
    readonly deposit: string
  ) {}
}

export class Transfer {
  constructor(readonly deposit: string) {}
}

export class Stake {
  constructor(readonly stake: number, readonly publicKey: string) {}
}

export class AddKey {
  constructor(readonly publicKey: string, readonly accessKey: AccessKey) {}
}

export class DeleteKey {
  constructor(readonly publicKey: string) {}
}

export class DeleteAccount {
  constructor(readonly beneficiaryId: string) {}
}

/**
 * A representation of the original `ActionView` from [near-primitives](https://github.com/near/nearcore/tree/master/core/primitives).
 */
export type Operation =
  | "CreateAccount"
  | DeployContract
  | FunctionCall
  | Transfer
  | Stake
  | AddKey
  | DeleteKey
  | DeleteAccount;

export class AccessKey {
  constructor(
    readonly nonce: number,
    readonly permission: string | AccessKeyFunctionCallPermission
  ) {}
}

class AccessKeyFunctionCallPermission {
  constructor(
    readonly allowance: string,
    readonly receiverId: string,
    readonly methodNames: string[]
  ) {}
}
