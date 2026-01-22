"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createMGERequest } from "./actions";
import { CheckCircle2, AlertCircle, Loader2, Search, Fingerprint, Shield } from "lucide-react";
import clsx from "clsx";

type Props = {
  userName: string;
};

export default function MGEForm({ userName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [commanderStatus, setCommanderStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [idFound, setIdFound] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [reason, setReason] = useState("");
  
  const charLimit = 300;
  const isSkillsValid = commanderStatus.length === 4;
  const canSubmit = idFound && isSkillsValid && reason.length > 0 && !isPending;

  useEffect(() => {
    if (playerId.length < 7) {
      setSearchDone(false);
      setIdFound(false);
      setPlayerName("");
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/players/lookup/${playerId}`);
        if (response.ok) {
          const data = await response.json();
          setPlayerName(data.name);
          setIdFound(true);
        } else {
          setIdFound(false);
          setPlayerName("ID not registered"); 
        }
      } catch (error) {
        setIdFound(false);
      } finally {
        setIsSearching(false);
        setSearchDone(true);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [playerId]);

  async function handleSubmit(formData: FormData) {
    if (!canSubmit) return;
    setMessage(null);
    startTransition(async () => {
      const result = await createMGERequest(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Your request has been successfully submitted!" });
        formRef.current?.reset();
        setPlayerId("");
        setPlayerName("");
        setCommanderStatus("");
        setReason("");
        setIdFound(false);
        setSearchDone(false);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 bg-[#0f0f0f] border border-slate-800 rounded-xl p-6 shadow-2xl">
      
      {message && (
        <div className={clsx(
          "p-4 rounded-lg flex items-center gap-3 border animate-in fade-in slide-in-from-top-2",
          message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CHARACTER ID - Agora como TEXT para evitar arrows */}
        <div className="relative">
          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <Fingerprint className="w-3 h-3 mr-1 text-amber-500" /> Character ID
          </label>
          <div className="relative group">
            <input
              name="playerId"
              type="text" // Alterado para text
              inputMode="numeric" // Melhora o teclado no mobile
              required
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value.replace(/[^0-9]/g, ''))} // Garante apenas números
              placeholder="Ex: 196468115"
              className="w-full rounded-lg border border-slate-800 px-4 py-3 bg-slate-900/40 text-white focus:border-amber-500 outline-none transition-all pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px]">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              ) : idFound ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
              ) : searchDone && !idFound ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Search className="w-4 h-4 text-slate-600" />
              )}
            </div>
          </div>
        </div>

        {/* USERNAME */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Username
          </label>
          <input
            name="name"
            value={playerName}
            readOnly
            placeholder="Waiting for ID..."
            className={clsx(
              "w-full rounded-lg border px-4 py-3 outline-none transition-all font-bold",
              idFound 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-slate-900/20 border-slate-800 text-slate-600"
            )}
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Target Commander
          </label>
          <input
            name="commander"
            required
            placeholder="Ex: Guan Yu"
            className="w-full rounded-lg border border-slate-800 px-4 py-3 bg-slate-900/40 text-white focus:border-amber-500 outline-none transition-all"
          />
        </div>

        {/* SKILLS */}
        <div>
          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <Shield className="w-3 h-3 mr-1 text-amber-500" /> Skills (Ex: 5511)
          </label>
          <input
            name="commanderStatus"
            type="text"
            inputMode="numeric"
            required
            value={commanderStatus}
            placeholder="----"
            onChange={(e) => setCommanderStatus(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            className={clsx(
              "w-full rounded-lg border px-4 py-3 bg-slate-900/40 text-white tracking-[1em] font-mono focus:border-amber-500 outline-none transition-all text-center pl-7",
              commanderStatus.length > 0 && !isSkillsValid ? "border-red-500/50" : "border-slate-800"
            )}
          />
        </div>
      </div>

      {/* MOTIVATION / CONTADOR */}
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
            Motivation / Justification
          </label>
          <div className={clsx(
            "text-[10px] font-black px-2.5 py-1 rounded border transition-all shadow-md",
            reason.length >= charLimit 
              ? "bg-red-500 text-white border-red-400" 
              : "bg-amber-500/20 text-amber-500 border-amber-500/40"
          )}>
            {reason.length} / {charLimit}
          </div>
        </div>
        <textarea
          name="reason"
          required
          maxLength={charLimit}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Briefly explain your activity level and gear focus..."
          className="w-full rounded-lg border border-slate-800 px-4 py-3 bg-slate-900/40 text-white focus:border-amber-500 outline-none transition-all resize-none text-sm leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={clsx(
          "w-full py-4 rounded-lg font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3",
          !canSubmit
            ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700 opacity-60"
            : "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_10px_30px_rgba(217,119,6,0.3)] active:scale-[0.98]"
        )}
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : "Request MGE Slot"}
      </button>

      {!idFound && searchDone && playerId.length >= 7 && (
        <div className="flex items-center justify-center gap-2 text-red-500 bg-red-500/5 py-3 rounded-lg border border-red-500/10 animate-in zoom-in-95 duration-300">
          <AlertCircle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            ID NOT REGISTERED IN OFFICIAL DATA
          </span>
        </div>
      )}
    </form>
  );
}