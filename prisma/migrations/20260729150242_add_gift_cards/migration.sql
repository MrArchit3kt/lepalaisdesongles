-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'PARTIALLY_USED', 'USED', 'CANCELLED', 'REVOKED', 'EXPIRED', 'PAYMENT_FAILED');

-- CreateEnum
CREATE TYPE "GiftCardTransactionType" AS ENUM ('CREATED', 'PAYMENT_CONFIRMED', 'PAYMENT_FAILED', 'REDEMPTION', 'REDEMPTION_REVERSAL', 'CANCELLED', 'REVOKED', 'REACTIVATED', 'EXPIRED', 'EMAIL_SENT');

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "initialAmountCents" INTEGER NOT NULL,
    "balanceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "purchaserFirstName" TEXT NOT NULL,
    "purchaserLastName" TEXT NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "recipientFirstName" TEXT NOT NULL,
    "recipientLastName" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "personalMessage" TEXT,
    "paypalOrderId" TEXT,
    "paypalCaptureId" TEXT,
    "paypalPayerId" TEXT,
    "checkoutTokenHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "fullyUsedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "cancellationReason" TEXT,
    "revocationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiftCardTransaction" (
    "id" TEXT NOT NULL,
    "giftCardId" TEXT NOT NULL,
    "type" "GiftCardTransactionType" NOT NULL,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "balanceBeforeCents" INTEGER NOT NULL,
    "balanceAfterCents" INTEGER NOT NULL,
    "note" TEXT,
    "reason" TEXT,
    "actorId" TEXT,
    "paypalOrderId" TEXT,
    "paypalCaptureId" TEXT,
    "reversedAt" TIMESTAMP(3),
    "reversedById" TEXT,
    "reversalReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_reference_key" ON "GiftCard"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_paypalOrderId_key" ON "GiftCard"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_paypalCaptureId_key" ON "GiftCard"("paypalCaptureId");

-- CreateIndex
CREATE INDEX "GiftCard_status_createdAt_idx" ON "GiftCard"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GiftCard_status_expiresAt_idx" ON "GiftCard"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "GiftCard_purchaserEmail_idx" ON "GiftCard"("purchaserEmail");

-- CreateIndex
CREATE INDEX "GiftCard_recipientEmail_idx" ON "GiftCard"("recipientEmail");

-- CreateIndex
CREATE INDEX "GiftCard_createdAt_idx" ON "GiftCard"("createdAt");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_giftCardId_createdAt_idx" ON "GiftCardTransaction"("giftCardId", "createdAt");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_type_createdAt_idx" ON "GiftCardTransaction"("type", "createdAt");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_actorId_createdAt_idx" ON "GiftCardTransaction"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_paypalOrderId_idx" ON "GiftCardTransaction"("paypalOrderId");

-- CreateIndex
CREATE INDEX "GiftCardTransaction_paypalCaptureId_idx" ON "GiftCardTransaction"("paypalCaptureId");

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_giftCardId_fkey" FOREIGN KEY ("giftCardId") REFERENCES "GiftCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftCardTransaction" ADD CONSTRAINT "GiftCardTransaction_reversedById_fkey" FOREIGN KEY ("reversedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
