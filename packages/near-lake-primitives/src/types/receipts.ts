
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

type DeployContract = {
  DeployContract: {
    code: Uint8Array;
  };
};

type FunctionCall = {
  FunctionCall: {
    methodName: string;
    args: Uint8Array;
    gas: number;
    deposit: string;
  };
};

type Transfer = {
  Transfer: {
    deposit: string;
  };
};

type Stake = {
  Stake: {
    stake: number;
    publicKey: string;
  };
};

type AddKey = {
  AddKey: {
    publicKey: string;
    accessKey: AccessKey;
  };
};

type DeleteKey = {
  DeleteKey: {
    publicKey: string;
  };
};

type DeleteAccount = {
  DeleteAccount: {
    beneficiaryId: string;
  };
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

export type AccessKey = {
  nonce: number;
  permission: string | AccessKeyFunctionCallPermission;
}

type AccessKeyFunctionCallPermission = {
  FunctionCall: {
    allowance: string;
    receiverId: string;
    methodNames: string[];
  }
}

