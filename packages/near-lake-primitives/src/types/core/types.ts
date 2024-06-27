import { FunctionCall } from "../receipts";

export type BlockHeight = number;

export interface StreamerMessage {
  block: BlockView;
  shards: Shard[];
}

export interface BlockView {
  author: string;
  header: BlockHeaderView;
  chunks: ChunkHeader[];
}
export interface BlockHeaderView {
  author: any;
  approvals: (string | null)[];
  blockMerkleRoot: string;
  blockOrdinal: number;
  challengesResult: ChallengeResult[];
  challengesRoot: string;
  chunkHeadersRoot: string;
  chunkMask: boolean[];
  chunkReceiptsRoot: string;
  chunkTxRoot: string;
  chunksIncluded: number;
  epochId: string;
  epochSyncDataHash: string | null;
  gasPrice: string;
  hash: string;
  height: number;
  lastDsFinalBlock: string;
  lastFinalBlock: string;
  latestProtocolVersion: number;
  nextBpHash: string;
  nextEpochId: string;
  outcomeRoot: string;
  prevHash: string;
  prevHeight: number;
  prevStateRoot: string;
  randomValue: string;
  rentPaid: string;
  signature: string;
  timestamp: number;
  timestampNanosec: string;
  totalSupply: string;
  validatorProposals: [];
  validatorReward: string;
}

export interface Shard {
  shardId: number;
  chunk?: ChunkView;
  receiptExecutionOutcomes: ExecutionOutcomeWithReceipt[];
  stateChanges: StateChangeWithCauseView[];
}

export type ValidatorStakeView = {
  accountId: string;
  publicKey: string;
  stake: string;
  validatorStakeStructVersion: string;
};

type ChallengeResult = {
  accountId: string;
  isDoubleSign: boolean;
};

interface ChunkHeader {
  balanceBurnt: number;
  chunkHash: string;
  encodedLength: number;
  encodedMerkleRoot: string;
  gasLimit: number;
  gasUsed: number;
  heightCreated: number;
  heightIncluded: number;
  outcomeRoot: string;
  outgoingReceiptsRoot: string;
  prevBlockHash: string;
  prevStateRoot: string;
  rentPaid: string;
  shardId: number;
  signature: string;
  txRoot: string;
  validatorProposals: ValidatorProposal[];
  validatorReward: string;
}

type ValidatorProposal = {
  accountId: string;
  publicKey: string;
  stake: string;
  validatorStakeStructVersion: string;
};

interface ChunkView {
  author: string;
  header: ChunkHeader;
  receipts: ReceiptView[];
  transactions: IndexerTransactionWithOutcome[];
}

export type ActionReceipt = {
  Action: {
    actions: ActionView[];
    gasPrice: string;
    inputDataIds: string[];
    outputDataReceivers: DataReceiver[];
    signerId: string;
    signerPublicKey: string;
  };
};

export type DataReceipt = {
  Data: {
    data: string;
    dataId: string;
  };
};

type ReceiptEnum = ActionReceipt | DataReceipt;

type DataReceiver = {
  dataId: string;
  receiverId: string;
};

export type ReceiptView = {
  predecessorId: string;
  receiptId: string;
  receiverId: string;

  receipt: ReceiptEnum;
};

/**
 * `ExecutionStatus` is a simplified representation of the `ExecutionStatusView` from [near-primitives](https://github.com/near/nearcore/tree/master/core/primitives). Represent the execution outcome status for the `Receipt`.
 */
export type ExecutionStatus =
  | {
      /**
       * Execution succeeded with a value, value is represented by `Uint8Array` and can be anything.
       */
      SuccessValue: Uint8Array;
    }
  | {
      /**
       * Execution succeeded and a result of the execution is a new `Receipt` with the id.
       */
      SuccessReceiptId: string;
    }
  | {
      /**
       * Execution failed with an error represented by a `String`.
       */
      Failure: string;
    }
  | "Postponed";

type ExecutionProof = {
  direction: string;
  hash: string;
};

export type ReceiptExecutionOutcome = {
  executorId: string;
  gasBurnt: number;
  logs: string[];
  metadata: {
    gasProfile: string | null;
    version: number;
  };
  receiptIds: string[];
  status: ExecutionStatus;
  tokensBurnt: string;
}

export type ExecutionOutcomeWithReceipt = {
  executionOutcome: {
    blockHash: string;
    id: string;
    outcome: ReceiptExecutionOutcome;
    proof: ExecutionProof[];
  };
  receipt: ReceiptView;
};

type IndexerTransactionWithOutcome = {
  transaction: Transaction;
  outcome: ExecutionOutcomeWithReceipt;
};

type Transaction = {
  signerId: string;
  publicKey: string;
  nonce: number;
  receiverId: string;
  actions: ActionView[];
  signature: string;
  hash: string;
};

type DeployContractAction = {
  DeployContract: {
    code: string;
  };
};

type FunctionCallAction = {
  FunctionCall: {
    methodName: string;
    args: string;
    gas: number;
    deposit: string;
  };
};

type TransferAction = {
  Transfer: {
    deposit: string;
  };
};

type StakeAction = {
  Stake: {
    stake: number;
    publicKey: string;
  };
};

type AddKeyAction = {
  AddKey: {
    publicKey: string;
    accessKey: AccessKey;
  };
};

interface AccessKey {
  nonce: number;
  permission: string | AccessKeyFunctionCallPermission;
}

interface AccessKeyFunctionCallPermission {
  FunctionCall: {
    allowance: string;
    receiverId: string;
    methodNames: string[];
  };
}

type DeleteKeyAction = {
  DeleteKey: {
    publicKey: string;
  };
};

type DeleteAccountAction = {
  DeleteAccount: {
    beneficiaryId: string;
  };
};

export type DelegateAction = {
  Delegate: {
    delegateAction: {
      senderId: string;
      receiverId: string;
      actions: NonDelegateAction[];
      nonce: number;
      maxBlockHeight: number;
      publicKey: string;
    };
  };
  signature: string;
};

// Delegate actions can not contain other delegate actions
export type NonDelegateAction =
  | "CreateAccount"
  | DeployContractAction
  | FunctionCallAction
  | TransferAction
  | StakeAction
  | AddKeyAction
  | DeleteKeyAction
  | DeleteAccountAction;

type ActionView =
  | "CreateAccount"
  | DeployContractAction
  | FunctionCallAction
  | TransferAction
  | StakeAction
  | AddKeyAction
  | DeleteKeyAction
  | DeleteAccountAction
  | DelegateAction;

export type StateChangeWithCauseView = {
  change: {
    accountId: string;
    keyBase64: string;
    valueBase64: string;
  };
  cause: {
    receiptHash: string;
    type: string;
  };
  value: {
    accountId: string;
    keyBase64: string;
    valueBase64: string;
  };
  type: string;
};

export type ReceiptStatusFilter = "all"|"onlySuccessful"|"onlyFailed";

export class FunctionCallView {
  constructor(
    readonly methodName: string,
    readonly args: JSON,
    readonly gas: number,
    readonly deposit: string
  ) {}

  static fromFunctionCall(functionCall: FunctionCall): FunctionCallView {
    return new FunctionCallView(
      functionCall.methodName,
      JSON.parse(Buffer.from(functionCall.args).toString('ascii')),
      functionCall.gas,
      functionCall.deposit
    )
  }
}