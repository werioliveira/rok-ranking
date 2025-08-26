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

    // Mapeia os rótulos do frontend para campos/expressões válidas
    const sortFieldMap: Record<string, "power" | "killpoints" | "totalKills" | "t45Kills" | "rssGathered" | "killpointsGained"> = {
      Power: "power",
      Killpoints: "killpoints",
      "Total Kills": "totalKills",
      "T45 Kills": "t45Kills",
      "Rss Gathered": "rssGathered",
      "Killpoints Gained": "killpointsGained",
    };

    const sortKey = sortFieldMap[sortBy] || "power";

    // Como precisamos usar a expressão de ordenação tanto no ROW_NUMBER()
    // (dentro do CTE) quanto no ORDER BY final, montamos duas versões:
    // - uma referenciando o alias "j." (dentro do CTE ranked)
    // - outra referenciando o alias "ranked." (SELECT final)
    const orderExprForJ =
      sortKey === "rssGathered"
        ? "CAST(j.rssGathered AS INTEGER)"
        : sortKey === "killpointsGained"
          ? "COALESCE(j.killpointsGained, 0)"
          : `j.${sortKey}`;

    const orderExprForRanked =
      sortKey === "rssGathered"
        ? "CAST(ranked.rssGathered AS INTEGER)"
        : sortKey === "killpointsGained"
          ? "COALESCE(ranked.killpointsGained, 0)"
          : `ranked.${sortKey}`;

    // Escapa aspas simples no search para evitar quebrar a string
    const escapedSearch = search.replace(/'/g, "''");
    const searchWhereRanked = search ? `WHERE ranked.name LIKE '%${escapedSearch}%'` : "";

    // -------- COUNT TOTAL (com mesmo filtro de nome) ----------
    const totalPlayersQuery = `
      WITH latest AS (
        SELECT ps.*
        FROM PlayerSnapshot ps
        WHERE (ps.playerId, ps.createdAt) IN (
          SELECT playerId, MAX(createdAt)
          FROM PlayerSnapshot
          GROUP BY playerId
        )
      ),
      gains AS (
        -- calcula killpointsGained por player: latest - earliest
        SELECT
          p.playerId,
          (
            (SELECT killpoints FROM PlayerSnapshot WHERE playerId = p.playerId ORDER BY createdAt DESC LIMIT 1)
            -
            (SELECT killpoints FROM PlayerSnapshot WHERE playerId = p.playerId ORDER BY createdAt ASC LIMIT 1)
          ) AS killpointsGained
        FROM (SELECT DISTINCT playerId FROM PlayerSnapshot) p
      ),
      joined AS (
        SELECT l.*, COALESCE(g.killpointsGained, 0) AS killpointsGained
        FROM latest l
        LEFT JOIN gains g ON g.playerId = l.playerId
      ),
      ranked AS (
        SELECT
          j.*,
          ROW_NUMBER() OVER (ORDER BY ${orderExprForJ} DESC) AS rank
        FROM joined j
      )
      SELECT COUNT(*) AS count
      FROM ranked
      ${searchWhereRanked};
    `;

    const totalPlayers = await prisma.$queryRawUnsafe<any[]>(totalPlayersQuery);
    const total = Number(totalPlayers?.[0]?.count || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // -------- LAST UPDATED (global) ----------
    const lastUpdatedResult = await prisma.$queryRawUnsafe<{ last: any }[]>(
      `SELECT MAX(createdAt) as last FROM PlayerSnapshot;`
    );
    const lastUpdated = lastUpdatedResult?.[0]?.last || null;

    // -------- QUERY PRINCIPAL (dados + rank + paginação) ----------
    const playersQuery = `
      WITH latest AS (
        SELECT ps.*
        FROM PlayerSnapshot ps
        WHERE (ps.playerId, ps.createdAt) IN (
          SELECT playerId, MAX(createdAt)
          FROM PlayerSnapshot
          GROUP BY playerId
        )
      ),
      gains AS (
        SELECT
          p.playerId,
          (
            (SELECT killpoints FROM PlayerSnapshot WHERE playerId = p.playerId ORDER BY createdAt DESC LIMIT 1)
            -
            (SELECT killpoints FROM PlayerSnapshot WHERE playerId = p.playerId ORDER BY createdAt ASC LIMIT 1)
          ) AS killpointsGained
        FROM (SELECT DISTINCT playerId FROM PlayerSnapshot) p
      ),
      joined AS (
        SELECT l.*, COALESCE(g.killpointsGained, 0) AS killpointsGained
        FROM latest l
        LEFT JOIN gains g ON g.playerId = l.playerId
      ),
      ranked AS (
        SELECT
          j.*,
          ROW_NUMBER() OVER (ORDER BY ${orderExprForJ} DESC) AS rank
        FROM joined j
      )
      SELECT
        ranked.playerId,
        ranked.name,
        ranked.alliance,
        ranked.power,
        ranked.killpoints,
        ranked.totalKills,
        ranked.t45Kills,
        ranked.rssGathered,
        ranked.rssAssist,
        ranked.t1Kills,
        ranked.t2Kills,
        ranked.t3Kills,
        ranked.t4Kills,
        ranked.t5Kills,
        ranked.deads,
        ranked.helps,
        ranked.createdAt,
        ranked.rank,
        ranked.killpointsGained
      FROM ranked
      ${searchWhereRanked}
      ORDER BY ${orderExprForRanked} DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const latestSnapshots = await prisma.$queryRawUnsafe<any[]>(playersQuery);

    // -------- SERIALIZAÇÃO (BigInt -> string) ----------
    const toStr = (v: any) =>
      typeof v === "bigint" ? v.toString() : v != null ? String(v) : null;

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
