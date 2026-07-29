-- CreateTable
CREATE TABLE "SecurityRateLimit" (
    "id" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subjectHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecurityRateLimit_bucket_key" ON "SecurityRateLimit"("bucket");

-- CreateIndex
CREATE INDEX "SecurityRateLimit_action_lastAttemptAt_idx" ON "SecurityRateLimit"("action", "lastAttemptAt");

-- CreateIndex
CREATE INDEX "SecurityRateLimit_subjectHash_idx" ON "SecurityRateLimit"("subjectHash");

-- CreateIndex
CREATE INDEX "SecurityRateLimit_blockedUntil_idx" ON "SecurityRateLimit"("blockedUntil");

-- CreateIndex
CREATE INDEX "SecurityRateLimit_expiresAt_idx" ON "SecurityRateLimit"("expiresAt");
