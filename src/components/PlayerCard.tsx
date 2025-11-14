import { Player } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Sword,
  Shield,
  Trophy,
  Users,
  ArrowRight,
  TrendingUp,
  Flame,
  Skull,
  Swords,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface PlayerCardProps {
  player: Player;
  rank: number;
  kvk?: string;
}

export function formatNumber(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";

  return n.toString();
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-gold" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-iron" />;
  if (rank === 3) return <Shield className="w-5 h-5 text-bronze" />;
  return null;
};

const getRankBadgeVariant = (rank: number) => {
  if (rank <= 3) return "royal";
  if (rank <= 10) return "elite";
  return "default";
};

export const PlayerCard = ({ player, rank, kvk }: PlayerCardProps) => {
  const killpointsGained = Number(player.killpointsGained) || 0;
  const t1Gained = Number(player.killpointsT1Gained) || 0;
  const t4t5Gained =
    (Number(player.killpointsT45Gained) || 0);

  return (
    <Card className="player-card group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-royal">
      {/* Rank highlight */}
      {rank <= 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      )}

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant={getRankBadgeVariant(rank)}
              className="min-w-[40px] h-8 flex items-center justify-center font-bold"
            >
              #{rank}
            </Badge>
            {getRankIcon(rank)}
          </div>
          <Badge variant="alliance" className="text-xs">
            {player.alliance}
          </Badge>
        </div>

        {/* Player name */}
        <div className="space-y-1">
          <Link
            href={`/${kvk === "kvk1" ? "kvk1/" : ""}player/${player.playerId}`}
            className="inline-flex items-center gap-2 px-2 py-1 rounded-lg transition-colors group-hover:bg-primary/10 group-hover:shadow-[0_0_8px_0_rgba(80,120,255,0.15)] group-hover:text-primary-glow"
          >
            <h3 className="text-xl font-bold text-foreground transition-royal">
              {player.name}
            </h3>
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
              <ArrowRight className="w-5 h-5 text-primary" />
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">ID: {player.playerId}</p>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Power
              </span>
            </div>
            <p className="text-lg font-bold text-primary">
              {formatNumber(player.power)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sword className="w-4 h-4 text-blood" />
              <span className="text-sm font-medium text-muted-foreground">
                Kill Points
              </span>
            </div>
            <p className="text-lg font-bold text-blood">
              {formatNumber(player.killpoints)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-victory" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Kills
              </span>
            </div>
            <p className="text-lg font-bold text-victory">
              {formatNumber(player.totalKills)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">
                Helps
              </span>
            </div>
            <p className="text-lg font-bold text-accent">
              {formatNumber(player.helps)}
            </p>
          </div>
        </div>

        {/* Detailed stats */}
        <div className="pt-4 border-t border-border/30 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">T4 Kills</p>
              <p className="font-semibold text-foreground">
                {formatNumber(player.t4Kills)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">T5 Kills</p>
              <p className="font-semibold text-foreground">
                {formatNumber(player.t5Kills)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Deads</p>
              <p className="font-semibold text-foreground">
                {formatNumber(player.deads)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">RSS Gathered</p>
              <p className="font-semibold text-foreground">
                {formatNumber(player.rssGathered)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">RSS Assistance</p>
              <p className="font-semibold text-foreground">
                {formatNumber(player.rssAssist)}
              </p>
            </div>
          </div>
        </div>

        {/* Gained stats */}
        <div className="pt-3 border-t border-border/20 space-y-2">
          {[
            {
              label: "Total KP Gained",
              value: killpointsGained,
              color: "text-green-500",
            },
            {
              label: "KP Gained (T4 + T5)",
              value: t4t5Gained,
              color: "text-blue-400",
            },
            {
              label: "KP Gained (T1)",
              value: t1Gained,
              color: "text-yellow-400",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 text-xs"
            >
              <TrendingUp
                className={`w-3 h-3 ${
                  value > 0
                    ? color
                    : value < 0
                    ? "text-red-500 rotate-180"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-muted-foreground">{label}:</span>
              <span
                className={`font-semibold ${
                  value > 0
                    ? color
                    : value < 0
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {value > 0 ? "+" : ""}
                {formatNumber(value)}
              </span>
            </div>
          ))}

          {/* Deads gained */}
          {player.deadsGained !== undefined && (
            <div className="flex items-center justify-center gap-2 text-xs">
              {(() => {
                const deadsGained = Number(player.deadsGained) || 0;
                const color =
                  deadsGained > 0
                    ? "text-red-500"
                    : deadsGained < 0
                    ? "text-green-500"
                    : "text-muted-foreground";
                return (
                  <>
                    <TrendingUp
                      className={`w-3 h-3 ${color} ${
                        deadsGained < 0 ? "rotate-180" : ""
                      }`}
                    />
                    <span className="text-muted-foreground">
                      Deads Gained:
                    </span>
                    <span className={`font-semibold ${color}`}>
                      {deadsGained > 0 ? "+" : ""}
                      {formatNumber(deadsGained)}
                    </span>
                  </>
                );
              })()}

            </div>
            
          )}
{(() => {
  const t4 = Number(player.t4KillsGained) || 0;
  const t5 = Number(player.t5KillsGained) || 0;
  const deads = Number(player.deadsGained) || 0;

  const dkp = t4 * 10 + t5 * 30 + deads * 80;

  const color =
    dkp > 0
      ? "text-purple-400"
      : dkp < 0
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center gap-2 text-xs cursor-help">
            <TrendingUp
              className={`w-3 h-3 ${color} ${dkp < 0 ? "rotate-180" : ""}`}
            />
            <span className="text-muted-foreground">DKP:</span>
            <span className={`font-semibold ${color}`}>
              {dkp > 0 ? "+" : ""}
              {formatNumber(dkp)}
            </span>
          </div>
        </TooltipTrigger>

        <TooltipContent className="p-4 bg-neutral-900 rounded-xl shadow-xl border border-neutral-700">
          <div className="text-xs space-y-3">
            <p className="font-semibold text-purple-300 text-sm">
              DKP Breakdown
            </p>

            {/* GRID LIST */}
            <div className="grid grid-cols-3 gap-3 text-neutral-300">

              {/* T4 */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
                <Swords className="w-4 h-4 text-blue-300 mb-1" />
                <span className="text-[10px] text-neutral-400">T4 Kills</span>
                <span className="font-semibold text-neutral-200 text-sm">
                  {t4.toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500">
                  × 10
                </span>
              </div>

              {/* T5 */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
                <Flame className="w-4 h-4 text-orange-300 mb-1" />
                <span className="text-[10px] text-neutral-400">T5 Kills</span>
                <span className="font-semibold text-neutral-200 text-sm">
                  {t5.toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500">
                  × 30
                </span>
              </div>

              {/* DEADS */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50">
                <Skull className="w-4 h-4 text-red-300 mb-1" />
                <span className="text-[10px] text-neutral-400">Deads</span>
                <span className="font-semibold text-neutral-200 text-sm">
                  {deads.toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500">
                  × 80
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-neutral-700/70" />

            {/* TOTAL */}
            <p className="text-sm font-semibold text-purple-300 text-center">
              Total DKP: {dkp.toLocaleString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
})()}
        </div>
      </div>
    </Card>
  );
};
