import { formatDelta, formatNumber, getDeltaColor } from "@/lib/utils";
import { Axe, BarChart3, Equal, Minus, Sword, Target, TrendingUp } from "lucide-react";


export default function GrowthIndicators({ displayData, periodComparison }: { displayData: any; periodComparison: any }) {
  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4" />;
    if (delta < 0) return <Minus className="w-4 h-4" />;
    return <Equal className="w-4 h-4" />;
  };

  return (
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
  );
}



