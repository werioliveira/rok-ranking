"use client";

import { useState, useTransition, useRef } from "react";
import { createMGERequest } from "./actions";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

type Props = {
  userName: string;
};

export default function MGEForm({ userName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const result = await createMGERequest(formData);

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ 
          type: "success", 
          text: "Your request has been successfully submitted for review!" 
        });
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-6 bg-[#111] border border-slate-800 rounded-xl p-6 shadow-2xl"
    >
      {message && (
        <div
          className={clsx(
            "p-4 rounded-lg flex items-center gap-3 border animate-in fade-in slide-in-from-top-2",
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          )}
        >
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Player Name
          </label>
          <input
            name="name"
            defaultValue={userName}
            required
            className="w-full rounded-lg border border-slate-800 px-4 py-2.5 bg-slate-900/50 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Player ID
          </label>
          <input
            name="playerId"
            type="number"
            required
            placeholder="Ex: 12345678"
            className="w-full rounded-lg border border-slate-800 px-4 py-2.5 bg-slate-900/50 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Target Commander
          </label>
          <input
            name="commander"
            required
            placeholder="Ex: Guan Yu"
            className="w-full rounded-lg border border-slate-800 px-4 py-2.5 bg-slate-900/50 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Commander Status
          </label>
          <input
            name="commanderStatus"
            placeholder="Ex: 5511 or Expertise"
            className="w-full rounded-lg border border-slate-800 px-4 py-2.5 bg-slate-900/50 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Why do you deserve this spot?
        </label>
        <textarea
          name="reason"
          required
          rows={4}
          placeholder="Describe your focus (Cavalry/Infantry), field activity, and why this commander is essential for your setup."
          className="w-full rounded-lg border border-slate-800 px-4 py-2.5 bg-slate-900/50 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || message?.type === "success"}
        className={clsx(
          "w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-2",
          isPending || message?.type === "success"
            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
            : "bg-amber-600 hover:bg-amber-500 text-white active:scale-[0.98]"
        )}
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        {isPending ? "Processing..." : message?.type === "success" ? "Request Submitted" : "Submit MGE Request"}
      </button>
    </form>
  );
}