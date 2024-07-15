import { ExecutionStatus, ReceiptStatusFilter } from "./types/core/types";

export function isMatchingReceiverSingle(
  receiverId: string,
  wildcardFilter: string
) {
  if (wildcardFilter === "*") {
    return true;
  }
  const regExp = new RegExp(
    wildcardFilter.replace(/\*/g, "[\\w\\d]+").replace(/\./g, "\\.")
  );
  return regExp.test(receiverId);
}

export function isMatchingReceiver(
  receiverId: string,
  contractFilter: string
): boolean {
  const filters = contractFilter.split(",").map((f) => f.trim());
  return filters.some((f) => isMatchingReceiverSingle(receiverId, f));
}

export function isSuccessfulReceipt(receiptStatus: ExecutionStatus): boolean {
  return (
    receiptStatus.hasOwnProperty("SuccessValue") ||
    receiptStatus.hasOwnProperty("SuccessReceiptId")
  );
}

export function isMatchingReceiptStatus(
  receiptStatus: ExecutionStatus,
  statusFilter: ReceiptStatusFilter
): boolean {
  switch (statusFilter) {
    case "all":
      return true;
    case "onlySuccessful":
      return isSuccessfulReceipt(receiptStatus);
    case "onlyFailed":
      return receiptStatus.hasOwnProperty("Failure");
  }
}
