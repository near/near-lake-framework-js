import { Action } from './receipts';
import { StreamerMessage, ValidatorStake } from './core/types';
import { Receipt } from './receipts';
import { Transaction } from './transactions';
import { Event } from './events';
import { StateChange } from './state_changes';

export class Block {
    readonly streamerMessage: StreamerMessage;
    readonly executedReceipts: Array<Receipt>;
    readonly postponedReceipts: Array<Receipt>;
    readonly transactions: Array<Transaction>;
    private _actions: Map<string, Action>;
    private _events: Map<string, Array<Event>>;
    readonly stateChanges: Array<StateChange>;

    constructor(streamerMessage: StreamerMessage, executedReceipts: Receipt[], postponedReceipts: Receipt[],
        transactions: Array<Transaction>, actions: Map<string, Action>,
        events: Map<string, Array<Event>>, stateChanges: Array<StateChange>) {
        this.streamerMessage = streamerMessage;
        this.executedReceipts = executedReceipts;
        this.postponedReceipts = postponedReceipts;
        this.transactions = transactions;
        this._actions = actions;
        this._events = events;
        this.stateChanges = stateChanges;
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

    receipts(): Array<Receipt> {
        return this.executedReceipts.concat(this.postponedReceipts);
    }


    actions(): Action[] {
        // actions map to array
        return Object.values(this._actions);
    }

    events(): Event[] {
        return Object.values(this._events);
    }

    action_by_receipt_id(receipt_id: string): Action | undefined {
        return this._actions.get(receipt_id);
    }

    events_by_receipt_id(receipt_id: string): Array<Event> {
        return this._events.get(receipt_id) || [];
    }

    events_by_account_id(account_id: string): Array<Event> {
        return this._events.get(account_id) || [];
    }

    build_actions_hashmap(): Map<string, Action> {
        const actions = new Map<string, Action>();
        for (const receipt of this.executedReceipts) {
            // actions.set(receipt.receiptId, receipt.operations)
        }
        return actions;
    }

    build_events_hashmap(): Map<string, Array<Event>> {
        const events = new Map<string, Array<Event>>();
        for (const receipt of this.executedReceipts) {
            events.set(receipt.receiptId, receipt.events);
        }
        return events;
    }


}

export function createBlock(streamerMessage: StreamerMessage): Block {
    const block: Block = new Block(streamerMessage, [], [], [], new Map(), new Map(), []);
    return block;
}

export class BlockHeader {
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
    validatorProposals: Array<ValidatorStake>;
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


