import { Action, Receipt } from './receipts';
import { StreamerMessage, ValidatorStakeView } from './core/types';
import { Transaction } from './transactions';
import { Event, RawEvent, Log } from './events';
import { StateChange } from './stateChanges';

/**
 * The `Block` type is used to represent a block in the NEAR Lake Framework.
 *
 * **Important Notes on `Block`:**
 * - All the entities located on different shards were merged into one single list without differentiation.
 * - `Block` is not the fairest name for this structure either. NEAR Protocol is a sharded blockchain, so its block is actually an ephemeral structure that represents a collection of real blocks called chunks in NEAR Protocol.
 */
export class Block {
    constructor(
        /**
         * Low-level structure for backward compatibility.
         * As implemented in previous versions of [`near-lake-framework`](https://www.npmjs.com/package/near-lake-framework).
         */
        readonly streamerMessage: StreamerMessage,
        private executedReceipts: Receipt[],
        /**
         * Receipts included on the chain but not executed yet marked as “postponed”: they are represented by the same structure `Receipt` (see the corresponding section in this doc for more details).
         */
        readonly postponedReceipts: Receipt[],
        /**
         * List of included `Transactions`, converted into `Receipts`.
         *
         * **_NOTE_:** Heads up! You might want to know about `Transactions` to know where the action chain has begun. Unlike Ethereum, where a Transaction contains everything you may want to know about a particular interaction on  the Ethereum blockchain, Near Protocol because of its asynchronous nature converts a `Transaction` into a `Receipt` before executing it. Thus, On NEAR, `Receipts` are more important for figuring out what happened on-chain as a result of a Transaction signed by a user. Read more about [Transactions on Near](https://nomicon.io/RuntimeSpec/Transactions) here.
         *
         */
        readonly transactions: Transaction[],
        private _actions: Map<string, Action>,
        private _events: Map<string, Event[]>,
        private _stateChanges: StateChange[]) { }

    /**
     * Returns the block hash. A shortcut to get the data from the block header.
     */
    get blockHash(): string {
        return this.header().hash;
    }

    /**
     * Returns the previous block hash. A shortcut to get the data from the block header.
     */
    get prevBlockHash(): string {
        return this.header().prevHash;
    }

    /**
     * Returns the block height. A shortcut to get the data from the block header.
     */
    get blockHeight(): number {
        return this.header().height;
    }

    /**
     * Returns a `BlockHeader` structure of the block
     * See `BlockHeader` structure sections for details.
     */
    header(): BlockHeader {
        return BlockHeader.fromStreamerMessage(this.streamerMessage);
    }

    /**
     * Returns a slice of `Receipts` executed in the block.
     * Basically is a getter for the `executedReceipts` field.
     */
    receipts(): Receipt[] {
        if (this.executedReceipts.length == 0) {
            this.executedReceipts = this.streamerMessage.shards
                .flatMap((shard) => shard.receiptExecutionOutcomes)
                .map((executionReceipt) => Receipt.fromOutcomeWithReceipt(executionReceipt))
        }
        return this.executedReceipts;
    }

    /**
     * Returns an Array of `Actions` executed in the block.
     */
    actions(): Action[] {
        const actions: Action[] = this.streamerMessage.shards
            .flatMap((shard) => shard.receiptExecutionOutcomes)
            .filter((exeuctionOutcomeWithReceipt) => Action.isActionReceipt(exeuctionOutcomeWithReceipt.receipt))
            .map((exeuctionOutcomeWithReceipt) => Action.fromReceiptView(exeuctionOutcomeWithReceipt.receipt))
            .filter((action): action is Action => action !== null)
            .map(action => action)
        return actions
    }

    /**
     * Returns `Events` emitted in the block.
     */
    events(): Event[] {
        const events = this.receipts().flatMap((executedReceipt) => executedReceipt.logs.filter(RawEvent.isEvent).map(RawEvent.fromLog).map((rawEvent) => {
            let event: Event = { relatedReceiptId: executedReceipt.receiptId, rawEvent: rawEvent }
            return event
        }))
        return events
    }

    /**
     * Returns raw logs regardless of the fact that they are standard events or not.
     */
    logs(): Log[] {
        const logs: Log[] = this.receipts().flatMap((executedReceipt) => executedReceipt.logs.map((rawLog) => {
            let log: Log = { relatedReceiptId: executedReceipt.receiptId, log: rawLog }
            return log
        }))
        return logs
    }

    /**
     * Returns an Array of `StateChange` occurred in the block.
     */
    stateChanges(): StateChange[] {
        if (this._stateChanges.length == 0) {
            this._stateChanges = this.streamerMessage.shards
                .flatMap((shard) => shard.stateChanges)
                .map(StateChange.fromStateChangeView)
        }
        return this._stateChanges
    }

    /**
     * Returns `Action` of the provided `receipt_id` from the block if any. Returns `undefined` if there is no corresponding `Action`.
     *
     * This method uses the internal `Block` `action` field which is empty by default and will be filled with the block’s actions on the first call to optimize memory usage.
     *
     * The result is either `Action | undefined` since there might be a request for an `Action` by `receipt_id` from another block, in which case this method will be unable to find the `Action` in the current block. In the other case, the request might be for an `Action` for a `receipt_id` that belongs to a `DataReceipt` where an action does not exist.
     */
    actionByReceiptId(receipt_id: string): Action | undefined {
        if (this._actions.size == 0) {
            this.buildActionsHashmap()
        }
        return this._actions.get(receipt_id);
    }

    /**
     * Returns an Array of Events emitted by `ExecutionOutcome` for the given `receipt_id`. There might be more than one `Event` for the `Receipt` or there might be none of them. In the latter case, this method returns an empty Array.
     */
    eventsByReceiptId(receipt_id: string): Event[] {
        if (this._events.size == 0) {
            this.buildEventsHashmap()
        }
        return this._events.get(receipt_id) || [];
    }

    /**
     * Returns an Array of Events emitted by `ExecutionOutcome` for the given `account_id`. There might be more than one `Event` for the `Receipt` or there might be none of them. In the latter case, this method returns an empty Array.
     */
    eventsByAccountId(account_id: string): Event[] {
        return this.events().filter((event) => {
            const action = this.actionByReceiptId(event.relatedReceiptId)
            return action?.receiverId == account_id || action?.signerId == account_id
        });
    }

    private buildActionsHashmap() {
        const actions = new Map<string, Action>();
        this.actions().forEach(action => {
            actions.set(action.receiptId, action)
        }
        );
        this._actions = actions
    }

    private buildEventsHashmap(): Map<string, Event[]> {
        const events = new Map<string, Event[]>();
        for (const receipt of this.executedReceipts) {
            events.set(receipt.receiptId, receipt.events);
        }
        return events;
    }


    static fromStreamerMessage(streamerMessage: StreamerMessage): Block {
        const block: Block = new Block(streamerMessage, [], [], [], new Map(), new Map(), []);
        return block;
    }

}


/**
 * Replacement for `BlockHeaderView` from `near-primitives`. Shrunken and simplified. 
 *
 * **Note:** the original `BlockHeaderView` is still accessible via the `.streamerMessage` attribute.
 */
export class BlockHeader {

    constructor(
        readonly height: number,
        readonly hash: string,
        readonly prevHash: string,
        readonly author: string,
        readonly timestampNanosec: string,
        readonly epochId: string,
        readonly nextEpochId: string,
        readonly gasPrice: string,
        readonly totalSupply: string,
        readonly latestProtocolVersion: number,
        readonly randomValue: string,
        readonly chunksIncluded: number,
        readonly validatorProposals: ValidatorStakeView[]) { }

    static fromStreamerMessage(streamerMessage: StreamerMessage): BlockHeader {
        return new BlockHeader(
            streamerMessage.block.header.height,
            streamerMessage.block.header.hash,
            streamerMessage.block.header.prevHash,
            streamerMessage.block.author,
            streamerMessage.block.header.timestampNanosec,
            streamerMessage.block.header.epochId,
            streamerMessage.block.header.nextEpochId,
            streamerMessage.block.header.gasPrice,
            streamerMessage.block.header.totalSupply,
            streamerMessage.block.header.latestProtocolVersion,
            streamerMessage.block.header.randomValue,
            streamerMessage.block.header.chunksIncluded,
            streamerMessage.block.header.validatorProposals,
        );
    }
}
