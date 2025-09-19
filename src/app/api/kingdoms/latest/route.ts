import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    const url = new URL(req.url);
    const orderBy = url.searchParams.get("orderBy") || "kingdomId";
    const orderDir = url.searchParams.get("orderDir") === "asc" ? 1 : -1;
  try {
    const kingdomIds = await prisma.kingdomSnapshot.findMany({
      distinct: ["kingdomId"],
      select: { kingdomId: true },
    });

    let totalCurrentPower = 0;
    let totalPreviousPower = 0;

    // Para cada kingdomId, pega os 2 snapshots mais recentes
    const latestSnapshots = await Promise.all(
      kingdomIds.map(async ({ kingdomId }) => {
        const snapshots = await prisma.kingdomSnapshot.findMany({
          where: { kingdomId },
          orderBy: { createdAt: "desc" },
          take: 2,
        });

        const latest = snapshots[0];
        const previous = snapshots[1];

        const powerChange = previous ? Number(latest.totalPower) - Number(previous.totalPower) : 0;

        // Acumula para dashboard
        totalCurrentPower += Number(latest.totalPower);
        totalPreviousPower += previous ? Number(previous.totalPower) : 0;

        return {
          ...latest,
          powerChange,
        };
      })
    );



const ranked = latestSnapshots
  .filter(Boolean)
  .sort((a, b) => {
    if (orderBy === "totalPower") {
      return orderDir === 1
        ? Number(a!.totalPower) - Number(b!.totalPower)
        : Number(b!.totalPower) - Number(a!.totalPower);
    } else { // default: kingdomId
      return orderDir === 1 ? a!.kingdomId - b!.kingdomId : b!.kingdomId - a!.kingdomId;
    }
  })
  .map((k, idx) => ({
    id: k!.id,
    kingdomId: k!.kingdomId,
    name: k!.name,
    totalPower: k!.totalPower.toString(),
    playerCount: k!.playerCount,
    ranking: idx + 1,
    powerChange: k!.powerChange,
  }));


    // Dashboard geral
    const dashboard = {
      totalCurrentPower,
      totalPreviousPower,
      totalChange: totalCurrentPower - totalPreviousPower,
      totalChangePercent: totalPreviousPower
        ? ((totalCurrentPower - totalPreviousPower) / totalPreviousPower) * 100
        : 0,
    };

    return NextResponse.json({ ranked, dashboard });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao buscar reinos" }, { status: 500 });
  }
}
