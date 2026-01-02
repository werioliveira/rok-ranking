"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

type Player = {
  characterId: string;
  username: string;
  power: number;
};

type CompareResult = {
  entered: Player[];
  left: Player[];
};

type Filter = "all" | "entered" | "left";

export default function CompareKingdomPage() {
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(false);

  const parseXlsx = async (file: File): Promise<Player[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    return rows
      .map((row) => ({
        characterId: String(row["Character ID"]),
        username: String(row["Username"] ?? ""),
        power: Number(row["Power"] ?? 0),
      }))
      .filter((p) => p.characterId);
  };

  const handleCompare = async () => {
    if (!oldFile || !newFile) return;

    setLoading(true);

    const oldPlayers = await parseXlsx(oldFile);
    const newPlayers = await parseXlsx(newFile);

    const oldMap = new Map(oldPlayers.map((p) => [p.characterId, p]));
    const newMap = new Map(newPlayers.map((p) => [p.characterId, p]));

    const entered: Player[] = [];
    const left: Player[] = [];

    for (const [id, player] of newMap) {
      if (!oldMap.has(id)) entered.push(player);
    }

    for (const [id, player] of oldMap) {
      if (!newMap.has(id)) left.push(player);
    }

    setResult({ entered, left });
    setFilter("all");
    setLoading(false);
  };

  const playersToShow = () => {
    if (!result) return [];
    if (filter === "entered") return result.entered;
    if (filter === "left") return result.left;

    return [
      ...result.entered.map((p) => ({ ...p, type: "entered" as const })),
      ...result.left.map((p) => ({ ...p, type: "left" as const })),
    ];
  };
const getFilteredPlayersForExport = () => {
  if (!result) return [];

  if (filter === "entered") {
    return result.entered.map((p) => ({ ...p, status: "Joined" }));
  }

  if (filter === "left") {
    return result.left.map((p) => ({ ...p, status: "Left" }));
  }

  return [
    ...result.entered.map((p) => ({ ...p, status: "Joined" })),
    ...result.left.map((p) => ({ ...p, status: "Left" })),
  ];
};

const handleExport = () => {
  const data = getFilteredPlayersForExport().map((p) => ({
    "Status": p.status,
    "Character ID": p.characterId,
    "Username": p.username,
    "Power": p.power,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Compare Result");

  XLSX.writeFile(
    workbook,
    `rok-compare-${filter}-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Kingdom Comparer</h1>
          <p className="text-zinc-400">
            Compare snapshots of Rise of Kingdoms and see who join or left the kingdom.
          </p>
        </div>

        {/* Upload */}
        <div className="grid md:grid-cols-2 gap-4">
          <label className="border border-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-900 transition">
            <span className="block text-sm text-zinc-400 mb-2">Old Snapshot</span>
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setOldFile(e.target.files?.[0] ?? null)}
            />
            <span className="text-sm">
              {oldFile ? oldFile.name : "Select File"}
            </span>
          </label>

          <label className="border border-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-900 transition">
            <span className="block text-sm text-zinc-400 mb-2">New Snapshot</span>
            <input
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
            />
            <span className="text-sm">
              {newFile ? newFile.name : "Select File"}
            </span>
          </label>
        </div>

        {/* Action */}
        <button
          onClick={handleCompare}
          disabled={!oldFile || !newFile || loading}
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 transition"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>

        {/* Result */}
        {result && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-900 p-4">
                <p className="text-zinc-400 text-sm">Joined</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {result.entered.length}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-900 p-4">
                <p className="text-zinc-400 text-sm">Left</p>
                <p className="text-2xl font-bold text-red-400">
                  {result.left.length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {(["all", "entered", "left"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm transition ${
                    filter === f
                      ? "bg-zinc-100 text-zinc-900"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {f === "all"
                    ? "All"
                    : f === "entered"
                    ? "Joined"
                    : "Left"}
                </button>
              ))}
              <button
  onClick={handleExport}
  className="ml-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium transition"
>
Excel Export
</button>
            </div>

            {/* Table */}
<div className="rounded-lg border border-zinc-800 overflow-hidden">
  <div className="max-h-[520px] overflow-y-auto">
    <table className="w-full text-sm">
      <thead className="sticky top-0 z-10 bg-zinc-900 text-zinc-400">
        <tr>
          <th className="text-left p-3">Status</th>
          <th className="text-left p-3">Character ID</th>
          <th className="text-left p-3">Username</th>
          <th className="text-right p-3">Power</th>
        </tr>
      </thead>
      <tbody>
        {playersToShow().map((p) => {
          const isEntered = result.entered.some(
            (e) => e.characterId === p.characterId
          );

          return (
            <tr
              key={p.characterId}
              className="border-t border-zinc-800 hover:bg-zinc-900 transition"
            >
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isEntered
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {isEntered ? "Joined" : "Left"}
                </span>
              </td>
              <td className="p-3 font-mono">{p.characterId}</td>
              <td className="p-3">{p.username}</td>
              <td className="p-3 text-right">
                {p.power.toLocaleString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
          </>
        )}
      </div>
    </div>
  );
}
