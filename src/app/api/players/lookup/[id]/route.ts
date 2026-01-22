// app/api/players/lookup/[id]/route.ts
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";


export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const prisma = getPrismaClient(process.env.KVK_DB_VERSION || "3");
  let { id } = await params;
  const player = await prisma.playerData.findUnique({
    where: { playerId: id },
    select: { name: true }
  });

  if (!player) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(player);
}