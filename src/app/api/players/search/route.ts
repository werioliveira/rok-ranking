import { NextResponse } from "next/server";
import { getKvkPrismaClient } from "@/lib/prisma";
<<<<<<< HEAD
=======
import { resolveKvkSlug } from "@/lib/kvk-context";
>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  // Só busca se tiver pelo menos 3 caracteres para não travar o banco
  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

<<<<<<< HEAD
  const prisma = getKvkPrismaClient(process.env.KVK_DB_VERSION || "3");
=======
  const prisma = getKvkPrismaClient(await resolveKvkSlug(searchParams.get("kvk")));
>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw

  try {
    const players = await prisma.playerData.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      take: 6, // Limita para não sobrecarregar o layout
      select: {
        playerId: true,
        name: true,
      },
    });
    console.log(players)
    return NextResponse.json(players);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}