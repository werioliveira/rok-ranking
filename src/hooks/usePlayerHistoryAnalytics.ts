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

// Função para encontrar o snapshot mais próximo de uma data
function findClosestSnapshot(targetDate: Date, snapshots: PlayerSnapshot[]): PlayerSnapshot | null {
  if (!snapshots || snapshots.length === 0) return null;
  
  const target = targetDate.getTime();
  
  let closest = snapshots[0];
  let smallestDiff = Math.abs(new Date(closest.createdAt).getTime() - target);
  
  for (let i = 1; i < snapshots.length; i++) {
    const diff = Math.abs(new Date(snapshots[i].createdAt).getTime() - target);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = snapshots[i];
    }
  }
  
  return closest;
}

// Função para filtrar dados por período com fallback para dados próximos
function getFilteredDataWithFallback(snapshots: PlayerSnapshot[], start: Date, end: Date): PlayerSnapshot[] {
  if (!snapshots || snapshots.length === 0) return [];
  
  // Primeiro, tenta encontrar dados exatos no range
  let filteredData = snapshots.filter(snapshot => {
    const snapshotDate = new Date(snapshot.createdAt);
    return snapshotDate >= start && snapshotDate <= end;
  });
  
  // Se não encontrou dados exatos, busca os mais próximos
  if (filteredData.length === 0) {
    const startSnapshot = findClosestSnapshot(start, snapshots);
    const endSnapshot = findClosestSnapshot(end, snapshots);
    
    if (startSnapshot && endSnapshot) {
      // Se são o mesmo snapshot, retorna apenas um
      if (startSnapshot.createdAt === endSnapshot.createdAt) {
        filteredData = [startSnapshot];
      } else {
        // Retorna os dois pontos mais próximos
        filteredData = [startSnapshot, endSnapshot];
        
        // Remove duplicatas e ordena por data
        filteredData = filteredData
          .filter((snapshot, index, self) => 
            index === self.findIndex(s => s.createdAt === snapshot.createdAt)
          )
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
    }
  }
  
  // Se ainda não tem dados suficientes, pega pelo menos os 2 snapshots mais próximos
  if (filteredData.length < 2 && snapshots.length >= 2) {
    // Encontra os snapshots mais próximos ao período solicitado
    const allWithDistance = snapshots.map(snapshot => ({
      snapshot,
      distance: Math.min(
        Math.abs(new Date(snapshot.createdAt).getTime() - start.getTime()),
        Math.abs(new Date(snapshot.createdAt).getTime() - end.getTime())
      )
    }));
    
    // Ordena por proximidade e pega os 2 mais próximos se ainda não temos dados suficientes
    allWithDistance.sort((a, b) => a.distance - b.distance);
    const closestSnapshots = allWithDistance.slice(0, Math.max(2, filteredData.length)).map(item => item.snapshot);
    
    // Remove duplicatas que já podem estar em filteredData
    const existingIds = new Set(filteredData.map(s => s.createdAt));
    const newSnapshots = closestSnapshots.filter(s => !existingIds.has(s.createdAt));
    
    filteredData = [...filteredData, ...newSnapshots];
  }
  
  return filteredData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const usePlayerHistoryAnalytics = (
  playerData: PlayerDetailResponse | null,
  dateFilter: DateFilter,
  startDate: string,
  endDate: string
) => {
  // Helper para converter BigInt ou number para number seguro
  const toNum = (val: any) => Number(val ?? 0);

  // Filtrar snapshots com lógica melhorada
  const filteredSnapshots = useMemo(() => {
    if (!playerData?.history) return [];

    const sortedHistory: PlayerSnapshot[] = [...playerData.history].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    if (dateFilter === 'custom' && startDate && endDate) {
      const start = parseLocalStart(startDate)!;
      const end = parseLocalEnd(endDate)!;
      
      // Usa a função melhorada que busca dados próximos se necessário
      return getFilteredDataWithFallback(sortedHistory, start, end);
    }

    if (dateFilter === 'all') return sortedHistory;

    const daysMap: Record<'7d' | '30d' | '90d', number> = { '7d': 7, '30d': 30, '90d': 90 };
    const daysToFilter = daysMap[dateFilter];
    const now = new Date();
    const filterDate = new Date(now.getTime() - daysToFilter * 24 * 60 * 60 * 1000);

    const filtered = sortedHistory.filter(snapshot => new Date(snapshot.createdAt) >= filterDate);
    
    // Para filtros predefinidos, se não há dados no período, também busca os mais próximos
    if (filtered.length === 0) {
      return getFilteredDataWithFallback(sortedHistory, filterDate, now);
    }
    
    return filtered;
  }, [playerData?.history, dateFilter, startDate, endDate]);

  // Informação sobre o período de dados encontrado
  const dataRangeInfo = useMemo(() => {
    if (!filteredSnapshots || filteredSnapshots.length === 0) {
      return "No data available";
    }
    
    const actualStart = filteredSnapshots[0].createdAt;
    const actualEnd = filteredSnapshots[filteredSnapshots.length - 1].createdAt;
    
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');
    
    if (filteredSnapshots.length === 1) {
      return `Snapshot: ${formatDate(actualStart)}`;
    }
    
    if (dateFilter !== 'custom' || !startDate || !endDate) {
      return `Period: ${formatDate(actualStart)} - ${formatDate(actualEnd)}`;
    }
    
    // Para custom, verifica se os dados são exatos ou aproximados
    const requestedStart = parseLocalStart(startDate)!;
    const requestedEnd = parseLocalEnd(endDate)!;
    const actualStartDate = new Date(actualStart);
    const actualEndDate = new Date(actualEnd);
    
    // Verifica se os dados são exatamente do período solicitado (com tolerância de 1 dia)
    const startDiff = Math.abs(actualStartDate.getTime() - requestedStart.getTime()) / (1000 * 60 * 60 * 24);
    const endDiff = Math.abs(actualEndDate.getTime() - requestedEnd.getTime()) / (1000 * 60 * 60 * 24);
    
    if (startDiff <= 1 && endDiff <= 1) {
      return `Period: ${formatDate(actualStart)} - ${formatDate(actualEnd)}`;
    }
    
    return `Data searched: ${formatDate(actualStart)} - ${formatDate(actualEnd)}`;
  }, [filteredSnapshots, dateFilter, startDate, endDate]);

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
      deads: toNum(last?.deads) - toNum(first?.deads),
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
        deads: toNum(snapshot.deads),
        powerDelta: toNum(snapshot.power) - toNum(firstSnapshot?.power),
        totalKillsDelta: toNum(snapshot.totalKills) - toNum(firstSnapshot?.totalKills),
        killpointsDelta: toNum(snapshot.killpoints) - toNum(firstSnapshot?.killpoints),
        deadsDelta: toNum(snapshot.deads) - toNum(firstSnapshot?.deads),
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
    totalDeads: toNum(filteredCurrentData?.deads),
    deadsDelta: periodComparison?.deltas.deads ?? 0,
    dataRangeInfo // Nova propriedade com informações sobre o período
  };
};