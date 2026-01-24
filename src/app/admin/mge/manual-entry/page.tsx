"use client";

import MGEForm from "@/app/tools/mge/MGEForm";
import { ShieldAlert, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminManualMGEPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header de Navegação */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link 
          href="/admin/mge" 
          className="text-slate-500 hover:text-white flex items-center gap-2 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <ShieldAlert size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin Mode</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <UserPlus className="text-amber-500" size={32} /> Manual Registration
        </h1>
        <p className="text-slate-400 text-sm">
          Use this tool to register players who do not have a website account. 
          The system will validate the ID against the latest snapshot.
        </p>
      </div>

      {/* Passamos uma prop oculta ou simplesmente garantimos que o MGEForm 
          saiba lidar com a flag isAdminEntry. 
      */}
      <div className="mt-8">
        <MGEForm isAdminMode={true} />
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg">
        <p className="text-[10px] text-blue-400 font-medium leading-relaxed uppercase tracking-wider">
          Note: Requests created here will be marked as "Recorded by Admin" 
          and bypass the one-request-per-account limit.
        </p>
      </div>
    </div>
  );
}