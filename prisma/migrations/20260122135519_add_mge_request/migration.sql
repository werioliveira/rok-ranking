/*
  Warnings:

  - Added the required column `userId` to the `MGERequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MGERequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
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
    CONSTRAINT "MGERequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MGERequest" ("commanderName", "commanderState", "createdAt", "id", "playerId", "playerName", "reason", "reviewedAt", "reviewedBy", "score", "status") SELECT "commanderName", "commanderState", "createdAt", "id", "playerId", "playerName", "reason", "reviewedAt", "reviewedBy", "score", "status" FROM "MGERequest";
DROP TABLE "MGERequest";
ALTER TABLE "new_MGERequest" RENAME TO "MGERequest";
CREATE INDEX "MGERequest_status_idx" ON "MGERequest"("status");
CREATE INDEX "MGERequest_userId_idx" ON "MGERequest"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
