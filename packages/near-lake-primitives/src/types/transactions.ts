import { ExecutionStatus } from './core/types';
import { Operation } from './receipts';

/**
 * A representation of the `IndexerTransactionWithOutcome` from `near-indexer-primitives` which is an ephemeral structure combining `SignedTransactionView` from [near-primitives](https://github.com/near/nearcore/tree/master/core/primitives) and `IndexerExecutionOutcomeWithOptionalReceipt` from `near-indexer-primitives`.
 *
 * This structure is very similar to `Receipt`. Unlike `Receipt`, a `Transaction` has a few additional fields like `signerId`, `signature`, and `operations`.
 */
export class Transaction {
    constructor(
		/**
		 * Returns the hash of the `Transaction` in `CryptoHash`.
		 */
    	readonly transactionHash: string, 

		/**
		 * Returns the signer account id of the `Transaction`.
		 */
    	readonly signerId: string, 

		/**
		 * Returns the `PublicKey` of the signer of the `Transaction`.
		 */
    	readonly signerPublicKey: string, 

		/**
		 * Returns the `Signature` the `Transaction` was signed with.
		 */
    	readonly signature: string, 

		/**
		 * Returns the receiver account id of the `Transaction`.
		 */
    	readonly receiverId: string, 

		/**
		 * Returns the status of the `Transaction` as `ExecutionStatus`.
		 */
    	readonly status: ExecutionStatus, 

		/**
		 * Returns the id of the `ExecutionOutcome` for the `Transaction`.
		 */
    	readonly executionOutcomeId: string, 

		/**
		 * Returns an Array of `Operation` for the `Transaction`.
		 */
    	readonly operations: Operation[]) { }
}
