import { Player } from "@/types/player";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sword, Shield, Trophy, Users } from "lucide-react";
import Link from "next/link";

interface PlayerCardProps {
  player: Player;
  rank: number;
}

const formatNumber = (num: number | string | bigint): string => {
  let n: number;
  if (typeof num === "string") {
    n = parseInt(num, 10);
  } else if (typeof num === "bigint") {
    n = Number(num);
  } else {
    n = num;
  }
  if (isNaN(n)) return "0";

  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1) + "B";
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + "M";
  } else if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + "K";
  }
  return n.toString();
};

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

export const PlayerCard = ({ player, rank }: PlayerCardProps) => {
  return (
    <Card className="player-card group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-royal">
      {/* Rank highlight for top 3 */}
      {rank <= 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
      )}

      <div className="p-6 space-y-4">
        {/* Header with rank and name */}
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
          <div className="text-right">
            <Badge variant="alliance" className="text-xs">
              {player.alliance}
            </Badge>
          </div>
        </div>

        {/* Player name */}
        <div className="space-y-1">
          <Link href={`/player/${player.playerId}`} className="group-hover:text-primary transition-colors">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary-glow transition-royal">
            {player.name}
          </h3>
          </Link>

          <p className="text-sm text-muted-foreground">ID: {player.playerId}</p>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-item">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Power</span>
            </div>
            <p className="text-lg font-bold text-primary">{formatNumber(player.power)}</p>
          </div>

          <div className="stat-item">
            <div className="flex items-center gap-2 mb-1">
              <Sword className="w-4 h-4 text-blood" />
              <span className="text-sm font-medium text-muted-foreground">Kill Points</span>
            </div>
            <p className="text-lg font-bold text-blood">{formatNumber(player.killpoints)}</p>
          </div>

          <div className="stat-item">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-victory" />
              <span className="text-sm font-medium text-muted-foreground">Total Kills</span>
            </div>
            <p className="text-lg font-bold text-victory">{formatNumber(player.totalKills)}</p>
          </div>

          <div className="stat-item">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Helps</span>
            </div>
            <p className="text-lg font-bold text-accent">{formatNumber(player.helps)}</p>
          </div>
        </div>

        {/* Detailed stats - collapsible section */}
        <div className="pt-4 border-t border-border/30 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">T4 Kills</p>
              <p className="font-semibold text-foreground">{formatNumber(player.t4Kills)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">T5 Kills</p>
              <p className="font-semibold text-foreground">{formatNumber(player.t5Kills)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Deads</p>
              <p className="font-semibold text-foreground">{formatNumber(player.deads)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">RSS Gathered</p>
              <p className="font-semibold text-foreground">{formatNumber(player.rssGathered)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">RSS Assistance</p>
              <p className="font-semibold text-foreground">{formatNumber(player.rssAssist)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
