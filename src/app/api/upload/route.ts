// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server"
import prismaKvk2 from "@/lib/prisma-kvk2";

const prisma = prismaKvk2

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const clientPassword = body.password;
    const serverPassword = process.env.UPLOAD_SECRET;

    if (clientPassword !== serverPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const players = body.players;

    if (!Array.isArray(players)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
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
    rssGathered: BigInt(p["Rss Gathered"]),
    rssAssist: BigInt(p["Rss Assistance"]),
    helps: p.Helps,
    alliance: p.Alliance,
    }));

    await prisma.playerSnapshot.createMany({ data: entries })
    return NextResponse.json({ message: "Snapshots saved", count: entries.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
