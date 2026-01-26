import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";
import AnnouncementForm from "./createView"; // Importe o componente que criamos acima

export default async function CreateAnnouncementPage() {
  // Checagem de segurança no SERVIDOR
  const session = await getSession();
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-10 bg-[#08090a] min-h-screen text-[#d1d5db]">
      {/* HEADER */}
      <div className="mb-10 border-b border-[#d4af37]/20 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
          Issue <span className="text-[#d4af37]">New Announcement</span>
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          Authorized Personnel Only // Intel Command
        </p>
      </div>

      {/* CHAMADA DO CLIENT COMPONENT PASSANDO A SESSÃO */}
      <AnnouncementForm session={session} />
    </div>
  );
}