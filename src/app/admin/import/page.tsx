"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function AdminImportPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  // Função para ler o Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Mostra os primeiros 5 para conferência
      setPreview(data.slice(0, 5));
      processImport(data);
    };
    reader.readAsBinaryString(file);
  };

  // Envia para a API que criamos anteriormente
  const processImport = async (players: any[]) => {
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/players/import-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players }),
      });

      if (!res.ok) throw new Error("Failed to sync with database");

      setStatus({ type: "success", msg: `${players.length} players synced successfully!` });
    } catch (err) {
      setStatus({ type: "error", msg: "Error updating database. Check the console." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Import Lilith Excel</h1>
        <p className="text-slate-400 text-sm">
          Upload the official Excel file to update IDs and Usernames. 
          This will enable auto-fill in MGE forms.
        </p>
      </div>

      {/* Dropzone Area */}
      <div className="relative group">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={clsx(
          "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all",
          loading ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800 bg-slate-900/50 group-hover:border-amber-500/50"
        )}>
          {loading ? (
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          ) : (
            <Upload className="w-12 h-12 text-slate-500 group-hover:text-amber-500 mb-4 transition-colors" />
          )}
          <p className="text-slate-300 font-medium">
            {loading ? "Processing Database..." : "Click or drag Lilith Excel here"}
          </p>
          <span className="text-xs text-slate-500 mt-2">Supports .xlsx and .xls</span>
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={clsx(
          "mt-6 p-4 rounded-lg flex items-center gap-3 border",
          status.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <p className="text-sm font-medium">{status.msg}</p>
        </div>
      )}

      {/* Data Preview */}
      {preview.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">File Preview (First 5 rows)</h2>
          <div className="bg-[#111] border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-2 text-slate-400">Character ID</th>
                  <th className="px-4 py-2 text-slate-400">Username</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {preview.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-white">{p["Character ID"]}</td>
                    <td className="px-4 py-2 text-amber-500">{p["Username"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}