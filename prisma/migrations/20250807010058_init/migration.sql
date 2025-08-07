-- CreateTable
CREATE TABLE "PlayerSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "killpoints" INTEGER NOT NULL,
    "deads" INTEGER NOT NULL,
    "t1Kills" INTEGER NOT NULL,
    "t2Kills" INTEGER NOT NULL,
    "t3Kills" INTEGER NOT NULL,
    "t4Kills" INTEGER NOT NULL,
    "t5Kills" INTEGER NOT NULL,
    "totalKills" INTEGER NOT NULL,
    "t45Kills" INTEGER NOT NULL,
    "ranged" INTEGER NOT NULL,
    "rssGathered" BIGINT NOT NULL,
    "rssAssist" BIGINT NOT NULL,
    "helps" INTEGER NOT NULL,
    "alliance" TEXT NOT NULL
);
