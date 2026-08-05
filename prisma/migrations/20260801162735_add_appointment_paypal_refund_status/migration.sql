-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "paypalRefundStatus" TEXT,
ADD COLUMN     "refundRequestedAt" TIMESTAMP(3);
