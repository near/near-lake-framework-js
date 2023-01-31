import { Action, Receipt } from './receipts';
import { StreamerMessage, ValidatorStakeView } from './core/types';
import { Transaction } from './transactions';
import { Event, RawEvent } from './events';
import { StateChange } from './stateChanges';

export class Block {
    private _actions: Map<string, Action>;
    private _events: Map<string, Event[]>;
    private _stateChanges: StateChange[];

    constructor(
        readonly streamerMessage: StreamerMessage,
        private executedReceipts: Receipt[],
        readonly postponedReceipts: Receipt[],
        readonly transactions: Transaction[],
        actions: Map<string, Action>,
        events: Map<string, Event[]>,
        stateChanges: StateChange[]) {
        this._actions = actions;
        this._events = events;
        this._stateChanges = stateChanges;
    }

    get blockHash(): string {
        return this.header().hash;
    }

    get prevBlockHash(): string {
        return this.header().prevHash;
    }
    get blockHeight(): number {
        return this.header().height;
    }

    header(): BlockHeader {
        return BlockHeader.fromStreamerMessage(this.streamerMessage);
    }

    receipts(): Receipt[] {
        if (this.executedReceipts.length == 0) {
            this.executedReceipts = this.streamerMessage.shards
                .flatMap((shard) => shard.receiptExecutionOutcomes)
                .map((executionReceipt) => Receipt.fromOutcomeWithReceipt(executionReceipt))
        }
        return this.executedReceipts;
    }

    actions(): Action[] {
        const actions: Action[] = this.streamerMessage.shards
            .flatMap((shard) => shard.receiptExecutionOutcomes)
            .filter((exeuctionOutcomeWithReceipt) => Action.isActionReceipt(exeuctionOutcomeWithReceipt.receipt))
            .map((exeuctionOutcomeWithReceipt) => Action.fromReceiptView(exeuctionOutcomeWithReceipt.receipt))
            .filter((action) => action !== null)
            .map(action => action as Action)
        return actions
    }

    events(): Event[] {
        const events = this.receipts().flatMap((executedReceipt) => executedReceipt.logs.map(RawEvent.fromLog).map((rawEvent) => {
            if (rawEvent) {
                let event: Event = { relatedReceiptId: executedReceipt.receiptId, rawEvent: rawEvent }
                return event
            } else {
                return null
            }
        })).filter((event: Event | null): event is Event => event !== null)
        return events
    }

    stateChanges(): StateChange[] {
        if (this._stateChanges.length == 0) {
            this._stateChanges = this.streamerMessage.shards
                .flatMap((shard) => shard.stateChanges)
                .map(StateChange.fromStateChangeView)
        }
        return this._stateChanges
    }

    actionByReceiptId(receipt_id: string): Action | undefined {
        if (this._actions.size == 0) {
            this.buildActionsHashmap()
        }
        return this._actions.get(receipt_id);
    }

    eventsByReceiptId(receipt_id: string): Event[] {
        if (this._events.size == 0) {
            this.buildEventsHashmap()
        }
        return this._events.get(receipt_id) || [];
    }

    eventsByAccountId(account_id: string): Event[] {
        return this.events().filter((event) => {
            const action = this.actionByReceiptId(event.relatedReceiptId)
            if (action !== undefined && action?.receiverId == account_id || action?.signerId == account_id) {
                return true
            }
            return false
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


export class BlockHeader {

    constructor(readonly height: number, readonly hash: string, readonly prevHash: string, readonly author: string, readonly timestampNanosec: string, readonly epochId: string, readonly nextEpochId: string, readonly gasPrice: string, readonly totalSupply: string, readonly latestProtocolVersion: number, readonly randomValue: string, readonly chunksIncluded: number, readonly validatorProposals: ValidatorStakeView[]) { }

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




