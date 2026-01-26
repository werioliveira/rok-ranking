// src/app/announcements/page.tsx
import AnnouncementsView from "@/components/AnnouncementsView";
import { getPrismaClient } from "@/lib/prisma";
const kvkId = process.env.KVK_DB_VERSION || "1";
const prisma = getPrismaClient(kvkId);
// Força o Next.js a sempre buscar dados novos do banco
export const revalidate = 0; 

export default async function Page() {
  // 1. Busca direta do banco de dados (Server-side)
  const data = await prisma.announcement.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Formata os dados para o formato que o componente espera
  // Precisamos converter objetos Date do Prisma para Strings para o Client
  const formattedAnnouncements = data.map(item => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    tag: item.tag,
    category: item.category,
    priority: item.priority as 'high' | 'medium' | 'low',
    author: item.author,
    date: item.createdAt.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }));

  // 3. Renderiza o componente de design passando os dados
  return <AnnouncementsView announcements={formattedAnnouncements} />;
}