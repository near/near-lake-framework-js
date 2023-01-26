
import { ExecutionOutcomeWithReceipt, ExecutionStatus } from './core/types';
import { Events, logToEvent } from './events';
import { Event } from './events';

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
    return this.logs.map(logToEvent);
  }

}

export enum ReceiptKind {
  Action = 'Action',
  Data = 'Data',
}

export const outcomeWithReceiptToReceipt = (outcomeWithReceipt: ExecutionOutcomeWithReceipt): Receipt => {
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

export interface Action {
  readonly receiptId: string;
  readonly predecessorId: string;
  readonly receiverId: string;
  readonly signerId: string;
  readonly signerPublicKey: string;
  readonly operations: Operation[];
};

export type DeployContract = {
  DeployContract: {
    code: Uint8Array;
  };
};

export type FunctionCall = {
  FunctionCall: {
    methodName: string;
    args: Uint8Array;
    gas: number;
    deposit: string;
  };
};

export type Transfer = {
  Transfer: {
    deposit: string;
  };
};

export type Stake = {
  Stake: {
    stake: number;
    publicKey: string;
  };
};

export type AddKey = {
  AddKey: {
    publicKey: string;
    accessKey: AccessKey;
  };
};

export type DeleteKey = {
  DeleteKey: {
    publicKey: string;
  };
};

export type DeleteAccount = {
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

export interface AccessKey {
  nonce: number;
  permission: string | AccessKeyFunctionCallPermission;
}

export interface AccessKeyFunctionCallPermission {
  FunctionCall: {
    allowance: string;
    receiverId: string;
    methodNames: string[];
  }
}

