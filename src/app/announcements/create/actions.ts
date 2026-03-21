"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getMainPrismaClient } from "@/lib/prisma";

const prisma = getMainPrismaClient();

export async function createAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const tag = formData.get("tag") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;
  const author = session.user.name || "Unknown";

  await prisma.announcement.create({
    data: {
      title,
      summary,
      content,
      tag,
      category,
      priority,
      author,
      published: true,
    },
  });

  revalidatePath("/announcements");
  revalidatePath("/announcements/create");
  redirect("/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = formData.get("id") as string;

  await prisma.announcement.delete({
    where: { id },
  });

  revalidatePath("/announcements");
  revalidatePath("/announcements/create");
  redirect("/announcements/create");
}

export async function getAnnouncements() {
  try {
    const data = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
<<<<<<< HEAD
      take: 2,
=======
>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw
    });

    return data.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    return [];
  }
}

export async function updateAnnouncement(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const tag = formData.get("tag") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;

  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      summary,
      content,
      tag,
      category,
      priority,
    },
  });

  revalidatePath("/announcements");
  revalidatePath("/announcements/create");
  redirect("/announcements/create");
}
<<<<<<< HEAD
=======


export async function getLatestAnnouncements(limit = 2) {
  try {
    const data = await prisma.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return data.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Erro ao buscar últimos anúncios:", error);
    return [];
  }
}
>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw
