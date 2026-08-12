-- CreateTable
CREATE TABLE "FavoriteService" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteService_userId_idx" ON "FavoriteService"("userId");

-- CreateIndex
CREATE INDEX "FavoriteService_serviceId_idx" ON "FavoriteService"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteService_userId_serviceId_key" ON "FavoriteService"("userId", "serviceId");

-- AddForeignKey
ALTER TABLE "FavoriteService" ADD CONSTRAINT "FavoriteService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteService" ADD CONSTRAINT "FavoriteService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
