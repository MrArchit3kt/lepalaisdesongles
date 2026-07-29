-- AlterTable
ALTER TABLE "SecurityUpload" ADD COLUMN     "cleanupAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cleanupLastError" TEXT,
ADD COLUMN     "cleanupRunId" TEXT,
ADD COLUMN     "cleanupStartedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "SecurityUpload_claimedAt_expiresAt_cleanupStartedAt_idx" ON "SecurityUpload"("claimedAt", "expiresAt", "cleanupStartedAt");

-- CreateIndex
CREATE INDEX "SecurityUpload_cleanupRunId_idx" ON "SecurityUpload"("cleanupRunId");
