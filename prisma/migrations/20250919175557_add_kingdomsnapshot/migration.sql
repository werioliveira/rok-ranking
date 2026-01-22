-- CreateTable
CREATE TABLE "KingdomSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kingdomId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "totalPower" BIGINT NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "ranking" INTEGER
);
