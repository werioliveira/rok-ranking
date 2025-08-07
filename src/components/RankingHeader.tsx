import { Button } from "@/components/ui/button";
import { SortField } from "@/types/player";
import { Crown, Sword, Trophy, BarChart3, Coins, Loader2 } from "lucide-react";
import rokBanner from "../../public/rok-banner.jpg";

interface RankingHeaderProps {
  sortField: SortField;
  onSortChange: (field: SortField) => void;
  loading?: boolean;
}

const sortOptions: { field: SortField; label: string; icon: React.ReactNode }[] = [
  { field: 'Power', label: 'Power', icon: <Crown className="w-4 h-4" /> },
  { field: 'Killpoints', label: 'Kill Points', icon: <Sword className="w-4 h-4" /> },
  { field: 'Total Kills', label: 'Total Kills', icon: <Trophy className="w-4 h-4" /> },
  { field: 'T45 Kills', label: 'T4/T5 Kills', icon: <BarChart3 className="w-4 h-4" /> },
  { field: 'Rss Gathered', label: 'RSS Gathered', icon: <Coins className="w-4 h-4" /> },
];

export const RankingHeader = ({ sortField, onSortChange, loading = false }: RankingHeaderProps) => {
  return (
    <div className="relative mb-8">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden bg-[url('/rok-banner.jpg')] bg-cover bg-center"

      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 text-center">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent animate-glow mb-2">
            Rise of Kingdoms
          </h1>
          <h2 className="text-2xl font-semibold text-gold-dark mb-4">
            Player Rankings
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conquer the battlefield and rise through the ranks. Track the most powerful commanders and their legendary achievements.
          </p>
        </div>

        {/* Current Sort Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Order By:</span>
            <div className="flex items-center gap-1 font-medium text-foreground">
              {sortOptions.find(opt => opt.field === sortField)?.icon}
              {sortOptions.find(opt => opt.field === sortField)?.label}
              {loading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {sortOptions.map((option) => (
            <Button
              key={option.field}
              variant={sortField === option.field ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange(option.field)}
              disabled={loading}
              className={`
                transition-royal flex items-center gap-2
                ${sortField === option.field 
                  ? 'bg-gradient-to-r from-primary to-primary-glow shadow-royal' 
                  : 'hover:bg-[#eed895] hover:border-primary/50'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {loading && sortField === option.field ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                option.icon
              )}
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};