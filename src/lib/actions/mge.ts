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
export async function createMGEEvent(name: string, description?: string) {
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
  if (!session) return { error: "You must be logged in to submit a request." };

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  // 1. Check for active event
  const activeEvent = await prisma.mGEEvent.findFirst({ where: { active: true } });
  if (!activeEvent) return { error: "MGE registrations are currently closed." };

  // 2. Check if user already has a request for THIS active event
  const existingRequest = await prisma.mGERequest.findFirst({
    where: {
      userId: session.user.id,
      eventId: activeEvent.id
    }
  });

  if (existingRequest) {
    return { error: `You have already submitted a request for ${activeEvent.name}.` };
  }

  // 3. Data validation
  const playerName = formData.get("name")?.toString();
  const playerId = formData.get("playerId")?.toString();
  const commanderName = formData.get("commander")?.toString();
  const commanderState = formData.get("commanderStatus")?.toString();
  const reason = formData.get("reason")?.toString();

  if (!playerName || !playerId || !commanderName || !reason) {
    return { error: "Please fill in all required fields." };
  }

  try {
    await prisma.mGERequest.create({
      data: {
        userId: session.user.id,
        eventId: activeEvent.id,
        playerName,
        playerId,
        commanderName,
        commanderState: commanderState || "N/A",
        reason,
        status: "PENDING",
      },
    });

    revalidatePath("/tools/mge/my-requests");
    return { success: true };
  } catch (e) {
    console.error("MGE_CREATE_ERROR:", e);
    return { error: "An error occurred while saving your request. Please try again." };
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