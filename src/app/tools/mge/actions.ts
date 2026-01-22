"use server";

import { getSession } from "@/lib/getSession";

import { MGEStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";

export async function createMGERequest(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  // 1. Buscar o evento ativo
  const activeEvent = await prisma.mGEEvent.findFirst({ where: { active: true } });
  if (!activeEvent) return { error: "There are no MGE registrations open at the moment." };

  // --- NOVA VERIFICAÇÃO ---
  // 2. Verificar se o usuário já possui uma solicitação NESTE evento
  const alreadyRequested = await prisma.mGERequest.findFirst({
    where: {
      userId: session.user.id,
      eventId: activeEvent.id,
    },
  });

  if (alreadyRequested) {
    return { 
      error: `Have you already submitted a request to ${activeEvent.name}. Multiple registrations are not allowed.` 
    };
  }
  const playerName = formData.get("name")?.toString();
  const playerId = formData.get("playerId")?.toString();
  const commanderName = formData.get("commander")?.toString();
  const commanderState = formData.get("commanderStatus")?.toString();
  const reason = formData.get("reason")?.toString();

  if (
    !playerName ||
    !playerId ||
    !commanderName ||
    !commanderState ||
    !reason
  ) {
    throw new Error("Required fields missing");
  }

  await prisma.mGERequest.create({
    data: {
      userId: session.user.id,
      eventId: activeEvent.id,
      playerName,
      playerId,
      commanderName,
      commanderState,
      reason,
      status: MGEStatus.PENDING,
    },
  });
}
