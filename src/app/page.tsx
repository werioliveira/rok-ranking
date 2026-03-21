export const dynamic = "force-dynamic";
export const revalidate = 0;

import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";
import { getLatestAnnouncements } from "@/app/announcements/create/actions";
import { getActiveKvk } from "@/lib/kvk-registry";

export default async function Home() {
  const activeKvk = await getActiveKvk();
  const announcements = await getLatestAnnouncements(2);

  return (
    <div className="min-h-screen">
      <PlayerRanking kvk={activeKvk.slug} announcements={announcements} />
      <Footer />
    </div>
  );
}
