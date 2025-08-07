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
  Axe
} from 'lucide-react';
import { usePlayerDetail } from '@/hooks/usePlayerDetail';

const PlayerDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const playerId = params.playerId as string;
  
  const { data: playerData, loading, error } = usePlayerDetail(playerId);
  const [selectedChart, setSelectedChart] = useState<'power' | 'totalKills' | 'killpoints'>('power');

  const chartData = useMemo(() => {
    if (!playerData) return [];
    
    return playerData.history.map(snapshot => ({
      date: new Date(snapshot.createdAt).toLocaleDateString('pt-BR', { 
        month: 'short', 
        day: 'numeric' 
      }),
      power: snapshot.power,
      totalKills: snapshot.totalKills,
      killpoints: snapshot.killpoints,
      fullDate: new Date(snapshot.createdAt).toLocaleDateString('pt-BR')
    }));
  }, [playerData]);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  const killsData = useMemo(() => {
    if (!playerData) return [];
    
    const latest = playerData.currentData;
    return [
      { tier: 'T1', kills: latest.t1Kills, fill: '#8884d8' },
      { tier: 'T2', kills: latest.t2Kills, fill: '#82ca9d' },
      { tier: 'T3', kills: latest.t3Kills, fill: '#ffc658' },
      { tier: 'T4', kills: latest.t4Kills, fill: '#ff7c7c' },
      { tier: 'T5', kills: latest.t5Kills, fill: '#8dd1e1' }
    ];
  }, [playerData]);

  const handleBackClick = () => {
    router.back();
  };
  

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

  const { currentData, statistics } = playerData;
const firstDate = new Date(Number(statistics.firstSnapshot));
const lastDate = new Date(Number(statistics.lastSnapshot));
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
                <h1 className="text-3xl font-bold">{currentData.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{currentData.alliance}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Medal className="w-6 h-6" />
                #{currentData.currentRank}
              </div>
              <span className="text-sm text-muted-foreground">Position</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Crown className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatNumber(currentData.power)}</div>
              <div className="text-sm text-muted-foreground">Power</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Sword className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{formatNumber(currentData.killpoints)}</div>
              <div className="text-sm text-muted-foreground">Kill Points</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{formatNumber(currentData.totalKills)}</div>
              <div className="text-sm text-muted-foreground">Total Kills</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Coins className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{formatNumber(parseInt(currentData.rssGathered))}</div>
              <div className="text-sm text-muted-foreground">RSS Gathered</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Progress History</h2>
              <div className="flex gap-2">
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
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80">
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
                    formatter={(value: any) => [formatNumber(value), selectedChart]}
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
            </div>
          </div>
          {/* Kills Distribution */}
          <div className="bg-card rounded-2xl border shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Kills Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={killsData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="tier" className="text-xs" />
                  <YAxis tickFormatter={formatNumber} className="text-xs" />
<Tooltip 
  formatter={(value: any) => [formatNumber(value), 'Kills']}
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
            <div className="text-2xl font-bold">{formatNumber(currentData.t45Kills)}</div>
            <div className="text-sm text-muted-foreground">High Tier Eliminations</div>
          </div>
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Axe className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">T5</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentData.t5Kills)}</div>
            <div className="text-sm text-muted-foreground">T5 Kills</div>
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sword className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">T4</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentData.t4Kills)}</div>
            <div className="text-sm text-muted-foreground">T4 Kills</div>
          </div>
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Ranged</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentData.ranged)}</div>
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
                +{formatNumber(statistics.powerGrowth)}
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
                {Math.ceil((new Date(lastDate).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </div>
              <div className="text-sm text-muted-foreground">
                {statistics.totalSnapshots} registers
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
                {currentData.totalKills > 0 ? (currentData.killpoints / currentData.totalKills).toFixed(1) : '0.0'}
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