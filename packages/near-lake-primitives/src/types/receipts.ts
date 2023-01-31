
import { ExecutionOutcomeWithReceipt, ExecutionStatus, ReceiptView, ActionReceipt } from './core/types';
import { Events, Event } from './events';

export class Receipt implements Events {
  readonly receiptKind: ReceiptKind;
  readonly receiptId: string;
  readonly receiverId: string;
  readonly predecessorId: string;
  readonly status: ExecutionStatus;
  readonly executionOutcomeId?: string | undefined;
  readonly logs: string[];

  constructor(receiptKind: ReceiptKind, receiptId: string, receiverId: string, predecessorId: string, status: ExecutionStatus, executionOutcomeId?: string, logs?: string[]) {
    this.receiptKind = receiptKind;
    this.receiptId = receiptId;
    this.receiverId = receiverId;
    this.predecessorId = predecessorId;
    this.executionOutcomeId = executionOutcomeId;
    this.logs = logs || [];
    this.status = status;
  }

  get events(): Event[] {
    return this.logs.map(Event.fromLog);
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
  readonly receiptId: string;
  readonly predecessorId: string;
  readonly receiverId: string;
  readonly signerId: string;
  readonly signerPublicKey: string;
  readonly operations: Operation[];

  constructor(receiptId: string, predecessorId: string, receiverId: string, signerId: string, signerPublicKey: string, operations: Operation[]) {
    this.receiptId = receiptId;
    this.predecessorId = predecessorId;
    this.receiverId = receiverId;
    this.signerId = signerId;
    this.signerPublicKey = signerPublicKey;
    this.operations = operations;
  }

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

