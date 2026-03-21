export const dynamic = "force-dynamic";
export const revalidate = 0;

import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";
<<<<<<< HEAD
import { getAnnouncements } from "@/app/announcements/create/actions";

export default async function Home() {
  // Busca os últimos 2 anúncios diretamente no servidor
  const announcements = await getAnnouncements();
=======
import { getLatestAnnouncements } from "@/app/announcements/create/actions";
import { getActiveKvk } from "@/lib/kvk-registry";

export default async function Home() {
  const activeKvk = await getActiveKvk();
  const announcements = await getLatestAnnouncements(2);

>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw
  return (
    <div className="min-h-screen">
      <PlayerRanking kvk={activeKvk.slug} announcements={announcements} />
      <Footer />
    </div>
  );
}
