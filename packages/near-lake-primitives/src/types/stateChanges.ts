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

class AccountUpdateValue {
    constructor(readonly accountId: string, readonly account: Account) {}
}
class AccountDeletionValue {
    constructor(readonly accountId: string) {}
}

class AccountKeyUpdateValue {
    constructor(readonly accountId: string, readonly publicKey: string, readonly accessKey: AccessKey) {}
}

class AccessKeyDeletionValue  {
    constructor(readonly accountId: string, readonly publicKey: string) {}
}

class DataUpdateValue  {
    constructor(readonly accountId: string, readonly key: Uint8Array, readonly value: Uint8Array) {}
}

class DataDeletionValue  {
    constructor(readonly accountId: string, readonly key: Uint8Array) {}
}

class ContractCodeUpdateValue  {
    constructor(readonly accountId: string, readonly code: Uint8Array) {}
}

class ContractCodeDeletionValue  {
    constructor(readonly accountId: string) {}
}

type StateChangeValue = AccountUpdateValue | AccountDeletionValue | AccountKeyUpdateValue | AccessKeyDeletionValue | DataUpdateValue | DataDeletionValue | ContractCodeUpdateValue | ContractCodeDeletionValue

class Account {
    constructor(readonly amount: number, readonly locked: number, readonly codeHash: string, readonly storageUsage: number, readonly storagePaidAt: number) {}
}
