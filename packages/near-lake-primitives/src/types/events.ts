
export type Log = {
    log: String;
    relatedReceiptId: String;
}

/**
 * This structure is an ephemeral entity to provide access to the [Events Standard](https://github.com/near/NEPs/blob/master/neps/nep-0297.md) structure and keep data about the related `Receipt` for convenience.
 *
 * #### Interface for Capturing Data About an Event in `handleStreamerMessage()`
 *
 * The interface to capture data about an event has the following arguments:
 *  - `standard`: name of standard, e.g. nep171
 *  - `version`: e.g. 1.0.0
 *  - `event`: type of the event, e.g. `nft_mint`
 *  - `data`: associate event data. Strictly typed for each set {standard, version, event} inside corresponding NEP
 */
export class Event {
    constructor(readonly relatedReceiptId: string, readonly rawEvent: RawEvent) { }

    static fromLog = (log: string): Event => {
        const rawEvent = RawEvent.fromLog(log);
        return new Event('', rawEvent);
    }
}

/**
 * This structure is a copy of the [JSON Events](https://github.com/near/NEPs/blob/master/neps/nep-0297.md) structure representation.
 */
export class RawEvent {
    constructor(readonly event: string, readonly standard: string, readonly version: string, readonly data: JSON | undefined) { }

    static isEvent = (log: string): boolean => {
        return log.startsWith('EVENT_JSON:');
    };

    static fromLog = (log: string): RawEvent => {
        const [event, standard, version, data] = log.split('EVENT_JSON:');

        return new RawEvent(event, standard, version, data ? JSON.parse(data) : undefined);
    };
};

export type Events = {
    events: Event[];
}
