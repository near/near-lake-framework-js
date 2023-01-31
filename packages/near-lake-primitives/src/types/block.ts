import { Action, Receipt } from './receipts';
import { StreamerMessage, ValidatorStakeView } from './core/types';
import { Transaction } from './transactions';
import { Event, logToRawEvent } from './events';
import { StateChange } from './stateChanges';

export class Block {
    readonly streamerMessage: StreamerMessage;
    private executedReceipts: Receipt[];
    readonly postponedReceipts: Receipt[];
    readonly transactions: Transaction[];
    private _actions: Map<string, Action>;
    private _events: Map<string, Event[]>;
    private _stateChanges: StateChange[];

    constructor(streamerMessage: StreamerMessage, executedReceipts: Receipt[], postponedReceipts: Receipt[],
        transactions: Transaction[], actions: Map<string, Action>,
        events: Map<string, Event[]>, stateChanges: StateChange[]) {
        this.streamerMessage = streamerMessage;
        this.executedReceipts = executedReceipts;
        this.postponedReceipts = postponedReceipts;
        this.transactions = transactions;
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
        const events = this.receipts().flatMap((executedReceipt) => executedReceipt.logs.map(logToRawEvent).map((rawEvent) => {
            if (rawEvent) {
                let event: Event = { relatedReceiptId: executedReceipt.receiptId, rawEvent: rawEvent }
                return event
            } else {
                return null
            }
        })).filter((event: Event | null) => event !== null).map((event) => event as Event)
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
    readonly height: number;
    readonly hash: string;
    readonly prevHash: string;
    readonly author: string;
    readonly timestampNanosec: string;
    readonly epochId: string;
    readonly nextEpochId: string;
    readonly gasPrice: string;
    readonly totalSupply: string;
    readonly latestProtocolVersion: number;
    readonly randomValue: string;
    readonly chunksIncluded: number;
    readonly validatorProposals: ValidatorStakeView[];

    constructor(height: number, hash: string, prevHash: string, author: string, timestampNanosec: string, epochId: string, nextEpochId: string, gasPrice: string, totalSupply: string, latestProtocolVersion: number, randomValue: string, chunksIncluded: number, validatorProposals: ValidatorStakeView[]) {
        this.height = height;
        this.hash = hash;
        this.prevHash = prevHash;
        this.author = author;
        this.timestampNanosec = timestampNanosec;
        this.epochId = epochId;
        this.nextEpochId = nextEpochId;
        this.gasPrice = gasPrice;
        this.totalSupply = totalSupply;
        this.latestProtocolVersion = latestProtocolVersion;
        this.randomValue = randomValue;
        this.chunksIncluded = chunksIncluded;
        this.validatorProposals = validatorProposals;
    }


    static fromStreamerMessage(streamerMessage: StreamerMessage): BlockHeader {
        const blockHeader: BlockHeader = {
            height: streamerMessage.block.header.height,
            hash: streamerMessage.block.header.hash,
            prevHash: streamerMessage.block.header.prevHash,
            author: streamerMessage.block.author,
            timestampNanosec: streamerMessage.block.header.timestampNanosec,
            epochId: streamerMessage.block.header.epochId,
            nextEpochId: streamerMessage.block.header.nextEpochId,
            gasPrice: streamerMessage.block.header.gasPrice,
            totalSupply: streamerMessage.block.header.totalSupply,
            latestProtocolVersion: streamerMessage.block.header.latestProtocolVersion,
            randomValue: streamerMessage.block.header.randomValue,
            chunksIncluded: streamerMessage.block.header.chunksIncluded,
            validatorProposals: streamerMessage.block.header.validatorProposals,
        };

        return blockHeader;

    }
}




