"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

export default function ExportRankingButton({ players, eventName }: { players: any[], eventName: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Título em Dourado Escuro para contraste no bege
    let text = `<color=#8B4513><size=18><b>🏆 ${eventName.toUpperCase()}</b></size></color>\n\n`;

    const rankedPlayers = players
      .filter(p => p.score !== null)
      .sort((a, b) => a.score - b.score);

    rankedPlayers.forEach(p => {
      // Texto em Preto (#110F03) para leitura perfeita no fundo claro do jogo
      const rankText = `<color=#110F03><b>#${p.score}</b></color>`;
      const nameText = `<color=#110F03>${p.playerName}</color>`;
      
      // Meta de pontos em Azul Escuro para destacar sem sumir
      const points = p.targetPoints 
        ? ` -> <color=#00008B><b>${formatNumber(Number(p.targetPoints))}</b></color>` 
        : "";

      text += `${rankText} ${nameText}${points}\n`;
    });

    // Alerta final em Vermelho Sangue
    text += `\n<color=#B22222><b>DO NOT EXCEED THE LIMITS!</b></color>`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Ranking copied! (Game-safe colors)");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-500 border border-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
    >
      {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
      {copied ? "Copied!" : "Copy for In-Game"}
    </button>
  );
}