/*
  Warnings:

  - Added the required column `eventId` to the `MGERequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MGEEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MGERequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "commanderName" TEXT NOT NULL,
    "commanderState" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "score" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    CONSTRAINT "MGERequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MGERequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "MGEEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MGERequest" ("commanderName", "commanderState", "createdAt", "id", "playerId", "playerName", "reason", "reviewedAt", "reviewedBy", "score", "status", "userId") SELECT "commanderName", "commanderState", "createdAt", "id", "playerId", "playerName", "reason", "reviewedAt", "reviewedBy", "score", "status", "userId" FROM "MGERequest";
DROP TABLE "MGERequest";
ALTER TABLE "new_MGERequest" RENAME TO "MGERequest";
CREATE INDEX "MGERequest_status_idx" ON "MGERequest"("status");
CREATE INDEX "MGERequest_userId_idx" ON "MGERequest"("userId");
CREATE INDEX "MGERequest_eventId_idx" ON "MGERequest"("eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "MGEEvent_active_idx" ON "MGEEvent"("active");
