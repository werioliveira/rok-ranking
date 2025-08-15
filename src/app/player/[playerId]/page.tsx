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
  AreaChart,
  Legend,
  Cell
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
  Activity,
  Skull
} from 'lucide-react';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';

import { usePlayerHistoryAnalytics } from '@/hooks/usePlayerHistoryAnalytics';
import GrowthIndicators from '@/components/PlayerDetails/GrowthIndicators';

const PlayerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const playerId = params.playerId as string;
  
  const { data: playerData, loading, error } = usePlayerDetail(playerId);
  
  // Estados UI mantidos aqui
  const [selectedChart, setSelectedChart] = useState<'power' | 'totalKills' | 'killpoints'>('power');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [selectedKillMetric, setSelectedKillMetric] = useState<'kills' | 'killpoints'>('kills');
  
  // Lógica computacional movida para o hook
  const {
    periodComparison,
    filteredCurrentData,
    chartData,
    killsComparisonData
  } = usePlayerHistoryAnalytics(playerData, dateFilter, startDate, endDate);
// Remove datas duplicadas (ex: duas entradas "2024-07-15")
const mergedChartData = useMemo(() => {
  return chartData.reduce((acc: typeof chartData, current) => {
    const existingIndex = acc.findIndex(item => item.date === current.date);

    if (existingIndex === -1) {
      // Se ainda não tem esse dia, adiciona
      acc.push({ ...current });
    } else {
      // Se já existe, mesclar — aqui optei por pegar o MAIOR valor do dia
      acc[existingIndex][selectedChart] = Math.max(
        acc[existingIndex][selectedChart],
        current[selectedChart]
      );

      // se usar periodComparison: também mescla os campos XYZDelta, etc
      Object.keys(current).forEach((key) => {
        if (key !== 'date' && key !== selectedChart) {
          acc[existingIndex][key] = current[key];
        }
      });
    }
    return acc;
  }, []);
  // OPCIONAL: ordenar por data caso venha desordenado
}, [chartData, selectedChart]);

  // Funções utilitárias (pode mover para utils/format.ts se crescer)
const formatNumber = (num: number): string => {
  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);

  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(1) + 'K';
  return sign + abs.toString();
};

  const formatDelta = (delta: number, showSign: boolean = true): string => {
    const absDelta = Math.abs(delta);
    const sign = showSign ? (delta > 0 ? '+' : delta < 0 ? '-' : '') : '';
    return `${sign}${formatNumber(absDelta)}`;
  };

  const getDeltaColor = (delta: number): string => {
    if (delta > 0) return 'text-green-500';
    if (delta < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <Minus className="w-4 h-4" />;
    return <Equal className="w-4 h-4" />;
  };

  // Handlers UI
  const handleBackClick = () => {
    router.back();
  };

  const handleDateFilterChange = (filterType: '7d' | '30d' | '90d' | 'all' | 'custom') => {
    setDateFilter(filterType);
    if (filterType === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
      setStartDate('');
      setEndDate('');
    }
  };

const handleApplyCustomDates = () => {
  if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
    setDateFilter('custom'); // garante que o hook use startDate e endDate
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
      if (periodComparison?.period?.startDate && periodComparison?.period?.endDate) {
        return `${periodComparison.period.startDate} → ${periodComparison.period.endDate}`;
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
            <Skull className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{formatNumber(parseInt(displayData.deads || 0))}</div>
            <div className="text-sm text-muted-foreground mb-1">Deads</div>
            {periodComparison && (
              <div className={`text-xs flex items-center justify-center gap-1 ${getDeltaColor(periodComparison.deltas.deads)}`}>
                {getDeltaIcon(periodComparison.deltas.deads)}
                {formatDelta(periodComparison.deltas.deads)}
              </div>
            )}
          </div>
          {/* <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Coins className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{formatNumber(parseInt(displayData.rssGathered || '0'))}</div>
            <div className="text-sm text-muted-foreground mb-1">RSS Gathered</div>
            {periodComparison && (
              <div className={`text-xs flex items-center justify-center gap-1 ${getDeltaColor(periodComparison.deltas.rssGathered)}`}>
                {getDeltaIcon(periodComparison.deltas.rssGathered)}
                {formatDelta(periodComparison.deltas.rssGathered)}
              </div>
            )}
          </div> */}
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
            <AreaChart data={mergedChartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatNumber(Number(value))}
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
            <LineChart data={mergedChartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatNumber(Number(value))}
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
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedKillMetric('kills')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedKillMetric === 'kills'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          Kills
        </button>
        <button
          onClick={() => setSelectedKillMetric('killpoints')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            selectedKillMetric === 'killpoints'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        >
          Kill Points
        </button>
      </div>
    </div>
    <div className="h-64">
      {killsComparisonData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={killsComparisonData.filter(e => ['T1','T2','T3', 'T4', 'T5'].includes(e.tier))} 
            barCategoryGap="10%" 
            barGap={2}
          >
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
              formatter={(value: number, name: string, props) => {
                const isGained = name.includes('Gained');
                return [
                  formatNumber(value),
                  isGained
                    ? `Gained ${selectedKillMetric === 'kills' ? 'Kills' : 'Kill Points'}`
                    : `Current ${selectedKillMetric === 'kills' ? 'Kills' : 'Kill Points'}`
                ];
              }}
              labelFormatter={(label) => `Tier: ${label}`}
              contentStyle={{ 
                backgroundColor: '#dfddddff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#333',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              labelStyle={{ color: '#333', fontWeight: 'bold' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value, entry: any) => {
                const isGained = value.includes('Gained');
                const color = isGained ? '#2a5239ff' : '#2a284bff'; // Verde para Gained, Roxo para Current
                return (
                  <span style={{ color: '#fafafa', marginRight: '10px' }}>
                    {value}
                  </span>
                );
              }}
            />
            <Bar 
              dataKey={selectedKillMetric === 'kills' ? 'kills' : 'killpoints'} 
              name={`Current ${selectedKillMetric === 'kills' ? 'Kills' : 'Kill Points'}`}
              fill="#4d498fff"
            >
              {killsComparisonData.filter(e => ['T1','T2','T3', 'T4', 'T5'].includes(e.tier)).map((entry, index) => (
                <Cell key={`current-${index}`} fill={entry.fill} />
              ))}
            </Bar>
            {periodComparison && (
              <Bar 
                dataKey={selectedKillMetric === 'kills' ? 'gainedKills' : 'gainedKillpoints'} 
                name={`Gained ${selectedKillMetric === 'kills' ? 'Kills' : 'Kill Points'}`}
                fill="#318d54ff"
              >
                {killsComparisonData.filter(e => ['T1','T2','T3', 'T4', 'T5'].includes(e.tier)).map((entry, index) => (
                  <Cell key={`gained-${index}`} fill={entry.fill} opacity={0.6} />
                ))}
              </Bar>
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
            { label: 'T1', value: selectedKillMetric === 'kills' ? periodComparison.deltas.t1Kills : periodComparison.deltas.t1Kills * 1 },
            { label: 'T2', value: selectedKillMetric === 'kills' ? periodComparison.deltas.t2Kills : periodComparison.deltas.t2Kills * 2 },
            { label: 'T3', value: selectedKillMetric === 'kills' ? periodComparison.deltas.t3Kills : periodComparison.deltas.t3Kills * 4 },
            { label: 'T4', value: selectedKillMetric === 'kills' ? periodComparison.deltas.t4Kills : periodComparison.deltas.t4Kills * 10 },
            { label: 'T5', value: selectedKillMetric === 'kills' ? periodComparison.deltas.t5Kills : periodComparison.deltas.t5Kills * 20 },
            { label: 'T4+T5', value: selectedKillMetric === 'kills' ? periodComparison.deltas.t45Kills : periodComparison.deltas.t45Kills * 10 }, // Média de T4 e T5
            { label: 'Ranged', value: selectedKillMetric === 'kills' ? periodComparison.deltas.ranged : periodComparison.deltas.ranged * 5 } // Valor estimado para Ranged
          ].map(({ label, value }) => {
            const entry = killsComparisonData.find(e => e.tier === label) || { fill: '#8884d8' }; // Fallback para cor
            const opacity = value === 0 ? 0.5 : 1;
            return (
              <div key={label} style={{ color: value === 0 ? '#fafafa' : entry.fill, opacity }}>
                <span>{label}:</span>
                <span className="font-medium">{formatDelta(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>

      {/* Additional Stats with Growth Indicators */}
       <GrowthIndicators displayData={displayData} periodComparison={periodComparison} />


    </div>
  </div>
)
};
export default PlayerDetailPage;