import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Serializa valores que podem quebrar JSON.stringify (bigint, Date)
function serializeValue(v: any): any {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Date) return v.toISOString();
  return v;
}
function toUTCEpoch(dateStr: string, isEndOfDay = false) {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!isEndOfDay) {
    return Date.UTC(year, month - 1, day, 0, 0, 0, 0);       // início do dia UTC
  } else {
    return Date.UTC(year, month - 1, day, 23, 59, 59, 999); // fim do dia UTC
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const sortBy = searchParams.get("sortBy") || "Power";
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.trim();
    const startDate = searchParams.get("startDate"); // esperado: YYYY-MM-DD
    const endDate = searchParams.get("endDate");     // esperado: YYYY-MM-DD
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

    // É filtro por período específico quando o usuário escolhe "Killpoints Gained" e passou start/end
    const isDateRangeFilter = sortBy === "Killpoints Gained" && startDate && endDate;

    // lastUpdated (pode vir como string/Date/bigint dependendo do armazenamento)
    const lastUpdatedResult = await prisma.$queryRawUnsafe<{ last: any }[]>(
      `SELECT MAX(createdAt) as last FROM PlayerSnapshot;`
    );
    const lastUpdated = lastUpdatedResult?.[0]?.last || null;

    // helper: formar iso para comparações

const startIso = startDate ? toUTCEpoch(startDate) : null;
const endIso = endDate ? toUTCEpoch(endDate, true) : null;

    // ---------- Main query ----------
    let playersQuery: string;

if (isDateRangeFilter && startIso && endIso) {
  playersQuery = `
    WITH boundaries AS (
      SELECT
        playerId,
        MIN(createdAt) AS startDate,
        MAX(createdAt) AS endDate
      FROM PlayerSnapshot
      WHERE createdAt BETWEEN '${startIso}' AND '${endIso}'
      GROUP BY playerId
    ),
    start_snap AS (
      SELECT ps.playerId, ps.killpoints AS startKillpoints
      FROM PlayerSnapshot ps
      JOIN boundaries b 
        ON ps.playerId = b.playerId AND ps.createdAt = b.startDate
    ),
    end_snap AS (
      SELECT ps.playerId,
             ps.killpoints AS endKillpoints,
             ps.createdAt,
             ps.name,
             ps.power,
             ps.killpoints,
             ps.totalKills,
             ps.t45Kills,
             ps.rssGathered,
             ps.rssAssist,
             ps.t1Kills,
             ps.t2Kills,
             ps.t3Kills,
             ps.t4Kills,
             ps.t5Kills,
             ps.deads,
             ps.helps,
             ps.alliance
      FROM PlayerSnapshot ps
      JOIN boundaries b 
        ON ps.playerId = b.playerId AND ps.createdAt = b.endDate
    ),
    joined AS (
      SELECT
        e.*,
        COALESCE(CAST(e.endKillpoints AS INTEGER) - CAST(s.startKillpoints AS INTEGER), 0) AS killpointsGained
      FROM end_snap e
      JOIN start_snap s USING (playerId)
      WHERE (e.endKillpoints - s.startKillpoints) > 0
    ),
    ranked AS (
      SELECT j.*, ROW_NUMBER() OVER (ORDER BY killpointsGained DESC) AS rank
      FROM joined j
    )
    SELECT *
    FROM ranked
    ${search ? `WHERE name LIKE '%${escapedSearch}%'` : ""}
    ORDER BY killpointsGained DESC
    LIMIT ${limit} OFFSET ${offset};
  `;
} else {
      // Consulta padrão (período total: usa primeiro e último snapshot do jogador)
      playersQuery = `
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
    }

    const latestSnapshots = await prisma.$queryRawUnsafe<any[]>(playersQuery);

    // ---------- Total players count ----------
    let totalPlayersQuery: string;

    if (isDateRangeFilter && startIso && endIso) {
      totalPlayersQuery = `
        SELECT COUNT(*) AS count
        FROM (
          WITH all_players AS (
            SELECT DISTINCT playerId
            FROM PlayerSnapshot
          ),
          date_boundaries AS (
            SELECT
              ap.playerId,
              (SELECT ps1.createdAt
               FROM PlayerSnapshot ps1
               WHERE ps1.playerId = ap.playerId
                 AND ps1.createdAt >= '${startIso}'
                 AND ps1.createdAt <= '${endIso}'
               ORDER BY ps1.createdAt ASC
               LIMIT 1) AS closestStartDate,
              (SELECT ps2.createdAt
               FROM PlayerSnapshot ps2
               WHERE ps2.playerId = ap.playerId
                 AND ps2.createdAt >= '${startIso}'
                 AND ps2.createdAt <= '${endIso}'
               ORDER BY ps2.createdAt DESC
               LIMIT 1) AS closestEndDate
            FROM all_players ap
          ),
          period_snapshots AS (
            SELECT
              db.playerId,
              ps_start.killpoints AS startKillpoints,
              ps_end.killpoints AS endKillpoints,
              ps_end.name
            FROM date_boundaries db
            JOIN PlayerSnapshot ps_start ON ps_start.playerId = db.playerId AND ps_start.createdAt = db.closestStartDate
            JOIN PlayerSnapshot ps_end   ON ps_end.playerId   = db.playerId AND ps_end.createdAt   = db.closestEndDate
            WHERE db.closestStartDate IS NOT NULL
              AND db.closestEndDate IS NOT NULL
          ),
          period_joined AS (
            SELECT
              ps.playerId,
              ps.name,
              COALESCE(CAST(ps.endKillpoints AS INTEGER) - CAST(ps.startKillpoints AS INTEGER), 0) AS killpointsGained
            FROM period_snapshots ps
            WHERE COALESCE(CAST(ps.endKillpoints AS INTEGER) - CAST(ps.startKillpoints AS INTEGER), 0) > 0
          )
          SELECT playerId, name
          FROM period_joined
          ${search ? `WHERE name LIKE '%${escapedSearch}%'` : ""}
        ) sub;
      `;
    } else {
      totalPlayersQuery = `
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
    }

    const totalPlayers = await prisma.$queryRawUnsafe<{ count: bigint }[]>(totalPlayersQuery);
    const total = Number(totalPlayers?.[0]?.count || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    // ---------- Serialize resultados ----------
    const serialized = latestSnapshots.map((p) => ({
      playerId: serializeValue(p.playerId),
      name: serializeValue(p.name),
      rank: Number(p.rank) || 0,
      power: serializeValue(p.power),
      killpoints: serializeValue(p.killpoints),
      killpointsGained: serializeValue(p.killpointsGained) ?? "0",
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
      ...(isDateRangeFilter && p.startKillpoints !== undefined && {
        periodStartKillpoints: serializeValue(p.startKillpoints),
        periodEndKillpoints: serializeValue(p.endKillpoints ?? p.killpoints),
      }),
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
      ...(isDateRangeFilter && {
        dateFilter: {
          startDate,
          endDate,
          isActive: true,
        },
      }),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar jogadores" }, { status: 500 });
  }
}
