export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";

import { getLatestAnnouncements } from "@/app/announcements/create/actions";
import Footer from "@/components/Footer";
import { PlayerRanking } from "@/components/PlayerRanking";
import { getKvkBySlug } from "@/lib/kvk-registry";

export default async function KvkPage({ params }: { params: Promise<{ kvk: string }> }) {
  const { kvk } = await params;
  const selectedKvk = await getKvkBySlug(kvk);

  if (!selectedKvk) {
    notFound();
  }

  const announcements = await getLatestAnnouncements(2);

  return (
    <div className="min-h-screen">
      <PlayerRanking kvk={selectedKvk.slug} announcements={announcements} />
      <Footer />
    </div>
  );
}
