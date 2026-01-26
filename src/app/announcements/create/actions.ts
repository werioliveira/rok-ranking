"use server";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const kvkId = process.env.KVK_DB_VERSION || "1";
const prisma = getPrismaClient(kvkId);
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function createAnnouncement(formData: FormData) {
  // 1. Aqui você adicionaria sua lógica de verificação de ADMIN
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
  const author = formData.get("author") as string;

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
  redirect("/announcements");
}
export async function deleteAnnouncement(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) return;

  // Lógica de proteção: Aqui você verificaria se o usuário é Admin via Session
  
  await prisma.announcement.delete({
    where: { id: id },
  });

  revalidatePath("/announcements");
  redirect("/announcements");
}
export async function getLatestAnnouncements(limit = 2) {
  try {
    const data = await prisma.announcement.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      tag: item.tag,
      priority: item.priority,
      date: item.createdAt.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short'
      })
    }));
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}