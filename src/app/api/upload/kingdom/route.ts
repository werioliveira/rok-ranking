import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string;
    const kingdomId = formData.get("kingdomId") as string;
    const kingdomName = formData.get("kingdomName") as string;

    if (!file || !kingdomId || !kingdomName) {
      return NextResponse.json(
        { error: "Arquivo, kingdomId e kingdomName são obrigatórios" },
        { status: 400 }
      );
    }

    if (password !== process.env.UPLOAD_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lê XLSX
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Converte em JSON, ignorando a primeira linha (header) e limitando a 400 registros
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    // rows[0] é o cabeçalho, ignoramos ele
    const dataRows = rows.slice(1, 301); // pega no máximo 400 linhas depois do cabeçalho

    // Agora mapear para objetos usando o cabeçalho original
    const header = rows[0];
    const limitedData = dataRows.map((row) => {
      const obj: Record<string, any> = {};
      header.forEach((key: string, idx: number) => {
        obj[key] = row[idx];
      });
      return obj;
    });

    // Calcula agregados
    const totalPower = limitedData.reduce(
      (acc, p) => acc + BigInt(p["Current Power"] || 0),
      BigInt(0)
    );
    const playerCount = limitedData.length;

    // Cria snapshot do reino
    const kingdom = await prisma.kingdomSnapshot.create({
      data: {
        kingdomId: Number(kingdomId),
        name: kingdomName,
        totalPower,
        playerCount,
      },
    });

    return NextResponse.json({
      message: "Kingdom snapshot salvo",
      kingdomId: kingdom.id,
      totalPower: kingdom.totalPower.toString(),
      playerCount: kingdom.playerCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao processar upload" },
      { status: 500 }
    );
  }
}
