// app/api/players/lookup/[id]/route.ts
import { NextResponse } from "next/server";
import { getKvkPrismaClient } from "@/lib/prisma";
<<<<<<< HEAD


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const prisma = getKvkPrismaClient(process.env.KVK_DB_VERSION || "3");
=======
import { resolveKvkSlug } from "@/lib/kvk-context";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(req.url);
  const prisma = getKvkPrismaClient(await resolveKvkSlug(searchParams.get("kvk")));
>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw
  let { id } = await params;
  const player = await prisma.playerData.findUnique({
    where: { playerId: id },
    select: { name: true }
  });

  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(player);
}