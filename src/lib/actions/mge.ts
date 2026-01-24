"use server";

import { getSession } from "@/lib/getSession";
import { getPrismaClient } from "@/lib/prisma";
import { MGEStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Updates the status of an MGE request (Approve/Reject)
 */
export async function updateMGERequestStatus(id: string, status: MGEStatus) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized access.");
  }

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  await prisma.mGERequest.update({
    where: { id },
    data: { 
      status,
      reviewedAt: new Date(),
      reviewedBy: session.user.name
    },
  });

  revalidatePath("/admin/mge");
}

/**
 * Assigns a specific rank (1-10) to an approved request
 */
export async function setMGERank(id: string, rank: number | null) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return;

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  await prisma.mGERequest.update({
    where: { id },
    data: { score: rank }
  });

  revalidatePath("/admin/mge/ranking");
  revalidatePath("/tools/mge/list"); // Update public list if it exists
}

/**
 * Creates a new MGE cycle and archives the previous active one
 */
export async function createMGEEvent(name: string, slots: number, description?: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized access.");
  }

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  // Deactivate any currently active event
  await prisma.mGEEvent.updateMany({
    where: { active: true },
    data: { active: false }
  });

  const event = await prisma.mGEEvent.create({
    data: {
      name,
      description,
      slots,
      active: true,
    }
  });

  revalidatePath("/admin/mge");
  revalidatePath("/tools/mge");
  return event;
}

/**
 * Handles the submission of a new MGE request by a player
 */
export async function createMGERequest(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "You must be logged in." };

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);


// LOGS PARA DEBUG (Confira no terminal do VS Code/CMD)
  const rawAdminEntry = formData.get("isAdminEntry");
  const isAdmin = session.user.role === "ADMIN";
  const isAdminEntry = String(rawAdminEntry) === "true" && isAdmin;

  console.log("--- DEBUG MGE ---");
  console.log("Raw Value from Form:", rawAdminEntry);
  console.log("Is Admin User:", isAdmin);
  console.log("Is Admin Entry (Calculated):", isAdminEntry);
  
  const playerName = formData.get("name")?.toString();
  const playerId = formData.get("playerId")?.toString();
  const commanderName = formData.get("commander")?.toString();
  const commanderState = formData.get("commanderStatus")?.toString();
  const reason = formData.get("reason")?.toString();

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
        commanderState: commanderState || "N/A",
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

/**
 * Utility to fetch the currently active MGE event
 */
export async function getActiveEvent() {
  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);
  return await prisma.mGEEvent.findFirst({ where: { active: true } });
}