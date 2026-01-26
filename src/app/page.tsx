// src/app/page.tsx
import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";
import { getLatestAnnouncements } from "@/app/announcements/create/actions";

export default async function Home() {
  // Busca os últimos 2 anúncios diretamente no servidor
  const announcements = await getLatestAnnouncements(2);

  return (
    <div className="min-h-screen">
      {/* Passamos os anúncios como prop para o componente de cliente */}
      <PlayerRanking announcements={announcements} />
      <Footer />
    </div>
  );
}