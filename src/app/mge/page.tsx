import { getSession } from "@/lib/getSession";
import { getPrismaClient } from "@/lib/prisma";
import { Clock, CheckCircle2, XCircle, ShieldAlert, Calendar, Swords, Tag } from "lucide-react";

export default async function MyRequestsPage() {
  const session = await getSession();
  
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <ShieldAlert size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Access restricted. Please log in.</p>
      </div>
    );
  }

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  const myRequests = await prisma.mGERequest.findMany({
    where: { userId: session.user.id },
    include: { event: true },
    orderBy: { createdAt: "desc" },
  });

  const statusConfig = {
    PENDING: { 
      label: "Under Review", 
      color: "text-amber-500", 
      icon: Clock, 
      bg: "bg-amber-500/10",
      border: "border-amber-500/20" 
    },
    ACCEPTED: { 
      label: "Approved", 
      color: "text-emerald-400", 
      icon: CheckCircle2, 
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20" 
    },
    REJECTED: { 
      label: "Rejected", 
      color: "text-red-400", 
      icon: XCircle, 
      bg: "bg-red-400/10", 
      border: "border-red-400/20"
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Swords size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">MGE Log</span>
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
              My <span className="text-amber-500">Requests</span>
            </h1>
            <p className="text-slate-500 mt-2">Track the status of your MGE reservations for KvK {kvkId}</p>
          </div>
          
          <div className="bg-slate-900/40 px-4 py-2 rounded-lg border border-slate-800 text-sm">
            <span className="text-slate-500">Logged as:</span> <span className="text-white font-semibold">{session.user.name}</span>
          </div>
        </div>

        {/* Request List */}
        <div className="grid gap-6">
          {myRequests.length === 0 ? (
            <div className="text-center py-16 bg-[#0a0a0a] border border-slate-800 rounded-2xl">
              <p className="text-slate-500 italic">You haven't submitted any requests for this KvK yet.</p>
            </div>
          ) : (
            myRequests.map((req) => {
              const config = statusConfig[req.status as keyof typeof statusConfig];
              return (
                <div 
                  key={req.id} 
                  className={`relative overflow-hidden bg-[#0d0d0d] border ${config.border} rounded-2xl p-6 transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bg.replace('/10', '')}`} />

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-white tracking-wide">{req.commanderName}</h2>
                        
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold text-[10px] border border-amber-500/20 uppercase">
                          <Tag size={10} />
                          {req.event.name}
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                          {req.commanderState}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-600" />
                          {new Date(req.createdAt).toLocaleDateString('en-US')}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-slate-700" />
                          ID: {req.playerId}
                        </div>
                      </div>

                      <div className="bg-black/40 rounded-lg p-3 border border-slate-800/50 max-w-md">
                        <p className="text-xs leading-relaxed text-slate-400">
                          <span className="text-slate-600 font-bold uppercase text-[9px] block mb-1">Justification:</span>
                          &ldquo;{req.reason}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${config.border} ${config.bg} ${config.color}`}>
                        <config.icon size={18} />
                        <span className="text-sm font-black uppercase tracking-wider">{config.label}</span>
                      </div>
                      {req.reviewedAt && (
                        <p className="text-[10px] text-slate-600 font-medium">
                          Reviewed on: {new Date(req.reviewedAt).toLocaleDateString('en-US')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}