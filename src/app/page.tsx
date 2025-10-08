import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";


export default function Home() {
  return (
    <div className="min-h-screen">
      <PlayerRanking/>
      <Footer/>
    </div>
  );
}
