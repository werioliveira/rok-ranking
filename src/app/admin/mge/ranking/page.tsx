import { getSession } from "@/lib/getSession";
import { getPrismaClient } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { setMGERank } from "@/lib/actions/mge";
import { Trophy, Star, AlertTriangle } from "lucide-react";

export default async function MGERankingPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  const activeEvent = await prisma.mGEEvent.findFirst({
    where: { active: true }
  });
  const maxSlots = activeEvent?.slots || 15;
  const acceptedRequests = activeEvent 
    ? await prisma.mGERequest.findMany({
        where: { 
          status: "ACCEPTED",
          eventId: activeEvent.id 
        },
        orderBy: [
          { score: "asc" }, 
          { playerName: "asc" }
        ],
      })
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-amber-500 flex items-center gap-3">
              <Trophy size={32} />
              MGE Top 10 Ranking
            </h1>
            <p className="text-slate-500">
              {activeEvent 
                ? `Managing positions for: ${activeEvent.name}` 
                : "No active event selected"}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm font-bold text-slate-400">
             KvK {kvkId}
          </div>
        </header>

        {!activeEvent ? (
          <div className="flex flex-col items-center justify-center py-20 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <AlertTriangle className="text-amber-500 mb-4" size={48} />
            <p className="text-slate-400 font-medium text-center px-6">
              There is no active MGE event. <br /> 
              Create an event in the Command Center to manage the ranking.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {acceptedRequests.length === 0 ? (
               <div className="text-center py-10 bg-slate-900/20 border border-slate-800 rounded-xl">
                  <p className="text-slate-500 italic text-sm">No requests have been approved for this MGE yet.</p>
               </div>
            ) : (
              acceptedRequests.map((r) => (
                <div 
                  key={r.id} 
                  className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border transition-all ${
                    r.score ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#111] border-slate-800'
                  }`}
                >
                  <div className={`h-12 w-12 flex items-center justify-center rounded-lg font-black text-2xl ${
                    r.score ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {r.score || "?"}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-lg text-white">{r.playerName}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">
                      {r.commanderName} • {r.commanderState}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <form 
                      key={`${r.id}-${r.score}`} 
                      action={async (formData) => {
                        "use server";
                        const val = formData.get("rank");
                        const rank = val === "none" ? null : parseInt(val as string);
                        await setMGERank(r.id, rank);
                      }} 
                      className="flex gap-2"
                    >
                      <select 
                        name="rank" 
                        defaultValue={r.score || "none"}
                        className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500"
                      >
                        <option value="none">No Rank</option>
                        {[...Array(maxSlots)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>Rank {i + 1}</option>
                        ))}
                      </select>
                      <button 
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-sm transition-all"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeEvent && (
          <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg flex gap-3 items-start">
            <Star className="text-blue-500 shrink-0" size={20} />
            <p className="text-xs text-blue-200/70 leading-relaxed">
              <strong>Tip:</strong> You are editing the ranking for <strong>{activeEvent.name}</strong>. 
              Changes reflect instantly on the public player list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}