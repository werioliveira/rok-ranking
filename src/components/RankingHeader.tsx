import { Button } from "@/components/ui/button";
import { SortField } from "@/types/player";
import { Crown, Sword, Trophy, BarChart3, Coins, Loader2, Calendar, Skull } from "lucide-react";
import { useState } from "react";

interface RankingHeaderProps {
  sortField: SortField;
  onSortChange: (field: SortField) => void;
  loading?: boolean;
  // Novas props para o filtro de data
  dateRange?: { startDate: string; endDate: string } | null;
  onDateRangeChange?: (range: { startDate: string; endDate: string } | null) => void;
}

const sortOptions: { field: SortField; label: string; icon: React.ReactNode }[] = [
  { field: 'Power', label: 'Power', icon: <Crown className="w-4 h-4" /> },
  { field: 'Killpoints', label: 'Kill Points', icon: <Sword className="w-4 h-4" /> },
  { field: 'Total Kills', label: 'Total Kills', icon: <Trophy className="w-4 h-4" /> },
  { field: 'T45 Kills', label: 'T4/T5 Kills', icon: <BarChart3 className="w-4 h-4" /> },
  { field: 'Rss Gathered', label: 'RSS Gathered', icon: <Coins className="w-4 h-4" /> },
  { field: 'Killpoints Gained', label: 'Killpoints Gained', icon: <Sword className="w-4 h-4" /> },
  { field: 'Deads Gained', label: 'Deads Gained', icon: <Skull className="w-4 h-4" /> },
  { field: 'Killpoints T45 Gained', label: 'T4/T5 Killpoints Gained', icon: <Sword className="w-4 h-4" /> },
  { field: 'Killpoints T1 Gained', label: 'T1 Killpoints Gained', icon: <Sword className="w-4 h-4" /> },
  
];
function formatDateUTC(dateStr: string) {
  // dateStr = 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year.slice(2)}`; // dd/mm/yy
}
export const RankingHeader = ({ 
  sortField, 
  onSortChange, 
  loading = false,
  dateRange,
  onDateRangeChange
}: RankingHeaderProps) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(dateRange?.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(dateRange?.endDate || '');

  // Função para formatar data para input date
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  // Função para aplicar o filtro de data
  const applyDateFilter = () => {
    if (tempStartDate && tempEndDate && onDateRangeChange) {
      onDateRangeChange({
        startDate: tempStartDate,
        endDate: tempEndDate
      });
    }
    setShowDateFilter(false);
  };

  // Função para limpar o filtro de data
  const clearDateFilter = () => {
    setTempStartDate('');
    setTempEndDate('');
    if (onDateRangeChange) {
      onDateRangeChange(null);
    }
    setShowDateFilter(false);
  };

  // Verificar se é Killpoints Gained e se deve mostrar o filtro de data
  const isGainedFilter = sortField === 'Killpoints Gained' || sortField === 'Deads Gained';

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
              {isGainedFilter && dateRange && (
                <span className="text-xs text-primary ml-1">
                  
                  ({formatDateUTC(dateRange.startDate)} - {formatDateUTC(dateRange.endDate)})
                </span>
              )}
              {loading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
            </div>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto mb-4">
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

        {/* Date Filter Button - Only show when Killpoints Gained is selected */}
        {isGainedFilter && onDateRangeChange && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
              disabled={loading}
              className={`
                flex items-center gap-2 transition-royal
                ${dateRange ? 'border-primary text-primary' : ''}
                hover:bg-[#eed895] hover:border-primary/50
              `}
            >
              <Calendar className="w-4 h-4" />
              {dateRange ? 'Period Filter Active' : 'Filter by Period'}
            </Button>
          </div>
        )}

        {/* Date Filter Panel */}
        {isGainedFilter && showDateFilter && (
          <div className="mt-4 p-4 bg-background/90 backdrop-blur-sm rounded-lg border max-w-md mx-auto">
            <h3 className="font-medium mb-3 text-foreground">Select Period for Killpoints Gained</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={formatDateForInput(tempStartDate)}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                <input
                  type="date"
                  value={formatDateForInput(tempEndDate)}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                onClick={applyDateFilter}
                disabled={!tempStartDate || !tempEndDate || loading}
                className="flex-1"
              >
                Apply Filter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearDateFilter}
                disabled={loading}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDateFilter(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};