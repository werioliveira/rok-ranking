// hooks/usePlayerHistoryAnalytics.ts
import { useMemo } from 'react';
import { PlayerDetailResponse, PlayerSnapshot } from '@/types/playerDetails'; // Assumindo tipos

type DateFilter = '7d' | '30d' | '90d' | 'all' | 'custom';

function parseLocalStart(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  // Se já vier com tempo/ISO, usa new Date direto
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3) return new Date(dateStr);
  const [y, m, d] = parts;
  return new Date(y, m - 1, d, 0, 0, 0, 0); // início do dia local
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
  return new Date(y, m - 1, d, 23, 59, 59, 999); // fim do dia local
}

export const usePlayerHistoryAnalytics = (
  playerData: PlayerDetailResponse | null,
  dateFilter: DateFilter,
  startDate: string,
  endDate: string
) => {
  // Filtered snapshots
  const filteredSnapshots = useMemo(() => {
    if (!playerData?.history) return [];

    // Sort history ascending by date for consistency
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
    // opcional: incluir todo o dia do filterDate -> filterDate.setHours(0,0,0,0);

    return sortedHistory.filter(snapshot => new Date(snapshot.createdAt) >= filterDate);
  }, [playerData?.history, dateFilter, startDate, endDate]);

  // Period comparison
  const periodComparison = useMemo(() => {
    if (!filteredSnapshots || filteredSnapshots.length === 0) return null;

    const first = filteredSnapshots[0];
    const last = filteredSnapshots[filteredSnapshots.length - 1];

    // Determine periodStart/periodEnd for display:
    let periodStartDate: Date;
    let periodEndDate: Date;

    if (dateFilter === 'custom' && startDate && endDate) {
      periodStartDate = parseLocalStart(startDate)!;
      periodEndDate = parseLocalEnd(endDate)!;
    } else {
      periodStartDate = new Date(first.createdAt);
      periodEndDate = new Date(last.createdAt);
      // normalizar para incluir todo o dia final na contagem
      periodStartDate.setHours(0, 0, 0, 0);
      periodEndDate.setHours(23, 59, 59, 999);
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.floor((periodEndDate.getTime() - periodStartDate.getTime()) / msPerDay) + 1;

    // safe deltas (se houver apenas 1 snapshot, deltas serão 0)
    const deltas = {
      power: (last?.power ?? 0) - (first?.power ?? 0),
      totalKills: (last?.totalKills ?? 0) - (first?.totalKills ?? 0),
      killpoints: (last?.killpoints ?? 0) - (first?.killpoints ?? 0),
      t1Kills: (last?.t1Kills ?? 0) - (first?.t1Kills ?? 0),
      t2Kills: (last?.t2Kills ?? 0) - (first?.t2Kills ?? 0),
      t3Kills: (last?.t3Kills ?? 0) - (first?.t3Kills ?? 0),
      t4Kills: (last?.t4Kills ?? 0) - (first?.t4Kills ?? 0),
      t5Kills: (last?.t5Kills ?? 0) - (first?.t5Kills ?? 0),
      t45Kills: (last?.t45Kills ?? 0) - (first?.t45Kills ?? 0),
      ranged: (last?.ranged ?? 0) - (first?.ranged ?? 0),
      rssGathered: (parseInt(last?.rssGathered ?? '0', 10) || 0) - (parseInt(first?.rssGathered ?? '0', 10) || 0)
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

  // Filtered current data
  const filteredCurrentData = useMemo(() => {
    return filteredSnapshots[filteredSnapshots.length - 1] ?? null;
  }, [filteredSnapshots]);

  // Chart data
  const chartData = useMemo(() => {
    if (!filteredSnapshots || filteredSnapshots.length === 0) return [];

    const firstSnapshot = filteredSnapshots[0];

    return filteredSnapshots.map(snapshot => {
      const snapDate = new Date(snapshot.createdAt);
      return {
        date: snapDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        power: snapshot.power,
        totalKills: snapshot.totalKills,
        killpoints: snapshot.killpoints,
        powerDelta: snapshot.power - (firstSnapshot?.power ?? 0),
        totalKillsDelta: snapshot.totalKills - (firstSnapshot?.totalKills ?? 0),
        killpointsDelta: snapshot.killpoints - (firstSnapshot?.killpoints ?? 0),
        fullDate: snapDate.toLocaleDateString('pt-BR')
      };
    });
  }, [filteredSnapshots]);

  // Kills comparison data
  const killsComparisonData = useMemo(() => {
    const current = periodComparison?.last ?? filteredCurrentData ?? playerData?.currentData;
    const deltas = periodComparison?.deltas ?? {
      t1Kills: 0, t2Kills: 0, t3Kills: 0, t4Kills: 0, t5Kills: 0
    };

    if (!current) return [];

    return [
      { tier: 'T1', kills: current.t1Kills ?? 0, killpoints: (current.t1Kills ?? 0) * 1, gainedKills: deltas.t1Kills, gainedKillpoints: deltas.t1Kills * 1, fill: '#8884d8' },
      { tier: 'T2', kills: current.t2Kills ?? 0, killpoints: (current.t2Kills ?? 0) * 2, gainedKills: deltas.t2Kills, gainedKillpoints: deltas.t2Kills * 2, fill: '#82ca9d' },
      { tier: 'T3', kills: current.t3Kills ?? 0, killpoints: (current.t3Kills ?? 0) * 4, gainedKills: deltas.t3Kills, gainedKillpoints: deltas.t3Kills * 4, fill: '#ffc658' },
      { tier: 'T4', kills: current.t4Kills ?? 0, killpoints: (current.t4Kills ?? 0) * 10, gainedKills: deltas.t4Kills, gainedKillpoints: deltas.t4Kills * 10, fill: '#ff7c7c' },
      { tier: 'T5', kills: current.t5Kills ?? 0, killpoints: (current.t5Kills ?? 0) * 20, gainedKills: deltas.t5Kills, gainedKillpoints: deltas.t5Kills * 20, fill: '#8dd1e1' }
    ];
  }, [periodComparison, filteredCurrentData, playerData?.currentData]);

  return {
    filteredSnapshots,
    periodComparison,
    filteredCurrentData,
    chartData,
    killsComparisonData
  };
};
