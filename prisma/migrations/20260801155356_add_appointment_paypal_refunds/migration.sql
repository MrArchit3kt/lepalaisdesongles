/*
  Warnings:

  - A unique constraint covering the columns `[paypalRefundId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paypalRefundRequestId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "paypalRefundId" TEXT,
ADD COLUMN     "paypalRefundRequestId" TEXT,
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundedAmountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "refundedById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_paypalRefundId_key" ON "Appointment"("paypalRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_paypalRefundRequestId_key" ON "Appointment"("paypalRefundRequestId");
