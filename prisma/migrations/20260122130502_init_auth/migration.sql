-- CreateTable
CREATE TABLE "MGERequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerName" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "commanderName" TEXT NOT NULL,
    "commanderState" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT
);

-- CreateIndex
CREATE INDEX "MGERequest_status_idx" ON "MGERequest"("status");
