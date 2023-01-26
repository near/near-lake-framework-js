export interface StreamerMessage {
    block: BlockView;
    shards: Shard[];
}

export interface BlockView {
    author: string;
    header: BlockHeader;
    chunks: ChunkHeader[];
}

export type ValidatorStake = {
    accountId: string;
    publicKey: string;
    stake: string;
    validatorStakeStructVersion: string;
};

export type ChallengeResult = {
    accountId: string;
    isDoubleSign: boolean;
};

export interface BlockHeader {
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
    stateChanges: StateChange[];
}

export interface ChunkHeader {
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

export type ValidatorProposal = {
    accountId: string;
    publicKey: string;
    stake: string;
    validatorStakeStructVersion: string;
};


export interface ChunkView {
    author: string;
    header: ChunkHeader;
    receipts: ReceiptView[];
    transactions: IndexerTransactionWithOutcome[];
}

export type ReceiptEnum =
    | {
        Action: {
            actions: ActionView[];
            gasPrice: string;
            inputDataIds: string[];
            outputDataReceivers: DataReceiver[];
            signerId: string;
            signerPublicKey: string;
        };
    }
    | {
        Data: {
            data: string;
            dataId: string;
        };
    };

export type DataReceiver = {
    dataId: string,
    receiverId: string,
};

export type ReceiptView = {
    predecessorId: string;
    receiptId: string;
    receiverId: string;

    receipt: ReceiptEnum;
};

export type ExecutionStatus =
    | { SuccessValue: Uint8Array }
    | { SuccessReceiptId: string }
    | { Failure: string }
    | 'Postponed'

export type ExecutionProof = {
    direction: string;
    hash: string;
};

export type ExecutionOutcomeWithReceipt = {
    executionOutcome: {
        blockHash: string;
        id: string;
        outcome: {
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
        };
        proof: ExecutionProof[];
    };
    receipt: ReceiptView;
};

export type IndexerTransactionWithOutcome = {
    transaction: Transaction;
    outcome: ExecutionOutcomeWithReceipt;
};


export type Transaction = {
    signerId: string;
    publicKey: string;
    nonce: number;
    receiverId: string;
    actions: ActionView[];
    signature: string;
    hash: string;
};

export type DeployContractAction = {
    DeployContract: {
        code: string;
    };
};

export type FunctionCallAction = {
    FunctionCall: {
        methodName: string;
        args: string;
        gas: number;
        deposit: string;
    };
};

export type TransferAction = {
    Transfer: {
        deposit: string;
    };
};

export type StakeAction = {
    Stake: {
        stake: number;
        publicKey: string;
    };
};

export type AddKeyAction = {
    AddKey: {
        publicKey: string;
        accessKey: AccessKey;
    };
};

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

export type DeleteKeyAction = {
    DeleteKey: {
        publicKey: string;
    };
};

export type DeleteAccountAction = {
    DeleteAccount: {
        beneficiaryId: string;
    };
};

export type ActionView =
    | 'CreateAccount'
    | DeployContractAction
    | FunctionCallAction
    | TransferAction
    | StakeAction
    | AddKeyAction
    | DeleteKeyAction
    | DeleteAccountAction;


export type StateChange = {
    cause: {
        receiptHash: string;
        type: string;
    };
    change: {
        accountId: string;
        keyBase64: string;
        valueBase64: string;
    };
    type: string;
};
