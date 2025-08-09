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
  Bar,
  Area,
  AreaChart
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
  Filter,
  CalendarDays,
  X,
  Plus,
  Minus,
  Equal,
  Activity
} from 'lucide-react';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';

const PlayerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const playerId = params.playerId as string;
  
  const { data: playerData, loading, error } = usePlayerDetail(playerId);
  const [selectedChart, setSelectedChart] = useState<'power' | 'totalKills' | 'killpoints'>('power');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Filtra snapshots com base no filtro de data
  const filteredSnapshots = useMemo(() => {
    if (!playerData) return [];

    if (dateFilter === 'custom' && startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      
      return playerData.history.filter(snapshot => {
        const snapDate = new Date(snapshot.createdAt);
        return snapDate >= start && snapDate <= end;
      });
    }

    if (dateFilter === 'all') return playerData.history;

    const now = new Date();
    const daysToFilter = { '7d': 7, '30d': 30, '90d': 90 }[dateFilter as '7d' | '30d' | '90d'];
    const filterDate = new Date(now.getTime() - (daysToFilter * 24 * 60 * 60 * 1000));

    return playerData.history.filter(snapshot => new Date(snapshot.createdAt) >= filterDate);
  }, [playerData, dateFilter, startDate, endDate]);

  // Último e primeiro snapshots do período filtrado
  const periodComparison = useMemo(() => {
    if (filteredSnapshots.length < 2) return null;
    
    const first = filteredSnapshots[0];
    const last = filteredSnapshots[filteredSnapshots.length - 1];
    
    return {
      first,
      last,
      deltas: {
        power: last.power - first.power,
        totalKills: last.totalKills - first.totalKills,
        killpoints: last.killpoints - first.killpoints,
        t1Kills: (last.t1Kills || 0) - (first.t1Kills || 0),
        t2Kills: (last.t2Kills || 0) - (first.t2Kills || 0),
        t3Kills: (last.t3Kills || 0) - (first.t3Kills || 0),
        t4Kills: (last.t4Kills || 0) - (first.t4Kills || 0),
        t5Kills: (last.t5Kills || 0) - (first.t5Kills || 0),
        t45Kills: last.t45Kills - first.t45Kills,
        ranged: last.ranged - first.ranged,
        rssGathered: parseInt(last.rssGathered || '0') - parseInt(first.rssGathered || '0')
      },
      period: {
        days: Math.ceil((new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        startDate: new Date(first.createdAt).toLocaleDateString('pt-BR'),
        endDate: new Date(last.createdAt).toLocaleDateString('pt-BR')
      }
    };
  }, [filteredSnapshots]);

  // Último snapshot do período (para representar "current" dentro do filtro)
  const filteredCurrentData = useMemo(() => {
    if (filteredSnapshots.length === 0) return null;
    return filteredSnapshots[filteredSnapshots.length - 1];
  }, [filteredSnapshots]);

  // Dados do chart usando os snapshots filtrados com deltas acumulativos
  const chartData = useMemo(() => {
    if (!filteredSnapshots || filteredSnapshots.length < 2) return [];
    
    const firstSnapshot = filteredSnapshots[0];
    
    return filteredSnapshots.map(snapshot => ({
      date: new Date(snapshot.createdAt).toLocaleDateString('pt-BR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      power: snapshot.power,
      totalKills: snapshot.totalKills,
      killpoints: snapshot.killpoints,
      // Deltas acumulativos desde o primeiro snapshot do período
      powerDelta: snapshot.power - firstSnapshot.power,
      totalKillsDelta: snapshot.totalKills - firstSnapshot.totalKills,
      killpointsDelta: snapshot.killpoints - firstSnapshot.killpoints,
      fullDate: new Date(snapshot.createdAt).toLocaleDateString('pt-BR')
    }));
  }, [filteredSnapshots]);

  // Dados de kills com comparação de período
  const killsComparisonData = useMemo(() => {
    if (!periodComparison) {
      // Fallback para dados atuais se não houver comparação
      const current = filteredCurrentData ?? playerData?.currentData;
      if (!current) return [];
      return [
        { tier: 'T1', current: current.t1Kills ?? 0, gained: 0, fill: '#8884d8' },
        { tier: 'T2', current: current.t2Kills ?? 0, gained: 0, fill: '#82ca9d' },
        { tier: 'T3', current: current.t3Kills ?? 0, gained: 0, fill: '#ffc658' },
        { tier: 'T4', current: current.t4Kills ?? 0, gained: 0, fill: '#ff7c7c' },
        { tier: 'T5', current: current.t5Kills ?? 0, gained: 0, fill: '#8dd1e1' }
      ];
    }

    return [
      { 
        tier: 'T1', 
        current: periodComparison.last.t1Kills ?? 0, 
        gained: periodComparison.deltas.t1Kills,
        fill: '#8884d8' 
      },
      { 
        tier: 'T2', 
        current: periodComparison.last.t2Kills ?? 0, 
        gained: periodComparison.deltas.t2Kills,
        fill: '#82ca9d' 
      },
      { 
        tier: 'T3', 
        current: periodComparison.last.t3Kills ?? 0, 
        gained: periodComparison.deltas.t3Kills,
        fill: '#ffc658' 
      },
      { 
        tier: 'T4', 
        current: periodComparison.last.t4Kills ?? 0, 
        gained: periodComparison.deltas.t4Kills,
        fill: '#ff7c7c' 
      },
      { 
        tier: 'T5', 
        current: periodComparison.last.t5Kills ?? 0, 
        gained: periodComparison.deltas.t5Kills,
        fill: '#8dd1e1' 
      }
    ];
  }, [periodComparison, filteredCurrentData, playerData]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDelta = (delta: number, showSign: boolean = true) => {
    const sign = showSign ? (delta > 0 ? '+' : delta < 0 ? '' : '') : '';
    return `${sign}${formatNumber(Math.abs(delta))}`;
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-500';
    if (delta < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <Minus className="w-4 h-4" />;
    return <Equal className="w-4 h-4" />;
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleDateFilterChange = (filterType: '7d' | '30d' | '90d' | 'all' | 'custom') => {
    if (filterType === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setStartDate('');
      setEndDate('');
    }
    setDateFilter(filterType);
  };

  const handleApplyCustomDates = () => {
    if (startDate && endDate) {
      setShowCustomDatePicker(false);
    }
  };

  const handleClearCustomDates = () => {
    setStartDate('');
    setEndDate('');
    setDateFilter('all');
    setShowCustomDatePicker(false);
  };

  const getDateRangeText = () => {
    if (dateFilter === 'custom' && startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      const startFormatted = start.toLocaleDateString('pt-BR');
      const endFormatted = end.toLocaleDateString('pt-BR');
      return `${startFormatted} - ${endFormatted}`;
    }
    return null;
  };
  
  const dateFilterOptions = [
    { key: '7d', label: '7 days' },
    { key: '30d', label: '30 days' },
    { key: '90d', label: '90 days' },
    { key: 'all', label: 'All time' },
    { key: 'custom', label: 'Custom' }
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

  const displayData = filteredCurrentData ?? playerData.currentData;
  
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

          {/* Stats Grid com Deltas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Crown className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatNumber(displayData.power)}</div>
              <div className="text-sm text-muted-foreground mb-1">Power</div>
              {periodComparison && (
                <div className={`text-xs flex items-center justify-center gap-1 ${getDeltaColor(periodComparison.deltas.power)}`}>
                  {getDeltaIcon(periodComparison.deltas.power)}
                  {formatDelta(periodComparison.deltas.power)}
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{formatNumber(displayData.killpoints)}</div>
              <div className="text-sm text-muted-foreground mb-1">Kill Points</div>
              {periodComparison && (
                <div className={`text-xs flex items-center justify-center gap-1 ${getDeltaColor(periodComparison.deltas.killpoints)}`}>
                  {getDeltaIcon(periodComparison.deltas.killpoints)}
                  {formatDelta(periodComparison.deltas.killpoints)}
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{formatNumber(displayData.totalKills)}</div>
              <div className="text-sm text-muted-foreground mb-1">Total Kills</div>
              {periodComparison && (
                <div className={`text-xs flex items-center justify-center gap-1 ${getDeltaColor(periodComparison.deltas.totalKills)}`}>
                  {getDeltaIcon(periodComparison.deltas.totalKills)}
                  {formatDelta(periodComparison.deltas.totalKills)}
                </div>
              )}
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Coins className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{formatNumber(parseInt(displayData.rssGathered || '0'))}</div>
              <div className="text-sm text-muted-foreground mb-1">RSS Gathered</div>
              {periodComparison && (
                <div className={`text-xs flex items-center justify-center gap-1 ${getDeltaColor(periodComparison.deltas.rssGathered)}`}>
                  {getDeltaIcon(periodComparison.deltas.rssGathered)}
                  {formatDelta(periodComparison.deltas.rssGathered)}
                </div>
              )}
            </div>
          </div>

          {/* Period Summary */}
          {periodComparison && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Period Summary</h3>
                <span className="text-sm text-muted-foreground">
                  ({periodComparison.period.startDate} → {periodComparison.period.endDate})
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{periodComparison.period.days} days</span>
                </div>
                <div className={`flex items-center gap-2 ${getDeltaColor(periodComparison.deltas.power)}`}>
                  <Crown className="w-4 h-4" />
                  <span>{formatDelta(periodComparison.deltas.power)} Power</span>
                </div>
                <div className={`flex items-center gap-2 ${getDeltaColor(periodComparison.deltas.totalKills)}`}>
                  <Trophy className="w-4 h-4" />
                  <span>{formatDelta(periodComparison.deltas.totalKills)} Kills</span>
                </div>
                <div className={`flex items-center gap-2 ${getDeltaColor(periodComparison.deltas.killpoints)}`}>
                  <Sword className="w-4 h-4" />
                  <span>{formatDelta(periodComparison.deltas.killpoints)} KP</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                {periodComparison ? 'Progress & Growth' : 'Progress History'}
              </h2>
              
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {dateFilterOptions.map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleDateFilterChange(key as any)}
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

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Select Custom Date Range</h4>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleApplyCustomDates}
                      disabled={!startDate || !endDate}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleClearCustomDates}
                      className="px-3 py-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Date Range Display */}
            {dateFilter === 'custom' && getDateRangeText() && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Period: {getDateRangeText()}</span>
                <button
                  onClick={handleClearCustomDates}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Chart */}
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {periodComparison ? (
                    <AreaChart data={chartData}>
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
                        formatter={(value: any, name) => [
                          formatNumber(Number(value)), 
                          name === `${selectedChart}Delta` ? `${selectedChart} Growth` : selectedChart
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={`${selectedChart}Delta`}
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={`${selectedChart}Delta`}
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                    </AreaChart>
                  ) : (
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
                        labelFormatter={(label) => `Date: ${label}`}
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
                  )}
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
          
          {/* Kills Distribution with Growth */}
          <div className="bg-card rounded-2xl border shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Kills Distribution</h3>
              <div className="text-sm text-muted-foreground">
                {dateFilter === 'all' 
                  ? 'Current' 
                  : dateFilter === 'custom' && getDateRangeText()
                    ? 'Custom Range'
                    : `Last ${dateFilter.replace('d', ' days')}`
                }
              </div>
            </div>
            <div className="h-64">
              {killsComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={killsComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                    <XAxis 
                      dataKey="tier" 
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickFormatter={formatNumber} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        formatNumber(Number(value)), 
                        name === 'gained' ? 'Gained' : 'Current'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--popover-foreground))'
                      }}
                      labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Bar 
                      dataKey="current" 
                      name="Current" 
                      fill="hsl(var(--primary))"
                    />
                    {periodComparison && (
                      <Bar 
                        dataKey="gained" 
                        name="Gained" 
                        fill="hsl(var(--primary))" 
                        opacity={0.6}
                      />
                    )}
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

            {/* Kills Growth Summary */}
            {periodComparison && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Period Growth:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'T4', value: periodComparison.deltas.t4Kills },
                    { label: 'T5', value: periodComparison.deltas.t5Kills },
                    { label: 'T4+T5', value: periodComparison.deltas.t45Kills },
                    { label: 'Ranged', value: periodComparison.deltas.ranged }
                  ].map(({ label, value }) => (
                    <div key={label} className={`flex items-center justify-between ${getDeltaColor(value)}`}>
                      <span>{label}:</span>
                      <span className="font-medium">{formatDelta(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats with Growth Indicators */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold">T4/T5 Kills</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.t45Kills)}</div>
            <div className="text-sm text-muted-foreground mb-1">High Tier Eliminations</div>
            {periodComparison && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodComparison.deltas.t45Kills)}`}>
                {getDeltaIcon(periodComparison.deltas.t45Kills)}
                {formatDelta(periodComparison.deltas.t45Kills)} in period
              </div>
            )}
          </div>
          
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Axe className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">T5</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.t5Kills)}</div>
            <div className="text-sm text-muted-foreground mb-1">T5 Kills</div>
            {periodComparison && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodComparison.deltas.t5Kills)}`}>
                {getDeltaIcon(periodComparison.deltas.t5Kills)}
                {formatDelta(periodComparison.deltas.t5Kills)} in period
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sword className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">T4</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.t4Kills)}</div>
            <div className="text-sm text-muted-foreground mb-1">T4 Kills</div>
            {periodComparison && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodComparison.deltas.t4Kills)}`}>
                {getDeltaIcon(periodComparison.deltas.t4Kills)}
                {formatDelta(periodComparison.deltas.t4Kills)} in period
              </div>
            )}
          </div>
          
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Ranged</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.ranged)}</div>
            <div className="text-sm text-muted-foreground mb-1">Ranged Eliminations</div>
            {periodComparison && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodComparison.deltas.ranged)}`}>
                {getDeltaIcon(periodComparison.deltas.ranged)}
                {formatDelta(periodComparison.deltas.ranged)} in period
              </div>
            )}
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
              {periodComparison ? (
                <>
                  <div className="text-2xl font-bold text-green-500">
                    +{formatNumber(periodComparison.deltas.power)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Power Growth ({periodComparison.period.days} days)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg: {formatNumber(Math.round(periodComparison.deltas.power / periodComparison.period.days))}/day
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-500">
                    +{formatNumber(playerData.statistics.powerGrowth ?? 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Power Growth</div>
                </>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">Active Period</h3>
            </div>
            <div className="space-y-2">
              {periodComparison ? (
                <>
                  <div className="text-lg font-bold">
                    {periodComparison.period.days} days
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredSnapshots.length} data points
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {periodComparison.period.startDate} → {periodComparison.period.endDate}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold">
                    {Math.ceil((new Date(playerData.statistics.lastSnapshot).getTime() - new Date(playerData.statistics.firstSnapshot).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {playerData.statistics.totalSnapshots} registers
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">Efficiency</h3>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold">
                {displayData.totalKills > 0 ? (displayData.killpoints / displayData.totalKills).toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-muted-foreground">KP per Kill</div>
              {periodComparison && periodComparison.deltas.totalKills > 0 && (
                <div className="text-xs text-muted-foreground">
                  Period avg: {(periodComparison.deltas.killpoints / periodComparison.deltas.totalKills).toFixed(1)} KP/kill
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {periodComparison && (
          <div className="mt-8 bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Performance Insights</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">
                  {formatNumber(Math.round(periodComparison.deltas.power / periodComparison.period.days))}
                </div>
                <div className="text-sm text-muted-foreground">Power/day</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">
                  {formatNumber(Math.round(periodComparison.deltas.totalKills / periodComparison.period.days))}
                </div>
                <div className="text-sm text-muted-foreground">Kills/day</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">
                  {formatNumber(Math.round(periodComparison.deltas.killpoints / periodComparison.period.days))}
                </div>
                <div className="text-sm text-muted-foreground">KP/day</div>
              </div>
              
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold">
                  {periodComparison.deltas.totalKills > 0 
                    ? `${((periodComparison.deltas.t45Kills / periodComparison.deltas.totalKills) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </div>
                <div className="text-sm text-muted-foreground">T4+T5 Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetailPage;