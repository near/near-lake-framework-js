import { ExecutionStatus } from './core/types';
import { Operation } from './receipts';

export type Transaction = {
    readonly transactionHash: string;
    readonly signerId: string;
    readonly signerPublicKey: string;
    readonly signature: string;
    readonly receiverId: string;
    readonly status: ExecutionStatus;
    readonly executionOutcomeId: string;
    readonly operations: Array<Operation>;
}

