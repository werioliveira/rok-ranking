import { getPrismaClient } from "@/lib/prisma";
import { Trophy, Info } from "lucide-react";

export default async function MGEPublicListPage() {
  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  // 1. Fetch currently active event
  const activeEvent = await prisma.mGEEvent.findFirst({
    where: { active: true },
  });

  // 2. Fetch accepted requests ONLY for the active event
  const finalTen = activeEvent
    ? await prisma.mGERequest.findMany({
        where: {
          eventId: activeEvent.id,
          status: "ACCEPTED",
          score: { not: null },
        },
        orderBy: { score: "asc" },
        take: 10,
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-200">
      <div className="text-center mb-10">
        <Trophy className="mx-auto h-12 w-12 text-amber-500 mb-2" />
        <h1 className="text-4xl font-black uppercase tracking-tighter">
          Official MGE List
        </h1>
        {activeEvent ? (
          <p className="text-amber-500 font-bold animate-pulse uppercase tracking-widest">
            {activeEvent.name}
          </p>
        ) : (
          <p className="text-slate-500">No active event at the moment</p>
        )}
        <p className="text-slate-500 text-sm">KvK {kvkId} - Selected Governors</p>
      </div>

      {!activeEvent || finalTen.length === 0 ? (
        <div className="bg-[#111] border border-slate-800 rounded-2xl p-10 text-center">
          <Info className="mx-auto h-8 w-8 text-slate-600 mb-3" />
          <p className="text-slate-400">
            The ranking list has not been published for the current event yet.
          </p>
        </div>
      ) : (
        <div className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
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
              {finalTen.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-slate-800/50 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-xl text-slate-500 italic">
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