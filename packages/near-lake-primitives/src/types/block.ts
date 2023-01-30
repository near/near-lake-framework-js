import { Action, isActionReceipt, outcomeWithReceiptToReceipt, receiptViewToAction } from './receipts';
import { StreamerMessage, ValidatorStakeView } from './core/types';
import { Receipt } from './receipts';
import { Transaction } from './transactions';
import { Event, logToRawEvent } from './events';
import { fromStateChangeViewToStateChange, StateChange } from './state_changes';

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
        return streamerMessageToBlockHeader(this.streamerMessage);
    }

    receipts(): Receipt[] {
        if (this.executedReceipts.length == 0) {
            this.executedReceipts = this.streamerMessage.shards.flatMap((shard) => shard.receiptExecutionOutcomes).map((executionReceipt) => outcomeWithReceiptToReceipt(executionReceipt))
        }
        return this.executedReceipts;
    }

    actions(): Action[] {
        const actions: Action[] = this.streamerMessage.shards.flatMap((shard) => shard.receiptExecutionOutcomes).filter((exeuctionOutcomeWithReceipt) => isActionReceipt(exeuctionOutcomeWithReceipt.receipt)).map((exeuctionOutcomeWithReceipt) => receiptViewToAction(exeuctionOutcomeWithReceipt.receipt)).filter((action) => action !== null).map(action => action as Action)
        return actions
    }

    receiptsOnAccountId() {
        // I would like to know all receipts executed on near.social
    }

    actionsOnAccountId() {
        // I would like to know all actions executed on near.social
    }
    events(): Event[] {
        const events = this.receipts().flatMap((executedReceipt) => executedReceipt.logs.map(logToRawEvent).map((rawEvent) => {
            if (rawEvent) {
                let event = { relatedReceiptId: executedReceipt.receiptId, rawEvent: rawEvent } as Event
                return event
            } else {
                return null
            }
        })).filter((event) => event !== null).map((event) => event as Event)
        return events
    }
    stateChanges(): StateChange[] {
        if (this._stateChanges.length == 0) {
            this._stateChanges = this.streamerMessage.shards.flatMap((shard) => shard.stateChanges).map(fromStateChangeViewToStateChange)
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


}

export function streamerMessageToBlock(streamerMessage: StreamerMessage): Block {
    const block: Block = new Block(streamerMessage, [], [], [], new Map(), new Map(), []);
    return block;
}

export type BlockHeader = {
    height: number;
    hash: string;
    prevHash: string;
    author: string;
    timestampNanosec: string;
    epochId: string;
    nextEpochId: string;
    gasPrice: string;
    totalSupply: string;
    latestProtocolVersion: number;
    randomValue: string;
    chunksIncluded: number;
    validatorProposals: ValidatorStakeView[];
}

function streamerMessageToBlockHeader(streamerMessage: StreamerMessage): BlockHeader {
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


