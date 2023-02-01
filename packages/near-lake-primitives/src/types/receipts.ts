
import { ExecutionOutcomeWithReceipt, ExecutionStatus, ReceiptView, ActionReceipt } from './core/types';
import { Events, Event } from './events';

export class Receipt implements Events {
  constructor(readonly receiptKind: ReceiptKind, readonly receiptId: string, readonly receiverId: string, readonly predecessorId: string, readonly status: ExecutionStatus, readonly executionOutcomeId?: string | undefined, readonly logs: string[] = []) { }

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

