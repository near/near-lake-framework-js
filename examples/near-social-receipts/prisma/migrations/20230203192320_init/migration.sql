-- CreateTable
CREATE TABLE "receipts" (
    "id" SERIAL NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "signer_id" TEXT NOT NULL,
    "block_height" INTEGER NOT NULL,
    "outcome_index" INTEGER NOT NULL,
    "account_id" TEXT NOT NULL,
    "method_name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "args" TEXT NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);
