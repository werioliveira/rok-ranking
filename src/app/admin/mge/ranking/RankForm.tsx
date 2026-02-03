"use client";

import { useState } from "react";
import { Target, Save, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { setMGERank } from "@/lib/actions/mge";

export default function RankForm({ requestId, currentRank, currentPoints, maxSlots }: any) {
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(currentPoints?.toString() || "");
  const [rank, setRank] = useState(currentRank?.toString() || "none");

  const numericPoints = parseInt(points) || 0;

  async function handleSave() {
    if (loading) return;
    setLoading(true);
    await setMGERank(requestId, rank === "none" ? null : parseInt(rank), numericPoints || null);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {/* SELETOR DE RANK */}
      <select 
        value={rank}
        onChange={(e) => setRank(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-2 text-white outline-none focus:border-amber-500 h-9 w-24"
      >
        <option value="none">Rank?</option>
        {[...Array(maxSlots)].map((_, i) => (
          <option key={i + 1} value={i + 1}>Rank {i + 1}</option>
        ))}
      </select>

      {/* INPUT COM DECODIFICADOR EM TEMPO REAL */}
      <div className="relative group flex-1 min-w-[160px]">
        <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
        
        <input
          type="text"
          inputMode="numeric"
          value={points}
          onChange={(e) => setPoints(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Ex: 20000000"
          className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-16 text-sm text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
        />

        {/* BADGE DE LEITURA HUMANA (Dentro do Input) */}
        {numericPoints > 0 && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 text-[10px] font-black tracking-tighter shadow-sm">
              {formatNumber(numericPoints)}
            </span>
          </div>
        )}
      </div>

      {/* BOTÃO SALVAR */}
      <button 
        onClick={handleSave}
        disabled={loading}
        className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-black rounded-lg transition-all h-9 w-9 flex items-center justify-center shrink-0 shadow-lg active:scale-95"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      </button>
    </div>
  );
}