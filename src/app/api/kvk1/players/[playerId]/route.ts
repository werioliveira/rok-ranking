// app/api/players/[playerId]/route.ts
import { NextResponse } from "next/server"

import { getPrismaClient } from "@/lib/prisma";

const prisma = getPrismaClient("1");

// Helper function para converter BigInt para Number recursivamente
function convertBigIntAndDate(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntAndDate);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (typeof obj[key] === 'bigint') {
        newObj[key] = obj[key].toString();
      } else if (obj[key] instanceof Date) {
        newObj[key] = obj[key].toISOString();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        newObj[key] = convertBigIntAndDate(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
  return obj;
}


export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
    let { playerId } = await params;
  try {
    playerId = parseInt(playerId)

    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: "ID do jogador inválido" },
        { status: 400 }
      )
    }

    const latestSnapshot = await prisma.$queryRawUnsafe<any[]>(`
      SELECT *
      FROM PlayerSnapshot
      WHERE playerId = ${playerId}
      ORDER BY createdAt DESC
      LIMIT 1
    `)
    if (latestSnapshot.length === 0) {
      return NextResponse.json(
        { error: "Jogador não encontrado" },
        { status: 404 }
      )
    }

    const playerHistory = await prisma.$queryRawUnsafe<any[]>(`
      SELECT *
      FROM PlayerSnapshot
      WHERE playerId = ${playerId}
      ORDER BY createdAt ASC
    `)

    const stats = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        COUNT(*) as totalSnapshots,
        MIN(createdAt) as firstSnapshot,
        MAX(createdAt) as lastSnapshot,
        MIN(power) as minPower,
        MAX(power) as maxPower,
        MIN(killpoints) as minKillpoints,
        MAX(killpoints) as maxKillpoints,
        MIN(totalKills) as minTotalKills,
        MAX(totalKills) as maxTotalKills
      FROM PlayerSnapshot
      WHERE playerId = ${playerId}
    `)

    const rankQuery = await prisma.$queryRawUnsafe<{ rank: bigint }[]>(`
      SELECT COUNT(*) + 1 as rank
      FROM PlayerSnapshot p1
      WHERE p1.power > ${latestSnapshot[0].power}
      AND (p1.playerId, p1.createdAt) IN (
        SELECT playerId, MAX(createdAt)
        FROM PlayerSnapshot
        GROUP BY playerId
      )
    `)

    const weekAgoSnapshot = await prisma.$queryRawUnsafe<any[]>(`
      SELECT *
      FROM PlayerSnapshot
      WHERE playerId = ${playerId}
      AND createdAt <= datetime('now', '-7 days')
      ORDER BY createdAt DESC
      LIMIT 1
    `)

    // Converter BigInt para Number em todos os dados
    const latestConverted = convertBigIntAndDate(latestSnapshot[0]);
    const historyConverted = convertBigIntAndDate(playerHistory);
    const statsConverted = convertBigIntAndDate(stats[0]);
    const rankConverted = convertBigIntAndDate(rankQuery[0]);
    const weekAgoConverted = weekAgoSnapshot.length > 0 ? convertBigIntAndDate(weekAgoSnapshot[0]) : null;

    // Serializar dados com valores já convertidos
    const currentData = {
      ...latestConverted,
      rssGathered: latestConverted.rssGathered?.toString() || "0",
      rssAssist: latestConverted.rssAssist?.toString() || "0",
      currentRank: rankConverted.rank,
    }

    const history = historyConverted.map((snapshot: any) => ({
      ...snapshot,
      rssGathered: snapshot.rssGathered?.toString() || "0",
      rssAssist: snapshot.rssAssist?.toString() || "0",
    }))

    const statistics = {
      totalSnapshots: statsConverted.totalSnapshots,
      firstSnapshot: statsConverted.firstSnapshot,
      lastSnapshot: statsConverted.lastSnapshot,
      minPower: statsConverted.minPower,
      maxPower: statsConverted.maxPower,
      powerGrowth: statsConverted.maxPower - statsConverted.minPower,
      killpointsGrowth: statsConverted.maxKillpoints - statsConverted.minKillpoints,
      totalKillsGrowth: statsConverted.maxTotalKills - statsConverted.minTotalKills,
    }

    let weeklyTrends = null
    if (weekAgoConverted) {
      weeklyTrends = {
        powerChange: currentData.power - weekAgoConverted.power,
        killpointsChange: currentData.killpoints - weekAgoConverted.killpoints,
        totalKillsChange: currentData.totalKills - weekAgoConverted.totalKills,
      }
    }

    return NextResponse.json({
      currentData,
      history,
      statistics,
      weeklyTrends,
    })
  } catch (error) {
    console.error("Erro ao buscar dados do jogador:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}