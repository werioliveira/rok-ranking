'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { ArrowBigUpDashIcon, ArrowDown, ArrowDownIcon, ArrowRightIcon, ArrowUp, ArrowUpIcon } from 'lucide-react';

interface Kingdom {
  id: number;
  kingdomId: number;
  name: string;
  totalPower: bigint;
  playerCount: number;
  ranking: number;
  powerChange: number;
}

interface Dashboard {
  totalCurrentPower: number;
  totalPreviousPower: number;
  totalChange: number;
  totalChangePercent: number;
}

export default function KingdomRanking() {
  const [kingdoms, setKingdoms] = useState<Kingdom[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

const [orderBy, setOrderBy] = useState("kingdomId");
const [orderDir, setOrderDir] = useState("asc");

useEffect(() => {
  const fetchData = async () => {
    const res = await fetch(`/api/kingdoms/latest?orderBy=${orderBy}&orderDir=${orderDir}`);
    const data = await res.json();
    setKingdoms(data.ranked);
    setDashboard(data.dashboard);
    setLoading(false);
  };

  fetchData();
}, [orderBy, orderDir]);

  const formatNumber = (value: bigint | number | string) => {
    const num = typeof value === 'bigint' ? Number(value) : Number(value);

    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Kingdoms Ranking</h1>

<div className="flex gap-4 mb-4 items-center ">
  <label>
    Order By: 
    <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className="ml-2 p-1 border rounded text-black">
      <option value="kingdomId" className='text-black'>ID</option>
      <option value="totalPower">Total Power</option>
    </select>
  </label>

  <label>
    Direction:
    <select value={orderDir} onChange={(e) => setOrderDir(e.target.value)} className="ml-2 p-1 border rounded text-black">
      <option value="asc">Ascendant</option>
      <option value="desc">Descendant</option>
    </select>
  </label>
</div>
      {/* Tabela de Reinos */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-card text-card-foreground border-b border-muted">
              <th className="px-4 py-3 text-left">Ranking</th>
              <th className="px-4 py-3 text-left">Kingdom</th>
              <th className="px-4 py-3 text-right">Total Power</th>
              <th className="px-4 py-3 text-right">Medium Power</th>
              <th className="px-4 py-3 text-right">Variation</th>
            </tr>
          </thead>
          <tbody>
            {kingdoms.map((kingdom) => (
              <tr key={kingdom.id} className="border-b border-muted hover:bg-muted/50">
                <td className="px-4 py-3 text-left">{kingdom.ranking}</td>
                <td className="px-4 py-3 text-left">{kingdom.name}</td>
                <td className="px-4 py-3 text-right">{formatNumber(kingdom.totalPower)}</td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(Number(kingdom.totalPower) / kingdom.playerCount)}
                </td>
<td className={`px-4 py-3 text-right font-bold ${
  kingdom.powerChange > 0 ? "text-green-500" :
  kingdom.powerChange < 0 ? "text-red-500" : "text-gray-500"
}`}>
  <span className="inline-flex items-center justify-end gap-1">
    {kingdom.powerChange > 0 ? "+" : ""}
    {formatNumber(kingdom.powerChange)}
    {kingdom.powerChange > 0 ? <ArrowUpIcon className="w-4 h-4" /> :
     kingdom.powerChange < 0 ? <ArrowDownIcon className="w-4 h-4" /> :
     <ArrowRightIcon className="w-4 h-4" />}
  </span>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
