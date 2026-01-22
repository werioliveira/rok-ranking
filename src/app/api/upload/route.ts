import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Verifique se o caminho do seu authOptions está correto

const kvkId = process.env.KVK_DB_VERSION || "1";
const prisma = getPrismaClient(kvkId);

export async function POST(req: NextRequest) {
  try {
    // 1. Verifica a sessão do usuário no servidor
    const session = await getServerSession(authOptions);

    // 2. Bloqueia se não estiver logado ou não for ADMIN
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const players = body.players;

    if (!Array.isArray(players)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const entries = players.map((p) => ({
      playerId: p.ID,
      name: p.Name,
      power: p.Power,
      killpoints: p.Killpoints,
      deads: p.Deads,
      t1Kills: p["T1 Kills"],
      t2Kills: p["T2 Kills"],
      t3Kills: p["T3 Kills"],
      t4Kills: p["T4 Kills"],
      t5Kills: p["T5 Kills"],
      totalKills: p["Total Kills"],
      t45Kills: p["T45 Kills"],
      ranged: p.Ranged,
      rssGathered: BigInt(p["Rss Gathered"] || 0),
      rssAssist: BigInt(p["Rss Assistance"] || 0),
      helps: p.Helps,
      alliance: p.Alliance,
    }));

    await prisma.playerSnapshot.createMany({ data: entries });
    
    return NextResponse.json({ 
      message: "Snapshots saved successfully", 
      count: entries.length 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}