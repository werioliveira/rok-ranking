import { getPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";
// Define qual KVK usar (ex: vindo de um campo oculto no form ou env)
const kvkId = process.env.KVK_DB_VERSION || "1";

  // Obtém o cliente específico para aquele banco
const prisma = getPrismaClient(kvkId);

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
      DKP: "dkp",
    };
    const sortKey = sortFieldMap[sortBy] || "power";

    const escapedSearch = search.replace(/'/g, "''");

    const isDateRangeFilter =
      ["Killpoints Gained", "Deads Gained", "Killpoints T45 Gained", "Killpoints T1 Gained"].includes(sortBy) &&
      startDate &&
      endDate;

    const lastUpdatedResult = await prisma.$queryRawUnsafe<{ last: any }[]>(
      `SELECT MAX(createdAt) as last FROM PlayerSnapshot;`
    );
    const lastUpdated = lastUpdatedResult?.[0]?.last || null;

    const startIso = startDate ? toUTCEpoch(startDate) : null;
    const endIso = endDate ? toUTCEpoch(endDate, true) : null;

    let playersQuery: string;
    // Detecta se busca é só números (ID)
    const searchIsNumeric = /^\d+$/.test(search);

    // Gera filtro
    const searchFilter = search
      ? searchIsNumeric
        ? `WHERE playerId = '${escapedSearch}'`
        : `WHERE name LIKE '%${escapedSearch}%'`
      : "";
    // ======================================================
    //  QUERY COM FILTRO DE DATAS (com ROW_NUMBER dedupe)
    // ======================================================
    if (isDateRangeFilter && startIso && endIso) {
      playersQuery = `
        WITH snaps AS (
          SELECT
            ps.*,
            ROW_NUMBER() OVER (PARTITION BY ps.playerId ORDER BY ps.createdAt ASC) AS rn_first,
            ROW_NUMBER() OVER (PARTITION BY ps.playerId ORDER BY ps.createdAt DESC) AS rn_last
          FROM PlayerSnapshot ps
          WHERE LENGTH(ps.playerId) >= 8
            AND ps.createdAt BETWEEN '${startIso}' AND '${endIso}'
        ),

        start_snap AS (
          SELECT * FROM snaps WHERE rn_first = 1
        ),

        end_snap AS (
          SELECT * FROM snaps WHERE rn_last = 1
        ),

        joined AS (
          SELECT
            e.*,
            (e.killpoints - s.killpoints) AS killpointsGained,
            (e.deads - s.deads) AS deadsGained,

            /* DKP */
            (
              ((CASE WHEN e.t4Kills > s.t4Kills THEN e.t4Kills - s.t4Kills ELSE 0 END) * 10) +
              ((CASE WHEN e.t5Kills > s.t5Kills THEN e.t5Kills - s.t5Kills ELSE 0 END) * 30) +
              ((CASE WHEN e.deads > s.deads THEN e.deads - s.deads ELSE 0 END) * 80)
            ) AS dkp,

            /* T45 Gains */
            (CASE WHEN e.t4Kills > s.t4Kills THEN e.t4Kills - s.t4Kills ELSE 0 END) AS t4KillsGained,
            (CASE WHEN e.t5Kills > s.t5Kills THEN e.t5Kills - s.t5Kills ELSE 0 END) AS t5KillsGained,

            /* Killpoints from T4+T5 */
            (
              ((CASE WHEN e.t4Kills > s.t4Kills THEN e.t4Kills - s.t4Kills ELSE 0 END) * 10) +
              ((CASE WHEN e.t5Kills > s.t5Kills THEN e.t5Kills - s.t5Kills ELSE 0 END) * 20)
            ) AS killpointsT45Gained,

            /* T1 kills gained */
            (CASE WHEN e.t1Kills > s.t1Kills THEN e.t1Kills - s.t1Kills ELSE 0 END) AS killpointsT1Gained

          FROM end_snap e
          JOIN start_snap s USING (playerId)
        ),

        ranked AS (
          SELECT j.*, ROW_NUMBER() OVER (ORDER BY ${sortKey} ${orderDirection}) AS rank
          FROM joined j
        )

      SELECT *
      FROM ranked
      ${searchFilter}
      ORDER BY ${sortKey} ${orderDirection}
      LIMIT ${limit} OFFSET ${offset};
      `;
    }

    // ======================================================
    //  QUERY SEM FILTRO DE DATAS (com ROW_NUMBER dedupe REAL)
    // ======================================================
    else {
      playersQuery = `
        WITH snaps AS (
          SELECT
            ps.*,
            ROW_NUMBER() OVER (PARTITION BY ps.playerId ORDER BY ps.createdAt DESC) AS rn_latest,
            ROW_NUMBER() OVER (PARTITION BY ps.playerId ORDER BY ps.createdAt ASC) AS rn_earliest
          FROM PlayerSnapshot ps
          WHERE LENGTH(ps.playerId) >= 8
        ),

        latest AS (
          SELECT * FROM snaps WHERE rn_latest = 1
        ),

        earliest AS (
          SELECT
            playerId,
            killpoints AS firstKillpoints,
            deads     AS firstDeads,
            t1Kills   AS firstT1,
            t4Kills   AS firstT4,
            t5Kills   AS firstT5
          FROM snaps WHERE rn_earliest = 1
        ),

        joined AS (
          SELECT
            l.*,
            (l.killpoints - e.firstKillpoints) AS killpointsGained,
            (l.deads - e.firstDeads) AS deadsGained,

            (
              ((CASE WHEN l.t4Kills > e.firstT4 THEN l.t4Kills - e.firstT4 ELSE 0 END) * 10) +
              ((CASE WHEN l.t5Kills > e.firstT5 THEN l.t5Kills - e.firstT5 ELSE 0 END) * 30) +
              ((CASE WHEN l.deads > e.firstDeads THEN l.deads - e.firstDeads ELSE 0 END) * 80)
            ) AS dkp,

            (CASE WHEN l.t4Kills > e.firstT4 THEN l.t4Kills - e.firstT4 ELSE 0 END) AS t4KillsGained,
            (CASE WHEN l.t5Kills > e.firstT5 THEN l.t5Kills - e.firstT5 ELSE 0 END) AS t5KillsGained,

            (
              ((CASE WHEN l.t4Kills > e.firstT4 THEN l.t4Kills - e.firstT4 ELSE 0 END) * 10) +
              ((CASE WHEN l.t5Kills > e.firstT5 THEN l.t5Kills - e.firstT5 ELSE 0 END) * 20)
            ) AS killpointsT45Gained,

            ROUND((CASE WHEN l.t1Kills > e.firstT1 THEN (l.t1Kills - e.firstT1) * 0.2 ELSE 0 END), 0) AS killpointsT1Gained

          FROM latest l
          JOIN earliest e USING (playerId)
        ),

        ranked AS (
          SELECT j.*, ROW_NUMBER() OVER (ORDER BY ${sortKey} ${orderDirection}) AS rank
          FROM joined j
        )

        SELECT *
        FROM ranked
        ${searchFilter}
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
