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
  constructor(readonly receiptId: string, private readonly rawEvent: RawEvent) {
  }

  get event(): string {
    return this.rawEvent.event;
  }

  get standard(): string {
    return this.rawEvent.standard;
  }

  get version(): string {
    return this.rawEvent.version;
  }

  get data(): JSON | undefined {
    return this.rawEvent.data;
  }

  static fromLog = (log: string, receiptId = ""): Event => {
    const rawEvent = RawEvent.fromLog(log);
    return new Event(receiptId, rawEvent);
  };

  get relatedReceiptId(): string {
    console.warn("relatedReceiptId is deprecated, use receiptId instead");
    return this.receiptId;
  }
}

/**
 * This structure is a copy of the [JSON Events](https://github.com/near/NEPs/blob/master/neps/nep-0297.md) structure representation.
 */
export class RawEvent {
  constructor(readonly event: string, readonly standard: string, readonly version: string, readonly data: JSON | undefined) {
  }

  static isEvent = (log: string): boolean => {
    return log.startsWith("EVENT_JSON:");
  };

  static fromLog = (log: string): RawEvent => {
    const { event, standard, version, data } = JSON.parse(log.replace("EVENT_JSON:", ""));

    return new RawEvent(event, standard, version, data);
  };
};

export type Events = {
  events: Event[];
}
