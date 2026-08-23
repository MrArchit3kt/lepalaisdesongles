-- CreateEnum
CREATE TYPE "WheelSegmentKind" AS ENUM ('LOSE', 'PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "WheelSpinTrigger" AS ENUM ('BOOKING', 'DAILY');

-- CreateTable
CREATE TABLE "WheelSegment" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "WheelSegmentKind" NOT NULL,
    "percentageValue" INTEGER,
    "amountCents" INTEGER,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "colorHex" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WheelSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WheelSpin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "trigger" "WheelSpinTrigger" NOT NULL,
    "appointmentId" TEXT,
    "promotionId" TEXT,
    "spunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WheelSpin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WheelSegment_isActive_sortOrder_idx" ON "WheelSegment"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WheelSpin_appointmentId_key" ON "WheelSpin"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "WheelSpin_promotionId_key" ON "WheelSpin"("promotionId");

-- CreateIndex
CREATE INDEX "WheelSpin_userId_trigger_spunAt_idx" ON "WheelSpin"("userId", "trigger", "spunAt");

-- AddForeignKey
ALTER TABLE "WheelSpin" ADD CONSTRAINT "WheelSpin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelSpin" ADD CONSTRAINT "WheelSpin_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "WheelSegment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelSpin" ADD CONSTRAINT "WheelSpin_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WheelSpin" ADD CONSTRAINT "WheelSpin_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
