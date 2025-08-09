import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const searchTerm = searchParams.get('search') || ''
    const offset = (page - 1) * limit
    const sortBy = searchParams.get('sortBy') || 'Power'

    // Mapear campos de ordenação para colunas do banco (considerando que podem ser diferentes)
    const sortFieldMap: Record<string, string> = {
      'Power': 'power',
      'Killpoints': 'killpoints', 
      'Total Kills': 'totalKills',
      'T45 Kills': 't45Kills',
      'Rss Gathered': 'CAST(rssGathered AS UNSIGNED)' // Para ordenar numericamente se for string
    }

    const orderByField = sortFieldMap[sortBy] || 'power'

    // Construir condição de busca
    const searchCondition = searchTerm.trim() 
      ? `AND name LIKE '%${searchTerm.trim().replace(/'/g, "''")}%'`
      : ''

    // Primeiro, contar o total de jogadores únicos (com filtro de busca se aplicável)
    const totalPlayersQuery = `
      SELECT COUNT(DISTINCT playerId) as count
      FROM PlayerSnapshot
      WHERE (playerId, createdAt) IN (
        SELECT playerId, MAX(createdAt)
        FROM PlayerSnapshot
        GROUP BY playerId
      )
      ${searchCondition}
    `
    
    const totalPlayers = await prisma.$queryRawUnsafe<{ count: BigInt }[]>(totalPlayersQuery)
    const total = Number(totalPlayers[0].count)
    const totalPages = Math.ceil(total / limit)

    // Buscar os snapshots mais recentes com paginação, ordenação e busca
    const playersQuery = `
      SELECT *
      FROM PlayerSnapshot
      WHERE (playerId, createdAt) IN (
        SELECT playerId, MAX(createdAt)
        FROM PlayerSnapshot
        GROUP BY playerId
      )
      ${searchCondition}
      ORDER BY ${orderByField} DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const latestSnapshots = await prisma.$queryRawUnsafe<any[]>(playersQuery)

    const serialized = latestSnapshots.map(player => ({
      ...player,
      rssGathered: (player.rssGathered !== null && player.rssGathered !== undefined) ? player.rssGathered.toString() : "0",
      rssAssist: (player.rssAssist !== null && player.rssAssist !== undefined) ? player.rssAssist.toString() : "0",
    }))

    return NextResponse.json({
      data: serialized,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao buscar jogadores" }, { status: 500 })
  }
}