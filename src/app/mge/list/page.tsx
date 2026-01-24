export const dynamic = 'force-dynamic';
import { getPrismaClient } from "@/lib/prisma";
import { Trophy, Info } from "lucide-react";

export default async function MGEPublicListPage() {
  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  // 1. Busca o evento mais recente (pode ser o ativo ou o último fechado)
  const lastEvent = await prisma.mGEEvent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  const maxSlots = lastEvent?.slots || 15;

  // 2. Busca os requests aceitos com ranking definido para este evento
  const finalList = lastEvent
    ? await prisma.mGERequest.findMany({
        where: {
          eventId: lastEvent.id,
          status: "ACCEPTED",
          score: { not: null },
        },
        orderBy: { score: "asc" },
        take: maxSlots,
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-200">
      <div className="text-center mb-10">
        <Trophy className="mx-auto h-12 w-12 text-amber-500 mb-2" />
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          Official MGE List
        </h1>
        
        {lastEvent ? (
          <div className="space-y-1">
            <p className="text-amber-500 font-bold uppercase tracking-widest">
              {lastEvent.name}
            </p>
            {/* Badge de status para informar se ainda está aberto ou se é o resultado final */}
            <span className={lastEvent.active 
              ? "text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black"
              : "text-[10px] bg-slate-500/10 text-slate-500 border border-slate-500/20 px-2 py-0.5 rounded uppercase font-black"
            }>
              {lastEvent.active ? "● Live Ranking" : "Final Results"}
            </span>
          </div>
        ) : (
          <p className="text-slate-500">No events found</p>
        )}
        <p className="text-slate-500 text-sm mt-2">KvK {kvkId} - Selected Governors</p>
      </div>

      {/* Só mostramos a tabela se houver um evento e se o admin já tiver atribuído algum score */}
      {!lastEvent || finalList.length === 0 ? (
        <div className="bg-[#111] border border-slate-800 rounded-2xl p-10 text-center">
          <Info className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">
            {lastEvent?.active 
              ? "The ranking is being organized. Check back soon!" 
              : "No rankings published for the last event."}
          </p>
        </div>
      ) : (
        <div className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="p-4 font-bold text-amber-500 uppercase text-xs tracking-wider">Rank</th>
                <th className="p-4 font-bold uppercase text-xs tracking-wider">Governor</th>
                <th className="p-4 font-bold uppercase text-xs tracking-wider">Commander</th>
                <th className="p-4 font-bold uppercase text-xs tracking-wider text-right">Governor ID</th>
              </tr>
            </thead>
            <tbody>
              {finalList.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-slate-800/50 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4 font-mono font-bold text-xl text-slate-500 italic group-hover:text-amber-500 transition-colors">
                    #{player.score}
                  </td>
                  <td className="p-4 font-bold text-white">
                    {player.playerName}
                  </td>
                  <td className="p-4 text-slate-300">
                    {player.commanderName}
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-500 text-right">
                    {player.playerId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <p className="text-center text-slate-600 text-[10px] mt-6 uppercase tracking-widest">
        MGE Management System - KvK {kvkId}
      </p>
    </div>
  );
}