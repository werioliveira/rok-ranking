import { NextResponse } from "next/server";
import prismaKvk2 from "@/lib/prisma-kvk2";

const prisma = prismaKvk2;

function serializeValue(v: any): any {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Date) return v.toISOString();
  return v;
}

function toUTCEpoch(dateStr: string, isEndOfDay = false) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return isEndOfDay
    ? Date.UTC(year, month - 1, day, 23, 59, 59, 999)
    : Date.UTC(year, month - 1, day, 0, 0, 0, 0);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const sortBy = searchParams.get("sortBy") || "Power";
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.trim();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const offset = (page - 1) * limit;

    // Novo parâmetro order (asc | desc)
    const orderParam = (searchParams.get("order") || "desc").toLowerCase();
    const orderDirection = orderParam === "asc" ? "ASC" : "DESC";

    const sortFieldMap: Record<string, string> = {
      Power: "power",
      Killpoints: "killpoints",
      "Total Kills": "totalKills",
      "T45 Kills": "t45Kills",
      "Rss Gathered": "rssGathered",
      "Killpoints Gained": "killpointsGained",
      "Deads Gained": "deadsGained",
      "Killpoints T45 Gained": "killpointsT45Gained",
      "Killpoints T1 Gained": "killpointsT1Gained",
      "DKP": "dkp",
    };
    const sortKey = sortFieldMap[sortBy] || "power";

    const escapedSearch = search.replace(/'/g, "''");

    const isDateRangeFilter =
      (sortBy === "Killpoints Gained" ||
        sortBy === "Deads Gained" ||
        sortBy === "Killpoints T45 Gained" ||
        sortBy === "Killpoints T1 Gained") &&
      startDate &&
      endDate;

    const lastUpdatedResult = await prisma.$queryRawUnsafe<{ last: any }[]>(
      `SELECT MAX(createdAt) as last FROM PlayerSnapshot;`
    );
    const lastUpdated = lastUpdatedResult?.[0]?.last || null;

    const startIso = startDate ? toUTCEpoch(startDate) : null;
    const endIso = endDate ? toUTCEpoch(endDate, true) : null;

    let playersQuery: string;

    // 🔹 Query com filtro de datas
    if (isDateRangeFilter && startIso && endIso) {
      playersQuery = `
        WITH boundaries AS (
          SELECT
            playerId,
            MIN(createdAt) AS startDate,
            MAX(createdAt) AS endDate
          FROM PlayerSnapshot
          WHERE LENGTH(playerId) >= 8
            AND createdAt BETWEEN '${startIso}' AND '${endIso}'
          GROUP BY playerId
        ),
        start_snap AS (
          SELECT 
            ps.playerId, 
            ps.killpoints AS startKillpoints,
            ps.deads AS startDeads,
            ps.t1Kills AS startT1,
            ps.t4Kills AS startT4,
            ps.t5Kills AS startT5
          FROM PlayerSnapshot ps
          JOIN boundaries b 
            ON ps.playerId = b.playerId AND ps.createdAt = b.startDate
        ),
        end_snap AS (
          SELECT 
            ps.playerId,
            ps.killpoints AS endKillpoints,
            ps.deads AS endDeads,
            ps.t1Kills AS endT1,
            ps.t4Kills AS endT4,
            ps.t5Kills AS endT5,
            ps.createdAt,
            ps.name,
            ps.power,
            ps.totalKills,
            ps.t45Kills,
            ps.rssGathered,
            ps.rssAssist,
            ps.t2Kills,
            ps.t3Kills,
            ps.helps,
            ps.alliance
          FROM PlayerSnapshot ps
          JOIN boundaries b 
            ON ps.playerId = b.playerId AND ps.createdAt = b.endDate
        ),
        joined AS (
          SELECT
            e.*,
            COALESCE(CAST(e.endKillpoints AS INTEGER) - CAST(s.startKillpoints AS INTEGER), 0) AS killpointsGained,
            COALESCE(CAST(e.endDeads AS INTEGER) - CAST(s.startDeads AS INTEGER), 0) AS deadsGained,
          (COALESCE(
            (CASE WHEN (e.endT4 - s.startT4) > 0 THEN (e.endT4 - s.startT4) ELSE 0 END) * 10 +
            (CASE WHEN (e.endT5 - s.startT5) > 0 THEN (e.endT5 - s.startT5) ELSE 0 END) * 30 +
            (CASE WHEN (e.endDeads - s.startDeads) > 0 THEN (e.endDeads - s.startDeads) ELSE 0 END) * 80
          , 0)) AS dkp,
            COALESCE(
              (CASE WHEN (e.endT4 - s.startT4) > 0 THEN (e.endT4 - s.startT4) ELSE 0 END),
              0
            ) AS t4KillsGained,
            COALESCE(
              (CASE WHEN (e.endT5 - s.startT5) > 0 THEN (e.endT5 - s.startT5) ELSE 0 END),
              0
            ) AS t5KillsGained,
            COALESCE(
              (CASE WHEN (e.endT4 - s.startT4) > 0 THEN (e.endT4 - s.startT4) ELSE 0 END) * 10 +
              (CASE WHEN (e.endT5 - s.startT5) > 0 THEN (e.endT5 - s.startT5) ELSE 0 END) * 20,
              0
            ) AS killpointsT45Gained,
            COALESCE(
              (CASE WHEN (e.endT1 - s.startT1) > 0 THEN (e.endT1 - s.startT1) ELSE 0 END),
              0
            ) AS killpointsT1Gained
          FROM end_snap e
          JOIN start_snap s USING (playerId)
          WHERE (e.endKillpoints - s.startKillpoints) > 0
             OR (e.endDeads - s.startDeads) > 0
        ),
        ranked AS (
          SELECT j.*, ROW_NUMBER() OVER (ORDER BY ${sortKey} ${orderDirection}) AS rank
          FROM joined j
        )
        SELECT *
        FROM ranked
        ${search ? `WHERE name LIKE '%${escapedSearch}%'` : ""}
        ORDER BY ${sortKey} ${orderDirection}
        LIMIT ${limit} OFFSET ${offset};
      `;
    } 
    // 🔹 Query sem filtro de datas
    else {
      playersQuery = `
        WITH first_last AS (
          SELECT
            ps.playerId,
            MIN(ps.createdAt) AS firstDate,
            MAX(ps.createdAt) AS lastDate
          FROM PlayerSnapshot ps
          WHERE LENGTH(ps.playerId) >= 8
          GROUP BY ps.playerId
        ),
        latest AS (
          SELECT ps.*
          FROM PlayerSnapshot ps
          JOIN first_last fl ON ps.playerId = fl.playerId AND ps.createdAt = fl.lastDate
        ),
        earliest AS (
          SELECT 
            ps.playerId, 
            ps.killpoints AS firstKillpoints,
            ps.deads AS firstDeads,
            ps.t1Kills AS firstT1,
            ps.t4Kills AS firstT4,
            ps.t5Kills AS firstT5
          FROM PlayerSnapshot ps
          JOIN first_last fl ON ps.playerId = fl.playerId AND ps.createdAt = fl.firstDate
        ),
        joined AS (
          SELECT 
            l.*, 
            COALESCE(l.killpoints - e.firstKillpoints, 0) AS killpointsGained,
            COALESCE(l.deads - e.firstDeads, 0) AS deadsGained,
          (COALESCE(
            (CASE WHEN (l.t4Kills - e.firstT4) > 0 THEN (l.t4Kills - e.firstT4) ELSE 0 END) * 10 +
            (CASE WHEN (l.t5Kills - e.firstT5) > 0 THEN (l.t5Kills - e.firstT5) ELSE 0 END) * 30 +
            (CASE WHEN (l.deads - e.firstDeads) > 0 THEN (l.deads - e.firstDeads) ELSE 0 END) * 80
          , 0)) AS dkp,
           COALESCE(
              (CASE WHEN (l.t4Kills - e.firstT4) > 0 THEN (l.t4Kills - e.firstT4) ELSE 0 END),
              0
            ) AS t4KillsGained,
            COALESCE(
              (CASE WHEN (l.t5Kills - e.firstT5) > 0 THEN (l.t5Kills - e.firstT5) ELSE 0 END),
              0
            ) AS t5KillsGained,
            COALESCE(
              (CASE WHEN (l.t4Kills - e.firstT4) > 0 THEN (l.t4Kills - e.firstT4) ELSE 0 END) * 10 +
              (CASE WHEN (l.t5Kills - e.firstT5) > 0 THEN (l.t5Kills - e.firstT5) ELSE 0 END) * 20,
              0
            ) AS killpointsT45Gained,
            COALESCE(
              (CASE WHEN (l.t1Kills - e.firstT1) > 0 THEN (l.t1Kills - e.firstT1) ELSE 0 END),
              0
            ) AS killpointsT1Gained
          FROM latest l
          JOIN earliest e USING(playerId)
        ),
        ranked AS (
          SELECT j.*, ROW_NUMBER() OVER (ORDER BY ${sortKey} ${orderDirection}) AS rank
          FROM joined j
        )
        SELECT *
        FROM ranked
        ${search ? `WHERE name LIKE '%${escapedSearch}%'` : ""}
        ORDER BY ${sortKey} ${orderDirection}
        LIMIT ${limit} OFFSET ${offset};
      `;
    }

    const latestSnapshots = await prisma.$queryRawUnsafe<any[]>(playersQuery);

    const totalPlayers = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT playerId) as count FROM PlayerSnapshot WHERE LENGTH(playerId) >= 8;`
    );

    const total = Number(totalPlayers?.[0]?.count || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const serialized = latestSnapshots.map((p) => ({
      playerId: serializeValue(p.playerId),
      name: serializeValue(p.name),
      rank: Number(p.rank) || 0,
      power: serializeValue(p.power),
      killpoints: serializeValue(p.killpoints),
      killpointsGained: serializeValue(p.killpointsGained) ?? "0",
      deadsGained: Number(serializeValue(p.deadsGained) ?? 0),
      killpointsT45Gained: Number(serializeValue(p.killpointsT45Gained) ?? 0),
      killpointsT1Gained: Number(serializeValue(p.killpointsT1Gained) ?? 0),
      t4KillsGained: Number(serializeValue(p.t4KillsGained) ?? 0),
      t5KillsGained: Number(serializeValue(p.t5KillsGained) ?? 0),
      totalKills: serializeValue(p.totalKills),
      t45Kills: serializeValue(p.t45Kills),
      rssGathered: serializeValue(p.rssGathered),
      rssAssist: serializeValue(p.rssAssist),
      t1Kills: serializeValue(p.t1Kills),
      t2Kills: serializeValue(p.t2Kills),
      t3Kills: serializeValue(p.t3Kills),
      t4Kills: serializeValue(p.t4Kills),
      t5Kills: serializeValue(p.t5Kills),
      deads: serializeValue(p.deads),
      helps: serializeValue(p.helps),
      alliance: serializeValue(p.alliance),
      lastUpdated: serializeValue(p.createdAt),
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
      lastUpdated: serialized[0]?.lastUpdated ?? serializeValue(lastUpdated),
      order: orderDirection,
      ...(isDateRangeFilter && {
        dateFilter: { startDate, endDate, isActive: true },
      }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar jogadores" }, { status: 500 });
  }
}
