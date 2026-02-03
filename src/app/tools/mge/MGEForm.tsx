"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { createMGERequest } from "./actions";
import { CheckCircle2, AlertCircle, Loader2, Search, Fingerprint, Shield } from "lucide-react";
import clsx from "clsx";

type Props = {
  userName?: string;
  isAdminMode?: boolean; // Habilita o registro manual para players sem conta
};

export default function MGEForm({ userName, isAdminMode = false }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<{playerId: string, name: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  const canSubmit = idFound && reason.length > 0 && !isPending;

  useEffect(() => {
    if (!isAdminMode || playerName.length < 3 || idFound) {
      setNameSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const res = await fetch(`/api/players/search?q=${encodeURIComponent(playerName)}`);
      if (res.ok) {
        const data = await res.ok ? await res.json() : [];
        setNameSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [playerName, isAdminMode, idFound]);

useEffect(() => {
  // Se já encontramos o ID (via busca de nome), não dispare a busca por ID novamente
  if (idFound || playerId.length < 7) {
    if (playerId.length < 7) {
      setSearchDone(false);
      setIdFound(false);
      setPlayerName("");
    }
    return;
  }

  const delayDebounceFn = setTimeout(async () => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/players/lookup/${playerId}`);
      if (response.ok) {
        const data = await response.json();
        setPlayerName(data.name || "");
        setIdFound(true);
      } else {
        setIdFound(false);
        setPlayerName("ID not registered"); 
      }
    } catch (error) {
      setIdFound(false);
      setPlayerName("Search error");
    } finally {
      setIsSearching(false);
      setSearchDone(true);
    }
  }, 600);

  return () => clearTimeout(delayDebounceFn);
}, [playerId, idFound]); // Adicione idFound nas dependências

  async function handleSubmit(formData: FormData) {
    if (!canSubmit) return;
    setMessage(null);
    startTransition(async () => {
      const result = await createMGERequest(formData);
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: isAdminMode ? "Manual entry saved!" : "Your request has been successfully submitted!" });
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
  const handleSelectPlayer = (p: {playerId: string, name: string}) => {
    setPlayerId(p.playerId);
    setPlayerName(p.name);
    setIdFound(true);
    setSearchDone(true);
    setShowSuggestions(false);
  };
  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6 bg-[#0f0f0f] border border-slate-800 rounded-xl p-6 shadow-2xl">
      
      {/* Flag oculta para bypass de userId no servidor */}
      <input type="hidden" name="isAdminEntry" value={isAdminMode ? "true" : "false"} />

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
        
        {/* CHARACTER ID - Input Text (Sem Arrows) */}
        <div className="relative">
          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <Fingerprint className="w-3 h-3 mr-1 text-amber-500" /> Character ID
          </label>
          <div className="relative group">
            <input
              name="playerId"
              type="text"
              inputMode="numeric"
              required
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value.replace(/[^0-9]/g, ''))}
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

        {/* USERNAME (READONLY) */}
        <div className="relative">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            Username {isAdminMode && !idFound && "(Searchable)"}
          </label>
          <input
            name="name"
            value={playerName}
            onChange={(e) => {
                if(isAdminMode) {
                    setPlayerName(e.target.value);
                    if(idFound) setIdFound(false); // Reseta se o admin voltar a digitar
                }
            }}
            readOnly={!isAdminMode}
            required
            placeholder={isAdminMode ? "Type player name..." : "Waiting for ID..."}
            className={clsx(
              "w-full rounded-lg border px-4 py-3 outline-none transition-all font-bold",
              idFound 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : isAdminMode 
                  ? "bg-slate-900/40 border-slate-800 text-white focus:border-amber-500"
                  : "bg-slate-900/20 border-slate-800 text-slate-600 cursor-not-allowed"
            )}
          />

          {/* Lista de Sugestões (Dropdown) */}
          {isAdminMode && showSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              {nameSuggestions.map((p) => (
                <button
                  key={p.playerId}
                  type="button"
                  onClick={() => handleSelectPlayer(p)}
                  className="w-full px-4 py-3 text-left hover:bg-amber-500/10 flex justify-between items-center group transition-colors"
                >
                  <span className="text-sm font-bold text-slate-200 group-hover:text-amber-500">{p.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-amber-500/50">ID: {p.playerId}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TARGET COMMANDER */}
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

        {/* SKILLS - 4 DIGITS OPTIONAL */}
        <div>
          <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
            <Shield className="w-3 h-3 mr-1 text-amber-500" /> Skills (Optional - Ex: 5511)
          </label>
          <input
            name="commanderStatus"
            type="text"
            inputMode="numeric"
            value={commanderStatus}
            placeholder="0000"
            onChange={(e) => setCommanderStatus(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            className={clsx(
              "w-full rounded-lg border px-4 py-3 bg-slate-900/40 text-white tracking-[1em] font-mono focus:border-amber-500 outline-none transition-all text-center pl-7",
              // Ajuste a validação: Só fica vermelho se tiver algo digitado E não for 4 dígitos
              commanderStatus.length > 0 && commanderStatus.length < 4 ? "border-red-500/50" : "border-slate-800"
            )}
          />
        </div>
      </div>

{/* MOTIVATION / JUSTIFICATION DINÂMICO */}
      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isAdminMode ? "Admin Justification" : "Motivation / Justification"}
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
          placeholder={
            isAdminMode 
              ? "Example: Top contributor, fixed rank agreed by council, or special request from leadership..." 
              : "Explain why you deserve this slot (activity level, gear, contribution)..."
          }
          className="w-full rounded-lg border border-slate-800 px-4 py-3 bg-slate-900/40 text-white focus:border-amber-500 outline-none transition-all resize-none text-sm leading-relaxed placeholder:text-slate-600"
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
        {isPending ? <Loader2 size={18} className="animate-spin" /> : isAdminMode ? "Register Player (Admin Mode)" : "Request MGE Slot"}
      </button>

      {/* AVISO DE ID NÃO ENCONTRADO */}
      {!idFound && searchDone && playerId.length >= 7 && (
        <div className="flex items-center justify-center gap-2 text-red-500 bg-red-500/5 py-3 rounded-lg border border-red-500/10 animate-in zoom-in-95 duration-300">
          <AlertCircle size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest text-center">
            ID NOT FOUND IN THE LATEST SNAPSHOT. PLEASE CHECK DATA.
          </span>
        </div>
      )}
    </form>
  );
}