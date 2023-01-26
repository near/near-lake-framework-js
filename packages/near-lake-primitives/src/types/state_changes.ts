import { AccessKey } from './receipts';

export class StateChange {
    readonly cause: StateChangeCause;
    readonly value: StateChangeValue;

    constructor(cause: StateChangeCause, value: StateChangeValue) {
        this.cause = cause;
        this.value = value;
    }

    get affectedAccountId(): string {
        return this.value.accountId;
    }

}
type TransactionProcessingCause = { txHash: string };
type ActionReceiptProcessingStartedCause = { receiptHash: string }
type ActionReceiptGasRewardCause = { receiptHash: string }
type ReceiptProcessingCause = { receiptHash: string }
type PostponedReceiptCause = { receiptHash: string }
type StateChangeCause =
    'NotWritableToDisk' |
    'InitialState' |
    TransactionProcessingCause |
    ActionReceiptProcessingStartedCause |
    ActionReceiptGasRewardCause |
    ReceiptProcessingCause |
    PostponedReceiptCause |
    'UpdatedDelayedReceipts' |
    'ValidatorAccountsUpdate' |
    'Migration' |
    'Resharding'

type AccountUpdateValue = {
    accountId: string,
    account: Account
}
type AccountDeletionValue = {
    accountId: string,
}

type AccountKeyUpdateValue = {
    accountId: string,
    publicKey: string,
    AccessKey: AccessKey
}

type AccessKeyDeletionValue = {
    accountId: string,
    publicKey: string,
}

type DataUpdateValue = {
    accountId: string,
    key: Uint8Array,
    value: Uint8Array,
}

type DataDeletionValue = {
    accountId: string,
    key: Uint8Array,
}

type ContractCodeUpdateValue = {
    accountId: string,
    code: Uint8Array
}

type ContractCodeDeletionValue = {
    accountId: string,
}

type StateChangeValue = AccountUpdateValue | AccountDeletionValue | AccountKeyUpdateValue | AccessKeyDeletionValue | DataUpdateValue | DataDeletionValue | ContractCodeUpdateValue | ContractCodeDeletionValue

type Account = {
    amount: number,
    locked: number,
    codeHash: string,
    storageUsage: number,
    storagePaidAt: number,
}
