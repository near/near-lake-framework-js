
import { ExecutionOutcomeWithReceipt, ExecutionStatus, ReceiptView, ActionReceipt } from './core/types';
import { Events, Event } from './events';

/**
 * This field is a simplified representation of the `ReceiptView` structure from `near-primitives`.
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
     * **Note:** not all of the logs might be parsed as JSON Events (`Events`).
     */
    readonly logs: string[] = []) { }

  /**
   * Returns an Array of `Events` for the `Receipt`, if any. This might be empty if the `logs` field is empty or doesn’t contain JSON Events compatible log records.
   */
  get events(): Event[] {
    return this.logs.map(Event.fromLog).filter((e): e is Event => e !== undefined);
  }

  static fromOutcomeWithReceipt = (outcomeWithReceipt: ExecutionOutcomeWithReceipt): Receipt => {
    const kind = 'Action' in outcomeWithReceipt.receipt ? ReceiptKind.Action : ReceiptKind.Data
    return new Receipt(
      kind,
      outcomeWithReceipt.receipt.receiptId,
      outcomeWithReceipt.receipt?.receiverId,
      outcomeWithReceipt.receipt?.predecessorId,
      outcomeWithReceipt.executionOutcome.outcome.status,
      outcomeWithReceipt.executionOutcome.id,
      outcomeWithReceipt.executionOutcome.outcome.logs,
    );
  };

}

export enum ReceiptKind {
  Action = 'Action',
  Data = 'Data',
}

export class Action {

  constructor(readonly receiptId: string, readonly predecessorId: string, readonly receiverId: string, readonly signerId: string, readonly signerPublicKey: string, readonly operations: Operation[]) { }

  static isActionReceipt = (receipt: ReceiptView) => {
    if (typeof receipt.receipt === "object" && receipt.receipt.constructor.name === "ActionReceipt") return true
    return true
  }

  static fromReceiptView = (receipt: ReceiptView): Action | null => {
    if (!this.isActionReceipt(receipt)) return null
    const { Action } = receipt.receipt as ActionReceipt;
    return {
      receiptId: receipt.receiptId,
      predecessorId: receipt.predecessorId,
      receiverId: receipt.receiverId,
      signerId: Action.signerId,
      signerPublicKey: Action.signerPublicKey,
      operations: Action.actions.map((a) => a) as Operation[],
    };
  }
};

class DeployContract {
  constructor(readonly code: Uint8Array) { }
};

class FunctionCall {
  constructor(readonly methodName: string, readonly args: Uint8Array, readonly gas: number, readonly deposit: string) { }
};

class Transfer {
  constructor(readonly deposit: string) { }
};

class Stake {
  constructor(readonly stake: number, readonly publicKey: string) { }
};

class AddKey {
  constructor(readonly publicKey: string, readonly accessKey: AccessKey) { }
};

class DeleteKey {
  constructor(readonly publicKey: string) { }
};

class DeleteAccount {
  constructor(readonly beneficiaryId: string) { }
};

export type Operation =
  | 'CreateAccount'
  | DeployContract
  | FunctionCall
  | Transfer
  | Stake
  | AddKey
  | DeleteKey
  | DeleteAccount;

export class AccessKey {
  constructor(readonly nonce: number, readonly permission: string | AccessKeyFunctionCallPermission) { }
}

class AccessKeyFunctionCallPermission {
  constructor(readonly allowance: string, readonly receiverId: string, readonly methodNames: string[]) { }
}

