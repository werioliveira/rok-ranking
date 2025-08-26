import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const sortBy = searchParams.get("sortBy") || "Power";
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.trim();
    const offset = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      Power: "power",
      Killpoints: "killpoints",
      "Total Kills": "totalKills",
      "T45 Kills": "t45Kills",
      "Rss Gathered": "rssGathered",
      "Killpoints Gained": "killpointsGained",
    };
    const sortKey = sortFieldMap[sortBy] || "power";

    const escapedSearch = search.replace(/'/g, "''");

    // -------- Last updated ----------
    const lastUpdatedResult = await prisma.$queryRawUnsafe<{ last: any }[]>(
      `SELECT MAX(createdAt) as last FROM PlayerSnapshot;`
    );
    const lastUpdated = lastUpdatedResult?.[0]?.last || null;

    // -------- Main query ----------
    const playersQuery = `
      WITH first_last AS (
        SELECT
          ps.playerId,
          MIN(ps.createdAt) AS firstDate,
          MAX(ps.createdAt) AS lastDate
        FROM PlayerSnapshot ps
        GROUP BY ps.playerId
      ),
      latest AS (
        SELECT ps.*
        FROM PlayerSnapshot ps
        JOIN first_last fl ON ps.playerId = fl.playerId AND ps.createdAt = fl.lastDate
      ),
      earliest AS (
        SELECT ps.playerId, ps.killpoints AS firstKillpoints
        FROM PlayerSnapshot ps
        JOIN first_last fl ON ps.playerId = fl.playerId AND ps.createdAt = fl.firstDate
      ),
      joined AS (
        SELECT l.*, COALESCE(l.killpoints - e.firstKillpoints, 0) AS killpointsGained
        FROM latest l
        JOIN earliest e USING(playerId)
      ),
      ranked AS (
        SELECT j.*, ROW_NUMBER() OVER (ORDER BY ${sortKey} DESC) AS rank
        FROM joined j
      )
      SELECT *
      FROM ranked
      ${search ? `WHERE name LIKE '%${escapedSearch}%'` : ""}
      ORDER BY ${sortKey} DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const latestSnapshots = await prisma.$queryRawUnsafe<any[]>(playersQuery);

    // -------- Total players count ----------
    const totalPlayersQuery = `
      SELECT COUNT(*) AS count
      FROM (
        SELECT ps.playerId
        FROM PlayerSnapshot ps
        WHERE (ps.playerId, ps.createdAt) IN (
          SELECT playerId, MAX(createdAt)
          FROM PlayerSnapshot
          GROUP BY playerId
        )
        ${search ? `AND name LIKE '%${escapedSearch}%'` : ""}
      ) sub;
    `;
    const totalPlayers = await prisma.$queryRawUnsafe<{ count: bigint }[]>(totalPlayersQuery);
    const total = Number(totalPlayers?.[0]?.count || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // -------- Serialize ----------
    const toStr = (v: any) => (typeof v === "bigint" ? v.toString() : v != null ? String(v) : null);

    const serialized = latestSnapshots.map((p) => ({
      ...p,
      rank: Number(p.rank),
      power: toStr(p.power),
      killpoints: toStr(p.killpoints),
      killpointsGained: toStr(p.killpointsGained) || "0",
      totalKills: toStr(p.totalKills),
      t45Kills: toStr(p.t45Kills),
      rssGathered: toStr(p.rssGathered),
      rssAssist: toStr(p.rssAssist),
      t1Kills: toStr(p.t1Kills),
      t2Kills: toStr(p.t2Kills),
      t3Kills: toStr(p.t3Kills),
      t4Kills: toStr(p.t4Kills),
      t5Kills: toStr(p.t5Kills),
      deads: toStr(p.deads),
      helps: toStr(p.helps),
      alliance: toStr(p.alliance),
      lastUpdated: p.createdAt,
    }));

    return NextResponse.json({
      data: serialized,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      lastUpdated: serialized[0]?.lastUpdated || lastUpdated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar jogadores" }, { status: 500 });
  }
}
