"use server";

import { getSession } from "@/lib/getSession";

import { MGEStatus } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMGERequest(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "You must be logged in." };

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);


// LOGS PARA DEBUG (Confira no terminal do VS Code/CMD)
  const rawAdminEntry = formData.get("isAdminEntry");
  const isAdmin = session.user.role === "ADMIN";
  const isAdminEntry = String(rawAdminEntry) === "true" && isAdmin;
  
  const playerName = formData.get("name")?.toString();
  const playerId = formData.get("playerId")?.toString();
  const commanderName = formData.get("commander")?.toString();
  const rawCommanderState = formData.get("commanderStatus")?.toString(); // Pegamos o valor bruto
  const reason = formData.get("reason")?.toString();
  // LÓGICA DE PADRONIZAÇÃO: Se vazio, vira 0000
  const commanderState = (!rawCommanderState || rawCommanderState.trim() === "") 
  ? "0000" 
  : rawCommanderState;

  // 2. VERIFICAÇÃO DE EVENTO ATIVO
  const activeEvent = await prisma.mGEEvent.findFirst({ where: { active: true } });
  if (!activeEvent) return { error: "MGE registrations are currently closed." };

  // 3. TRAVA DE DUPLICIDADE (APENAS PARA PLAYERS)
  // Se for Admin Entry, pulamos essa verificação completamente.
  if (!isAdminEntry) {
    const existingRequest = await prisma.mGERequest.findFirst({
      where: {
        userId: session.user.id,
        eventId: activeEvent.id
      }
    });
    
    if (existingRequest) {
      return { error: `Have you already submitted a request to ${activeEvent.name}. Multiple registrations are not allowed.` };
    }
  }

  // 4. VALIDAÇÃO DE CAMPOS
  if (!playerName || !playerId || !commanderName || !reason) {
    return { error: "Please fill in all required fields." };
  }

  try {
    await prisma.mGERequest.create({
      data: {
        // ESSENCIAL: No modo admin, o userId PRECISA ser null
        // para não colidir com o seu próprio registro pessoal ou outros manuais.
        userId: isAdminEntry ? null : session.user.id,
        recordedBy: isAdminEntry ? session.user.name : null,
        
        eventId: activeEvent.id,
        playerName,
        playerId,
        commanderName,
        commanderState: commanderState,
        reason,
        status: isAdminEntry ? MGEStatus.ACCEPTED : MGEStatus.PENDING,
      },
    });

    revalidatePath("/admin/mge");
    revalidatePath("/mge");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Error saving request." };
  }
}
