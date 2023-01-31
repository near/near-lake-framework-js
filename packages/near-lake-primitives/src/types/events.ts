
export class Event {
    readonly relatedReceiptId: string;
    readonly rawEvent: RawEvent;

    constructor(relatedReceiptId: string, rawEvent: RawEvent) {
        this.relatedReceiptId = relatedReceiptId;
        this.rawEvent = rawEvent;
    }

    static fromLog = (log: string): Event => {
        return { relatedReceiptId: '', rawEvent: RawEvent.fromLog(log) } as Event;
    }
}

export class RawEvent {
    readonly event: string
    readonly standard: string
    readonly version: string
    readonly data: JSON | undefined

    constructor(event: string, standard: string, version: string, data: JSON | undefined) {
        this.event = event;
        this.standard = standard;
        this.version = version;
        this.data = data;
    }

    static fromLog = (log: string): RawEvent | undefined => {
        if (!log.startsWith('EVENT_JSON:')) {
            return
        }

        const [event, standard, version, data] = log.split('EVENT_JSON:');

        return {
            event,
            standard,
            version,
            data: data ? JSON.parse(data) : undefined
        };
    };
};

export type Events = {
    events: Event[];
}
