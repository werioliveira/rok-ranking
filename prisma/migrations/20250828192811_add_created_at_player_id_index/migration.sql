/*
  Warnings:

  - You are about to alter the column `deads` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `helps` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `killpoints` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `power` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `ranged` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `t1Kills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `t2Kills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `t3Kills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `t45Kills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `t4Kills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `t5Kills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `totalKills` on the `PlayerSnapshot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "power" BIGINT NOT NULL,
    "killpoints" BIGINT NOT NULL,
    "deads" BIGINT NOT NULL,
    "t1Kills" BIGINT NOT NULL,
    "t2Kills" BIGINT NOT NULL,
    "t3Kills" BIGINT NOT NULL,
    "t4Kills" BIGINT NOT NULL,
    "t5Kills" BIGINT NOT NULL,
    "totalKills" BIGINT NOT NULL,
    "t45Kills" BIGINT NOT NULL,
    "ranged" BIGINT NOT NULL,
    "rssGathered" BIGINT NOT NULL,
    "rssAssist" BIGINT NOT NULL,
    "helps" BIGINT NOT NULL,
    "alliance" TEXT NOT NULL
);
INSERT INTO "new_PlayerSnapshot" ("alliance", "createdAt", "deads", "helps", "id", "killpoints", "name", "playerId", "power", "ranged", "rssAssist", "rssGathered", "t1Kills", "t2Kills", "t3Kills", "t45Kills", "t4Kills", "t5Kills", "totalKills") SELECT "alliance", "createdAt", "deads", "helps", "id", "killpoints", "name", "playerId", "power", "ranged", "rssAssist", "rssGathered", "t1Kills", "t2Kills", "t3Kills", "t45Kills", "t4Kills", "t5Kills", "totalKills" FROM "PlayerSnapshot";
DROP TABLE "PlayerSnapshot";
ALTER TABLE "new_PlayerSnapshot" RENAME TO "PlayerSnapshot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
CREATE INDEX IF NOT EXISTS idx_createdAt_playerId
ON PlayerSnapshot(createdAt, playerId);
