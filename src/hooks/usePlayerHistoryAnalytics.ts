// hooks/usePlayerHistoryAnalytics.ts
import { useMemo } from 'react';
import { PlayerDetailResponse, PlayerSnapshot } from '@/types/playerDetails';

type DateFilter = '7d' | '30d' | '90d' | 'all' | 'custom';

function parseLocalStart(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return new Date(dateStr);
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseLocalEnd(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) {
    const dt = new Date(dateStr);
    dt.setHours(23, 59, 59, 999);
    return dt;
  }
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return new Date(dateStr);
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

export const usePlayerHistoryAnalytics = (
  playerData: PlayerDetailResponse | null,
  dateFilter: DateFilter,
  startDate: string,
  endDate: string
) => {
  // Helper para converter BigInt ou number para number seguro
  const toNum = (val: any) => Number(val ?? 0);

  // Filtrar snapshots
  const filteredSnapshots = useMemo(() => {
    if (!playerData?.history) return [];

    const sortedHistory: PlayerSnapshot[] = [...playerData.history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    if (dateFilter === 'custom' && startDate && endDate) {
      const start = parseLocalStart(startDate)!;
      const end = parseLocalEnd(endDate)!;
      return sortedHistory.filter(snapshot => {
        const snapDate = new Date(snapshot.createdAt);
        return snapDate >= start && snapDate <= end;
      });
    }

    if (dateFilter === 'all') return sortedHistory;

    const daysMap: Record<'7d' | '30d' | '90d', number> = { '7d': 7, '30d': 30, '90d': 90 };
    const daysToFilter = daysMap[dateFilter];
    const now = new Date();
    const filterDate = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000);

    return sortedHistory.filter(snapshot => new Date(snapshot.createdAt) >= filterDate);
  }, [playerData?.history, dateFilter, startDate, endDate]);

  // Comparação de período
  const periodComparison = useMemo(() => {
    if (!filteredSnapshots || filteredSnapshots.length === 0) return null;

    const first = filteredSnapshots[0];
    const last = filteredSnapshots[filteredSnapshots.length - 1];

    let periodStartDate: Date;
    let periodEndDate: Date;

    if (dateFilter === 'custom' && startDate && endDate) {
      periodStartDate = parseLocalStart(startDate)!;
      periodEndDate = parseLocalEnd(endDate)!;
    } else {
      periodStartDate = new Date(first.createdAt);
      periodEndDate = new Date(last.createdAt);
      periodStartDate.setHours(0, 0, 0, 0);
      periodEndDate.setHours(23, 59, 59, 999);
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((periodEndDate.getTime() - periodStartDate.getTime()) / msPerDay) + 1;

    const deltas = {
      power: toNum(last?.power) - toNum(first?.power),
      totalKills: toNum(last?.totalKills) - toNum(first?.totalKills),
      killpoints: toNum(last?.killpoints) - toNum(first?.killpoints),
      deads: toNum(last?.deads) - toNum(first?.deads), // NOVO
      t1Kills: toNum(last?.t1Kills) - toNum(first?.t1Kills),
      t2Kills: toNum(last?.t2Kills) - toNum(first?.t2Kills),
      t3Kills: toNum(last?.t3Kills) - toNum(first?.t3Kills),
      t4Kills: toNum(last?.t4Kills) - toNum(first?.t4Kills),
      t5Kills: toNum(last?.t5Kills) - toNum(first?.t5Kills),
      t45Kills: toNum(last?.t45Kills) - toNum(first?.t45Kills),
      ranged: toNum(last?.ranged) - toNum(first?.ranged),
      rssGathered: toNum(last?.rssGathered) - toNum(first?.rssGathered)
    };

    return {
      first,
      last,
      deltas,
      period: {
        days,
        startDate: periodStartDate.toLocaleDateString('pt-BR'),
        endDate: periodEndDate.toLocaleDateString('pt-BR')
      }
    };
  }, [filteredSnapshots, dateFilter, startDate, endDate]);

  const filteredCurrentData = useMemo(() => {
    return filteredSnapshots[filteredSnapshots.length - 1] ?? null;
  }, [filteredSnapshots]);

  // Dados para gráfico
  const chartData = useMemo(() => {
    if (!filteredSnapshots || filteredSnapshots.length === 0) return [];
    const firstSnapshot = filteredSnapshots[0];

    return filteredSnapshots.map(snapshot => {
      const snapDate = new Date(snapshot.createdAt);
      return {
        date: snapDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        power: toNum(snapshot.power),
        totalKills: toNum(snapshot.totalKills),
        killpoints: toNum(snapshot.killpoints),
        deads: toNum(snapshot.deads), // NOVO
        powerDelta: toNum(snapshot.power) - toNum(firstSnapshot?.power),
        totalKillsDelta: toNum(snapshot.totalKills) - toNum(firstSnapshot?.totalKills),
        killpointsDelta: toNum(snapshot.killpoints) - toNum(firstSnapshot?.killpoints),
        deadsDelta: toNum(snapshot.deads) - toNum(firstSnapshot?.deads), // NOVO
        fullDate: snapDate.toLocaleDateString('pt-BR')
      };
    });
  }, [filteredSnapshots]);

  // Comparação de kills
  const killsComparisonData = useMemo(() => {
    const current = periodComparison?.last ?? filteredCurrentData ?? playerData?.currentData;
    const deltas = periodComparison?.deltas ?? {
      t1Kills: 0, t2Kills: 0, t3Kills: 0, t4Kills: 0, t5Kills: 0
    };
    if (!current) return [];

    return [
      { tier: 'T1', kills: toNum(current.t1Kills), killpoints: toNum(current.t1Kills) * 1, gainedKills: deltas.t1Kills, gainedKillpoints: deltas.t1Kills * 1, fill: '#8884d8' },
      { tier: 'T2', kills: toNum(current.t2Kills), killpoints: toNum(current.t2Kills) * 2, gainedKills: deltas.t2Kills, gainedKillpoints: deltas.t2Kills * 2, fill: '#82ca9d' },
      { tier: 'T3', kills: toNum(current.t3Kills), killpoints: toNum(current.t3Kills) * 4, gainedKills: deltas.t3Kills, gainedKillpoints: deltas.t3Kills * 4, fill: '#ffc658' },
      { tier: 'T4', kills: toNum(current.t4Kills), killpoints: toNum(current.t4Kills) * 10, gainedKills: deltas.t4Kills, gainedKillpoints: deltas.t4Kills * 10, fill: '#ff7c7c' },
      { tier: 'T5', kills: toNum(current.t5Kills), killpoints: toNum(current.t5Kills) * 20, gainedKills: deltas.t5Kills, gainedKillpoints: deltas.t5Kills * 20, fill: '#8dd1e1' }
    ];
  }, [periodComparison, filteredCurrentData, playerData?.currentData]);

  return {
    filteredSnapshots,
    periodComparison,
    filteredCurrentData,
    chartData,
    killsComparisonData,
    totalDeads: toNum(filteredCurrentData?.deads), // Mortos atuais
    deadsDelta: periodComparison?.deltas.deads ?? 0 // Mortos no período
  };
};
