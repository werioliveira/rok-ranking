"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TrendingUp, Swords, Flame, Skull, Info } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function DkpDisplay({ t4, t5, deads }: { t4: number; t5: number; deads: number }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const dkp = t4 * 10 + t5 * 30 + deads * 80;

  const color =
    dkp > 0 ? "text-purple-400" :
    dkp < 0 ? "text-red-500" :
    "text-muted-foreground";

  // -------------------------------------
  // 🎨 VISUAL DO GATILHO
  // - Desktop: underline + hover highlight
  // - Mobile: botão suave com borda
  // -------------------------------------

const Trigger = (
  <div
    className={`
      group flex items-center justify-center gap-2 text-xs cursor-help transition-all
      
      ${isMobile
        ? "px-2 py-1 rounded-md border border-neutral-700/50 bg-neutral-800/40 active:scale-95"
        : "hover:opacity-75"
      }
    `}
  >
    <TrendingUp
      className={`
        w-3 h-3 transition-transform
        ${color}
        ${dkp < 0 ? "rotate-180" : ""}
        ${!isMobile ? "group-hover:scale-110" : ""}
      `}
    />

    <span className="text-muted-foreground">DKP:</span>

    <span className={`font-semibold ${color}`}>
      {dkp > 0 ? "+" : ""}
      {formatNumber(dkp)}
    </span>

    {/* 🔵 Ícone só no mobile */}
    {isMobile && (
      <Info className="w-3 h-3 text-neutral-400" />
    )}
  </div>
);
  // -------------------------------------
  // 🧩 CONTEÚDO DO TOOLTIP/POPOVER
  // -------------------------------------

  const Content = (
    <div className="p-4 bg-neutral-900 rounded-xl shadow-xl border border-neutral-700 text-xs max-w-[260px]">
      <p className="font-semibold text-purple-300 text-sm text-center mb-3">
        DKP Breakdown
      </p>

      <div className="grid grid-cols-3 gap-3 text-neutral-300">
        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
          <Swords className="w-4 h-4 text-blue-300 mb-1" />
          <span className="text-[10px] text-neutral-400">T4 Kills</span>
          <span className="text-sm font-semibold">{t4.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500">×10</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
          <Flame className="w-4 h-4 text-orange-300 mb-1" />
          <span className="text-[10px] text-neutral-400">T5 Kills</span>
          <span className="text-sm font-semibold">{t5.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500">×30</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
          <Skull className="w-4 h-4 text-red-300 mb-1" />
          <span className="text-[10px] text-neutral-400">Deads</span>
          <span className="text-sm font-semibold">{deads.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500">×80</span>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-700/70 my-3" />

      <p className="text-sm font-semibold text-purple-300 text-center">
        Total DKP: {dkp.toLocaleString()}
      </p>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Popover>
          <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
          <PopoverContent side="top" className="p-0 border-none">
            {Content}
          </PopoverContent>
        </Popover>
      ) : (
        <TooltipProvider>
          <Tooltip delayDuration={120}>
            <TooltipTrigger asChild>{Trigger}</TooltipTrigger>
            <TooltipContent side="top" className="p-0 border-none">
              {Content}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
