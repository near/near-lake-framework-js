import { StateChangeWithCauseView } from './core/types';
import { AccessKey } from './receipts';

export class StateChange {
    
    constructor(readonly cause: StateChangeCause, readonly value: StateChangeValue) {}

    get affectedAccountId(): string {
        return this.value.accountId;
    }

    static fromStateChangeView(stateChangeView: StateChangeWithCauseView) {
        let { cause, value } = stateChangeView;
        return new StateChange(cause, value)
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
