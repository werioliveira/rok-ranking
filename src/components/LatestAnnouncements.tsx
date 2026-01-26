"use client";
import Link from "next/link";
import { Megaphone, WifiOff } from "lucide-react";

export const LatestAnnouncements = ({ announcements }: { announcements?: any[] }) => {
  // Verificamos se há anúncios
  const hasAnnouncements = announcements && announcements.length > 0;

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="bg-[#121417]/30 border-y border-white/5 py-2 overflow-hidden">
        <div className="flex items-center gap-6 whitespace-nowrap">
          
          {/* LABEL FIXO */}
          <div className="flex items-center gap-2 px-4 border-r border-white/10 bg-background/50 z-10">
            <Megaphone className="h-3 w-3 text-[#d4af37]" />
            <span className="text-[9px] font-black uppercase tracking-tighter text-[#d4af37]">Intel Board</span>
          </div>

          {/* CONTEÚDO DINÂMICO OU MENSAGEM VAZIA */}
          <div className="flex flex-1 gap-8 overflow-x-auto no-scrollbar py-1">
            {hasAnnouncements ? (
              announcements.map((item) => (
                <Link 
                  href={`/announcements/${item.id}`} 
                  key={item.id}
                  className="group flex items-center gap-3 shrink-0"
                >
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-500 uppercase border border-white/5 group-hover:border-[#d4af37]/30 transition-colors">
                    {item.tag}
                  </span>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                </Link>
              ))
            ) : (
              /* MENSAGEM EM INGLÊS CASO NÃO TENHA ANÚNCIOS */
              <div className="flex items-center gap-2 opacity-40">
                <WifiOff className="h-3 w-3 text-gray-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 italic">
                  No active intelligence reports available at this time
                </span>
              </div>
            )}
          </div>

          {/* LINK PARA TODOS */}
          <Link 
            href="/announcements" 
            className="ml-auto pr-4 text-[9px] font-black uppercase text-gray-600 hover:text-[#d4af37] transition-colors"
          >
            Full Feed
          </Link>
        </div>
      </div>
    </div>
  );
};