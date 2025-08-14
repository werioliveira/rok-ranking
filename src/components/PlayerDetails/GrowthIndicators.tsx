import { formatDelta, formatNumber, getDeltaColor } from "@/lib/utils";
import { Axe, BarChart3, Equal, Minus, Skull, Sword, Target, TrendingUp, Trophy } from "lucide-react";

export default function GrowthIndicators({ displayData, periodComparison }: { displayData: any; periodComparison: any }) {
  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <Minus className="w-4 h-4" />;
    return <Equal className="w-4 h-4" />;
  };

  // Função para calcular killpoints baseado nos kills e multiplicadores
  const calculateKillpoints = (t4Kills: number, t5Kills: number, t45Kills: number, ranged: number) => {
    return {
      t4Killpoints: t4Kills * 10,
      t5Killpoints: t5Kills * 20,
      t45Killpoints: (t4Kills * 10) + (t5Kills * 20),
      rangedKillpoints: ranged * 5 // Assumindo multiplicador 5 para ranged
    };
  };

  const currentKillpoints = calculateKillpoints(
    displayData.t4Kills || 0,
    displayData.t5Kills || 0,
    displayData.t45Kills || 0,
    displayData.ranged || 0
  );

  const periodKillpointsDeltas = periodComparison ? {
    t4Killpoints: periodComparison.deltas.t4Kills * 10,
    t5Killpoints: periodComparison.deltas.t5Kills * 20,
    t45Killpoints: (periodComparison.deltas.t4Kills * 10) + (periodComparison.deltas.t5Kills * 20),
    rangedKillpoints: periodComparison.deltas.ranged * 5
  } : null;

  return (
    <div className="space-y-8">
      {/* Cards de Kills */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Kill Statistics
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Skull className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Deads</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(displayData.deads)}</div>
            <div className="text-sm text-muted-foreground mb-1">Deads Troops</div>
            {periodComparison && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodComparison.deltas.deads)}`}>
                {getDeltaIcon(periodComparison.deltas.deads)}
                {formatDelta(periodComparison.deltas.deads)} in period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Killpoints */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sword className="w-5 h-5 text-red-500" />
          Kill Points Breakdown
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold">T4/T5 KP</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentKillpoints.t45Killpoints)}</div>
            <div className="text-sm text-muted-foreground mb-1">High Tier Kill Points</div>
            {periodKillpointsDeltas && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodKillpointsDeltas.t45Killpoints)}`}>
                {getDeltaIcon(periodKillpointsDeltas.t45Killpoints)}
                {formatDelta(periodKillpointsDeltas.t45Killpoints)} in period
              </div>
            )}
          </div>
          
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Axe className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">T5 KP</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentKillpoints.t5Killpoints)}</div>
            <div className="text-sm text-muted-foreground mb-1">T5 Kill Points</div>
            {periodKillpointsDeltas && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodKillpointsDeltas.t5Killpoints)}`}>
                {getDeltaIcon(periodKillpointsDeltas.t5Killpoints)}
                {formatDelta(periodKillpointsDeltas.t5Killpoints)} in period
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sword className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold">T4 KP</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentKillpoints.t4Killpoints)}</div>
            <div className="text-sm text-muted-foreground mb-1">T4 Kill Points</div>
            {periodKillpointsDeltas && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodKillpointsDeltas.t4Killpoints)}`}>
                {getDeltaIcon(periodKillpointsDeltas.t4Killpoints)}
                {formatDelta(periodKillpointsDeltas.t4Killpoints)} in period
              </div>
            )}
          </div>
          
          <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold">Ranged KP</h3>
            </div>
            <div className="text-2xl font-bold">{formatNumber(currentKillpoints.rangedKillpoints)}</div>
            <div className="text-sm text-muted-foreground mb-1">Ranged Kill Points</div>
            {periodKillpointsDeltas && (
              <div className={`text-xs flex items-center gap-1 ${getDeltaColor(periodKillpointsDeltas.rangedKillpoints)}`}>
                {getDeltaIcon(periodKillpointsDeltas.rangedKillpoints)}
                {formatDelta(periodKillpointsDeltas.rangedKillpoints)} in period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}