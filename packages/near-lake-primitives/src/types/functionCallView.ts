import { Action, FunctionCall } from "./receipts";
import { Event } from "./events";
import { isSuccessfulReceipt } from "../helpers";
import { ExecutionStatus } from "./core/types";

/**
 * Represents a Function Call to a smart cotract
 *
 */
export class FunctionCallView {
  constructor(
    /**
     * The account ID of the contract that is called.
     */
    readonly receiverId: string,

    /**
     * The method name of the contract that was invoked.
     */
    readonly methodName: string,

    /**
     * Base64 encoded arguments to the method.
     */
    readonly args: string,

    /**
     * gas amount.
     */
    readonly gas: number,

    /**
     * deposit amount in yoctoNEAR.
     */
    readonly deposit: string,

    private readonly action: Action
  ) {}

  /**
   * receiptId in which this call was executed.
   */
  get receiptId(): string {
    return this.action.receiptId;
  }

  /**
   * whether the call was successful.
   */
  get isSuccessful(): boolean {
    return isSuccessfulReceipt(this.action.receiptStatus);
  }

  /**
   * Execution status object of the corresponding receipt.
   */
  get receiptStatus(): ExecutionStatus {
    return this.action.receiptStatus;
  }

  /**
   * predecessorId: the contract that invoked this call.
   */
  get predecessorId(): string {
    return this.action.predecessorId;
  }

  /**
   * original signer of the transaction.
   */
  get signerId(): string {
    return this.action.signerId;
  }

  /**
   * array of parsed events complying with NEP-297 emitted in this call.
   */
  get events(): Event[] {
    return this.action.events;
  }

  /**
   * array of logs produced in this call.
   */
  get logs(): string[] {
    return this.action.logs;
  }

  /**
   * arguments, decoded from base64 and parsed to JSON
   * @param encoding encoding of the args, default is utf-8
   * @returns JSON object of the arguments
   * @throws Error if failed to parse the args as JSON
   */
  argsAsJSON(encoding: BufferEncoding = "utf-8"): JSON {
    try {
      return JSON.parse(Buffer.from(this.args, "base64").toString(encoding));
    } catch (e: any) {
      throw new Error(
        `Failed to parse args '${this.args}' on method '${this.methodName}' as JSON: ${e.message}`
      );
    }
  }

  static fromFunctionCall(
    functionCall: FunctionCall,
    action: Action
  ): FunctionCallView {
    return new FunctionCallView(
      action.receiverId,
      functionCall.methodName,
      functionCall.args,
      functionCall.gas,
      functionCall.deposit,
      action
    );
  }
}
