// app/player/[playerId]/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Crown, 
  Sword, 
  Trophy, 
  BarChart3, 
  Coins, 
  Users, 
  TrendingUp,
  Calendar,
  Target,
  Loader2,
  ArrowLeft,
  Medal,
  AlertCircle,
  Axe,
  Filter
} from 'lucide-react';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';

const PlayerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const playerId = params.playerId as string;
  
  const { data: playerData, loading, error } = usePlayerDetail(playerId);
  const [selectedChart, setSelectedChart] = useState<'power' | 'totalKills' | 'killpoints'>('power');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('all');

  // Filtra snapshots com base no filtro de data
  const filteredSnapshots = useMemo(() => {
    if (!playerData) return [];

    if (dateFilter === 'all') {
      return playerData.history;
    }

    const now = new Date();
    const daysToFilter = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[dateFilter];

    const filterDate = new Date(now.getTime() - (daysToFilter * 24 * 60 * 60 * 1000));
    
    return playerData.history.filter(
      snapshot => new Date(snapshot.createdAt) >= filterDate
    );
  }, [playerData, dateFilter]);

  // Último snapshot do período (para representar "current" dentro do filtro)
  const filteredCurrentData = useMemo(() => {
    if (filteredSnapshots.length === 0) return null;
    return filteredSnapshots[filteredSnapshots.length - 1];
  }, [filteredSnapshots]);

  // Estatísticas recalculadas com base no período filtrado
  const filteredStatistics = useMemo(() => {
    if (!playerData) return null;

    // Se não houver filtro (all) ou não houver snapshots suficientes, fallback para stats originais
    if (dateFilter === 'all' || filteredSnapshots.length < 2) {
      return null;
    }

    const first = filteredSnapshots[0];
    const last = filteredSnapshots[filteredSnapshots.length - 1];

    return {
      powerGrowth: last.power - first.power,
      totalSnapshots: filteredSnapshots.length,
      firstSnapshot: new Date(first.createdAt).getTime(),
      lastSnapshot: new Date(last.createdAt).getTime()
    };
  }, [filteredSnapshots, playerData, dateFilter]);

  // Dados do chart usando os snapshots filtrados
  const chartData = useMemo(() => {
    if (!filteredSnapshots) return [];
    return filteredSnapshots.map(snapshot => ({
      date: new Date(snapshot.createdAt).toLocaleDateString('pt-BR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      power: snapshot.power,
      totalKills: snapshot.totalKills,
      killpoints: snapshot.killpoints,
      fullDate: new Date(snapshot.createdAt).toLocaleDateString('pt-BR')
    }));
  }, [filteredSnapshots]);

  // Dados de kills (barra) usando o último snapshot do período filtrado (ou vazio)
  const killsData = useMemo(() => {
    const base = filteredCurrentData ?? null;
    if (!base) return [];
    return [
      { tier: 'T1', kills: base.t1Kills ?? 0, fill: '#8884d8' },
      { tier: 'T2', kills: base.t2Kills ?? 0, fill: '#82ca9d' },
      { tier: 'T3', kills: base.t3Kills ?? 0, fill: '#ffc658' },
      { tier: 'T4', kills: base.t4Kills ?? 0, fill: '#ff7c7c' },
      { tier: 'T5', kills: base.t5Kills ?? 0, fill: '#8dd1e1' }
    ];
  }, [filteredCurrentData]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const handleBackClick = () => {
    router.back();
  };
  
  const dateFilterOptions = [
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
    { key: 'all', label: 'All time' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-xl">Loading Player Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to load data</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!playerData) return null;

  // displayData / displayStats são os valores que refletem o filtro (caso exista) ou os originais
  const displayData = filteredCurrentData ?? playerData.currentData;
  const displayStats = filteredStatistics ?? playerData.statistics;

  const firstDate = new Date(Number(displayStats.firstSnapshot));
  const lastDate = new Date(Number(displayStats.lastSnapshot));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header com botão voltar */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBackClick}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Ranking
          </button>
        </div>

        {/* Player Info Card */}
        <div className="bg-card rounded-2xl border shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{displayData.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{displayData.alliance}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Medal className="w-6 h-6" />
                #{playerData.currentData.currentRank}
              </div>
              <span className="text-sm text-muted-foreground">Position</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Crown className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatNumber(displayData.power)}</div>
              <div className="text-sm text-muted-foreground">Power</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{formatNumber(displayData.killpoints)}</div>
              <div className="text-sm text-muted-foreground">Kill Points</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{formatNumber(displayData.totalKills)}</div>
              <div className="text-sm text-muted-foreground">Total Kills</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Coins className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{formatNumber(parseInt(displayData.rssGathered || '0'))}</div>
              <div className="text-sm text-muted-foreground">RSS Gathered</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">Progress History</h2>
              
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {dateFilterOptions.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setDateFilter(key as any)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          dateFilter === key
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Chart Type Filter */}
                <div className="flex gap-1">
                  {[
                    { key: 'power', label: 'Power', icon: Crown },
                    { key: 'totalKills', label: 'Kills', icon: Trophy },
                    { key: 'killpoints', label: 'KP', icon: Sword }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedChart(key as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        selectedChart === key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={formatNumber}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [formatNumber(Number(value)), selectedChart]}
                      labelFormatter={(label) => `Data: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={selectedChart} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for selected period</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Kills Distribution */}
          <div className="bg-card rounded-2xl border shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Kills Distribution</h3>
              <div className="text-sm text-muted-foreground">
                {dateFilter === 'all' ? 'Current' : `Last ${dateFilter.replace('d', ' days')}`}
              </div>
            </div>
            <div className="h-64">
              {killsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={killsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="tier" className="text-xs" />
                    <YAxis tickFormatter={formatNumber} className="text-xs" />
                    <Tooltip 
                      formatter={(value: any) => [formatNumber(Number(value)), 'Kills']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: 'orange' }}
                      labelStyle={{ color: 'gray' }}
                    />
                    <Bar dataKey="kills" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No kill data available for selected period</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold">T4/T5 Kills</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.t45Kills)}</div>
            <div className="text-sm text-muted-foreground">High Tier Eliminations</div>
          </div>
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Axe className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">T5</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.t5Kills)}</div>
            <div className="text-sm text-muted-foreground">T5 Kills</div>
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sword className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">T4</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.t4Kills)}</div>
            <div className="text-sm text-muted-foreground">T4 Kills</div>
          </div>
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Ranged</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.ranged)}</div>
            <div className="text-sm text-muted-foreground">Ranged Eliminations</div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">Growth</h3>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-500">
                +{formatNumber(displayStats.powerGrowth ?? 0)}
              </div>
              <div className="text-sm text-muted-foreground">Power Growth</div>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Active Period</h3>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold">
                {Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
              <div className="text-sm text-muted-foreground">
                {displayStats.totalSnapshots ?? playerData.statistics.totalSnapshots} registers
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Eficience</h3>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold">
                {displayData.totalKills > 0 ? (displayData.killpoints / displayData.totalKills).toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-muted-foreground">KP per Kill</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetailPage;
