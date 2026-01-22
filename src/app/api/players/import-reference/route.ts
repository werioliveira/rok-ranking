// app/api/players/import-reference/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { players } = await req.json(); // Array vindo do XLSX.utils.sheet_to_json
    const prisma = getPrismaClient(process.env.KVK_DB_VERSION || "3");

    // Upsert para atualizar o nome se o ID já existir ou criar novo
    const operations = players.map((p: any) => 
      prisma.playerData.upsert({
        where: { playerId: String(p["Character ID"]) },
        update: { name: p["Username"] },
        create: { playerId: String(p["Character ID"]), name: p["Username"] },
      })
    );

    await Promise.all(operations);
    return NextResponse.json({ message: "Database updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to import" }, { status: 500 });
  }
}