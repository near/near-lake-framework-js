
export type Event = {
    relatedReceiptId: string;
    rawEvent: RawEvent;
}

type RawEvent = {
    event: string,
    standard: string,
    version: string,
    data: JSON | undefined
};

export const logToRawEvent = (log: string): RawEvent => {
    if (!log.startsWith('EVENT_JSON:')) {
        throw new Error('Log is not an event');
    }

    const [event, standard, version, data] = log.split('EVENT_JSON:');

    return {
        event,
        standard,
        version,
        data: data ? JSON.parse(data) : undefined
    };
};

export type Events = {
    events: Event[];
}

export const logToEvent = (log: string): Event => {
    return { relatedReceiptId: '', rawEvent: logToRawEvent(log) } as Event;
};
