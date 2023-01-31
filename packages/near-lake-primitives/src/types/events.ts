
export class Event {
    constructor(readonly relatedReceiptId: string, readonly rawEvent: RawEvent) { }

    static fromLog = (log: string): Event | undefined => {
        const rawEvent = RawEvent.fromLog(log);
        if (rawEvent) {
            return new Event('', rawEvent);
        }
        return
    }
}

export class RawEvent {
    constructor(readonly event: string, readonly standard: string, readonly version: string, readonly data: JSON | undefined) { }

    static fromLog = (log: string): RawEvent | undefined => {
        if (!log.startsWith('EVENT_JSON:')) {
            return
        }

        const [event, standard, version, data] = log.split('EVENT_JSON:');

        return new RawEvent(event, standard, version, data ? JSON.parse(data) : undefined);
    };
};

export type Events = {
    events: Event[];
}
