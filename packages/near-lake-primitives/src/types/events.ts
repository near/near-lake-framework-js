
export class Event {
    constructor(readonly relatedReceiptId: string, readonly rawEvent: RawEvent) { }

    static fromLog = (log: string): Event => {
        const rawEvent = RawEvent.fromLog(log);
        return new Event('', rawEvent);
    }
}

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
