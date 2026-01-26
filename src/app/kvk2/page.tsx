import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";
import { getLatestAnnouncements } from "../announcements/create/actions";


export default async function Home() {
  const announcements = await getLatestAnnouncements(2);
  return (
    <div className="min-h-screen">
      <PlayerRanking kvk='kvk2' announcements={announcements} />
      <Footer/>
    </div>
  );
}
