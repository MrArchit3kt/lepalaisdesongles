-- CreateTable
CREATE TABLE "SecurityUpload" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "claimedAt" TIMESTAMP(3),
    "claimedEntityType" TEXT,
    "claimedEntityId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecurityUpload_key_key" ON "SecurityUpload"("key");

-- CreateIndex
CREATE INDEX "SecurityUpload_uploadedById_purpose_claimedAt_idx" ON "SecurityUpload"("uploadedById", "purpose", "claimedAt");

-- CreateIndex
CREATE INDEX "SecurityUpload_claimedEntityType_claimedEntityId_idx" ON "SecurityUpload"("claimedEntityType", "claimedEntityId");

-- CreateIndex
CREATE INDEX "SecurityUpload_expiresAt_idx" ON "SecurityUpload"("expiresAt");

-- CreateIndex
CREATE INDEX "SecurityUpload_createdAt_idx" ON "SecurityUpload"("createdAt");
