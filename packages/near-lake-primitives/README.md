# NEAR Lake Primitive Types

This crate contains the primitive types used by the [NEAR Lake Framework package](https://www.npmjs.com/package/@near-lake/framework). These types are used to define the data structures used by the framework as well as provide some popular helper functions.

## Types

### `Block`

#### `Block` Structure Definition

The `Block` type is used to represent a block in the NEAR Lake Framework. It is comprised by the following structure:

```ts
export class Block {
    constructor(
        readonly streamerMessage: StreamerMessage,
        private executedReceipts: Receipt[],
        readonly postponedReceipts: Receipt[],
        readonly transactions: Transaction[],
        private _actions: Map<string, Action>,
        private _events: Map<string, Event[]>,
        private _stateChanges: StateChange[]) { 

        }
    ... // helper methods and getters ommitted for brevity
}
```

##### `streamerMessage`

Low-level structure for backward compatibility. As implemented in previous versions of [`near-lake-framework`](https://www.npmjs.com/package/near-lake-framework). 

##### `executedReceipts`

This field is a representation of streamerMessage.shard[N].receiptExecutionOutcomes. `receiptExecutionOutcomes` has a type `IndexerExecutionOutcomesWithReceipt` which is an ephemeral structure from `near-indexer-primitives` that holds an `ExecutionOutcomeView` along with the corresponding `ReceiptView`.

##### `postponedReceipts`

Receipts included on the chain but not executed yet marked as “postponed”: they are represented by the same structure `Receipt` (see the corresponding section in this doc for more details).

##### `transactions`

List of included `Transactions`, converted into `Receipts`.

**_NOTE_:** Heads up! You might want to know about `Transactions` to know where the action chain has begun. In other cases you might want to know where the main asset is, like Ethereum where a transaction is a main asset. On NEAR, `Receipts` are more important.

##### `actions`

A cache field for the executed `Actions` of this particular block. It is a map to get the `Action` structure for a specific `Receipt` by its ID.

This field is an internal field that serves the `Block.actionByReceiptId()` method (see the corresponding section of this doc).

##### `events`

A cache field for the parsed JSON Events from the `ExecutionOutcome` logs, similar to the `actions` field described above.

This field is an internal field that serves `Block.eventsByReceiptId()` method (see the corresponding section of this doc).

##### `stateChanges`

This field holds all the `StateChanges` happened in this block.

#### `Block` Helper Methods

```ts
export class Block {
    ... // constructor ommitted for brevity
    get blockHash(): string {}
    get prevBlockHash(): string {}
    get blockHeight(): number {}

    header(): BlockHeader {}
    receipts(): Receipt[] {}
    actions(): Action[] {}
    events(): Event[] {}
    stateChanges(): StateChange[] {}

    actionByReceiptId(receipt_id: string): Action | undefined {}
    eventsByReceiptId(receipt_id: string): Event[] {}
    eventsByAccountId(account_id: string): Event[] {}

    private buildActionsHashmap() {}
    private buildEventsHashmap(): Map<string, Event[]> {}

    static fromStreamerMessage(streamerMessage: StreamerMessage): Block {}
}
```

##### `blockHash`

Returns the block hash. A shortcut to get the data from the block header.

##### `prevBlockHash`

Returns the previous block hash. A shortcut to get the data from the block header.

##### `blockHeight`

Returns the block height. A shortcut to get the data from the block header.

##### `header()`

Returns a `BlockHeader` structure of the block

See `BlockHeader` structure sections for details.

##### `receipts()`

Returns a slice of `Receipts` executed in the block.

Basically is a getter for the `executedReceipts` field.

##### `actions()`

Returns an Array of `Actions` executed in the block.

##### `events()`

Returns `Events` emitted in the block.

##### `stateChanges()`

Returns an Array of `StateChange` occurred in the block.

##### `actionByReceiptId(receipt_id: string): Action | undefined`

Returns `Action`s of the provided `receipt_id` from the block if any. Returns `undefined` if there is no corresponding `Action`.

This method uses the internal `Block` `action` field which is empty by default and will be filled with the block’s actions on the first call to optimize memory usage.

The result is either `Action | undefined` since there might be a request for an `Action` by `receipt_id` from another block, in which case this method will be unable to find the `Action` in the current block. In the other case, the request might be for an `Action` for a `receipt_id` that belongs to a `DataReceipt` where an action does not exist.

##### `eventsByReceiptId(receipt_id: string): Event[]`

Returns an Array of Events emitted by `ExecutionOutcome` for the given `receipt_id`. There might be more than one `Event` for the `Receipt` or there might be none of them. In the latter case, this method returns an empty Array.

##### `eventsByAccountId(account_id: string): Event[]`

Returns an Array of Events emitted by `ExecutionOutcome` for the given `account_id`. There might be more than one `Event` for the `Receipt` or there might be none of them. In the latter case, this method returns an empty Array.

### Important Notes on `Block`

- All the entities located on different shards were merged into one single list without differentiation.
- `Block` is not the fairest name for this structure either. NEAR Protocol is a sharded blockchain, so its block is actually an ephemeral structure that represents a collection of real blocks called chunks in NEAR Protocol.

### `BlockHeader`

Replacement for `BlockHeaderView` from `near-primitives`. Shrunken and simplified. Note: the original `BlockHeaderView` is still accessible via the `.streamerMessage` attribute.

#### `BlockHeader` Structure Definition

```ts
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
        readonly validatorProposals: ValidatorStakeView[]) { 
        }
    ... // helper method ommitted for brevity
}
```

### `Receipt`

This field is a simplified representation of the `ReceiptView` structure from `near-primitives`.

#### `Receipt` Structure Definition

```ts
export class Receipt implements Events {
  constructor(
    readonly receiptKind: ReceiptKind, 
    readonly receiptId: string, 
    readonly receiverId: string, 
    readonly predecessorId: string, 
    readonly status: ExecutionStatus, 
    readonly executionOutcomeId?: string | undefined, 
    readonly logs: string[] = []) {
    }
  ... // helper methods ommitted for brevity
}
```

#### `Receipt` Fields

##### `receiptKind`

Defined the type of the `Receipt`: `Action` or `Data` representing the `ActionReceipt` and `DataReceipt`.

##### `receiptId`

The ID of the `Receipt` of the `CryptoHash` type.

##### `receiverId`

The receiver account id of the `Receipt`.

##### `predecessorId`

The predecessor account id of the `Receipt`.

##### `status`

Represents the status of `ExecutionOutcome` of the `Receipt`.

See the `ExecutionStatus` enum section for the details.

##### `executionOutcomeId`

The id of the `ExecutionOutcome` for the `Receipt`. Returns `null` if the `Receipt` isn’t executed yet and has a postponed status.

##### `logs`

The original logs of the corresponding `ExecutionOutcome` of the `Receipt`.

Note: not all of the logs might be parsed as JSON Events (`Events`).

#### `Receipt` Helper Methods

```ts
export class Receipt {
    ... // constructor ommitted for brevity
    get events(): Event[] {}

    static fromOutcomeWithReceipt(outcomeWithReceipt: OutcomeWithReceipt): Receipt {}
}
```

##### `Receipt.events()`

Returns an Array of `Events` for the `Receipt`, if any. This might be empty if the `logs` field is empty or doesn’t contain JSON Events compatible log records.

### `Event`

### `StateChange`

### `Transaction`