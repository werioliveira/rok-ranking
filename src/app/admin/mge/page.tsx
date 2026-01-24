import { getSession } from "@/lib/getSession";
import { getPrismaClient } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createMGEEvent, updateMGERequestStatus } from "@/lib/actions/mge";
import { Check, X, Shield, User, ScrollText, PlusCircle, Lock } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function MGEAdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  const activeEvent = await prisma.mGEEvent.findFirst({ where: { active: true } });
  
  const requests = activeEvent 
    ? await prisma.mGERequest.findMany({
        where: { 
          status: "PENDING",
          eventId: activeEvent.id 
        },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-6">
{activeEvent ? (
            <div className="flex justify-between items-center font-bold">
              <div>
                <h1 className="text-3xl uppercase text-amber-500">{activeEvent.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-slate-500 italic text-sm">Registrations Open</p>
                   <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 uppercase">
                     {activeEvent.slots || 15} Slots Total
                   </span>
                </div>
              </div>
              
<form 
    action={async () => {
      "use server";
      const kvk = process.env.KVK_DB_VERSION || "1";
      const p = getPrismaClient(kvk);
      await p.mGEEvent.updateMany({ where: { active: true }, data: { active: false } });
      revalidatePath("/admin/mge");
      revalidatePath("/mge/list"); // Garante que a lista pública atualize o status para "Final"
    }}
  >
    <button className="group relative flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-95">
      <Lock className="w-4 h-4 transition-transform group-hover:rotate-12" />
      Close & Lock Event
      
      {/* Detalhe estético de brilho no hover */}
      <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  </form>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PlusCircle className="text-amber-500" /> Open New MGE Cycle
              </h2>
              
              <form action={async (formData) => {
                "use server";
                const name = formData.get("eventName") as string;
                const slots = parseInt(formData.get("slots") as string) || 15;
                
                if (name) {
                  // Passamos agora o nome e o número de slots para a Action
                  await createMGEEvent(name, slots);
                }
              }} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <input 
                    name="eventName"
                    required
                    placeholder="Ex: MGE #2 - Saladin"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  
                  {/* Seletor de Slots */}
                  <select 
                    name="slots"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="15">15 Slots</option>
                    <option value="10">10 Slots</option>
                  </select>

                  <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-2 rounded-lg font-black uppercase text-sm transition-all whitespace-nowrap">
                    Start Registration
                  </button>
                </div>
              </form>

              <p className="text-slate-500 text-xs mt-3 italic">
                * Creating a new MGE will automatically archive the previous one.
              </p>
            </div>
          )}
        </header>

        <div className="grid gap-4 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800 rounded-2xl">
              <ScrollText className="h-12 w-12 text-slate-700 mb-4" />
              <p className="text-slate-500 font-medium">The horizon is clear. No new requests.</p>
            </div>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="group relative bg-[#111] border border-slate-800 rounded-xl p-5 hover:border-amber-500/50 transition-all duration-300 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6">
                  
                  <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-amber-500">
                    <User size={32} />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">{r.playerName}</h3>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono border border-slate-700">
                        #{r.playerId}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Shield size={16} className="text-amber-500" />
                        <span>Commander: <strong className="text-slate-200">{r.commanderName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-bold uppercase">
                          STATUS: {r.commanderState}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
                      <p className="text-sm text-slate-400 italic leading-relaxed">
                        &ldquo;{r.reason}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <form action={async () => { "use server"; await updateMGERequestStatus(r.id, "ACCEPTED"); }}>
                      <button className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all active:scale-95 shadow-lg">
                        <Check size={18} />
                        Approve
                      </button>
                    </form>
                    <form action={async () => { "use server"; await updateMGERequestStatus(r.id, "REJECTED"); }}>
                      <button className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-transparent hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg font-bold transition-all active:scale-95">
                        <X size={18} />
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}