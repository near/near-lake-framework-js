import { ExecutionStatus } from './core/types';
import { Operation } from './receipts';

export interface Transaction {
    readonly transactionHash: string;
    readonly signerId: string;
    readonly signerPublicKey: string;
    readonly signature: string;
    readonly receiverId: string;
    readonly status: ExecutionStatus;
    readonly executionOutcomeId: string;
    readonly operations: Array<Operation>;
}

