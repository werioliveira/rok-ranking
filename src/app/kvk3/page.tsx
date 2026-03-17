import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";
import { getAnnouncements } from "../announcements/create/actions";


export default async function Home() {
  const announcements = await getAnnouncements();
  return (
    <div className="min-h-screen">
      <PlayerRanking kvk='kvk3' announcements={announcements} />
      <Footer/>
    </div>
  );
}
