import AnnouncementDetail from "./announcementDetail";
import { getMainPrismaClient } from "@/lib/prisma";
const prisma = getMainPrismaClient();
// Força o Next.js a sempre buscar dados novos do banco
export const revalidate = 0; 

export default async function Page({ params }: { params: { id: string } }) {
const {id} = await params
const data = await prisma.announcement.findUnique({ where: { id: id } });
return <AnnouncementDetail announcement={data} />;

}