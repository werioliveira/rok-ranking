"use client";
import React from 'react';
import Link from 'next/link';

// Interface atualizada para bater com o Schema do Prisma
export interface Announcement {
  id: string;
  tag: string;
  title: string;
  summary: string;
  content?: string;
  date: string; // Convertido de DateTime para string no Server Component
  category: string;
  priority: 'high' | 'medium' | 'low';
  author: string;
}

interface Props {
  announcements?: Announcement[]; // Tornamos opcional para evitar o erro de 'undefined'
}

export default function AnnouncementsPage({ announcements = [] }: Props) {
  
  // ESTADO VAZIO: Caso o banco não tenha nenhum anúncio ainda
  if (!announcements || announcements.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto p-4 md:p-10 bg-[#08090a] text-[#d1d5db] min-h-screen font-sans antialiased flex flex-col items-center justify-center text-center">
        <div className="h-1 w-20 bg-[#d4af37]/30 rounded-full mb-8" />
        <h2 className="text-4xl font-black uppercase tracking-tighter text-white/20">
          No Intel <span className="text-[#d4af37]/10">Found</span>
        </h2>
        <p className="text-gray-600 mt-4 text-xs font-bold uppercase tracking-[0.4em]">Waiting for new Announcements...</p>
        <div className="mt-10 p-4 border border-white/5 rounded-2xl bg-[#121417]/30 text-[10px] text-gray-700 uppercase font-bold">
          Status: Encrypted & Waiting
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-10 bg-[#08090a] text-[#d1d5db] min-h-screen font-sans antialiased">
      
      {/* STRATEGIC HEADER */}
      <div className="mb-12 border-b border-[#d4af37]/20 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-1.5 w-10 bg-[#d4af37] rounded-full shadow-[0_0_15px_#d4af37]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#d4af37]">Intel Protocol</span>
        </div>
        <h1 className="text-6xl font-black uppercase tracking-tighter text-white">
          Board of <span className="text-[#d4af37]">Announcements</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* FEED DE NOTÍCIAS DINÂMICO */}
        <div className="lg:col-span-2 space-y-6">
          {announcements.map((item) => (
            <Link href={`/announcements/${item.id}`} key={item.id} className="block group">
              <article className="bg-[#121417] border border-white/5 p-6 rounded-3xl hover:border-[#d4af37]/40 transition-all duration-500 relative overflow-hidden">
                
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
{/* Substitua a parte da TAG por esta para testar */}
<span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] border ${
  item.priority === 'high' 
    ? 'border-red-500/50 text-red-500 bg-red-500/5' 
    : 'border-[#d4af37]/30 text-[#d4af37]'
}`}>
  {item.tag || "INTEL"} {/* Se item.tag for nulo, mostrará INTEL */}
</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest font-mono">
                      {item.date}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white group-hover:text-[#d4af37] transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed text-sm line-clamp-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-2">
                    <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center text-[10px] text-[#d4af37] font-black">
                      {item.author ? item.author[0].toUpperCase() : 'A'}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {item.author || "Command"}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* SIDEBAR DE STATUS */}
        <aside className="space-y-6">
          <div className="bg-[#121417] p-8 rounded-[2rem] border border-[#d4af37]/10 sticky top-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-6 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
              Strategic Status
            </h4>
            
            <div className="space-y-5">
              {[
                { label: "Kingdom Time", value: "UTC 13:42" },
                { label: "Deployment", value: "Active" },
                { label: "Admin Alerts", value: announcements.length.toString() }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-xs font-black text-white group-hover:text-[#d4af37] transition-colors font-mono">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}