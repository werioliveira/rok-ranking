'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { Player, SortField } from "@/types/player";
import { PaginationInfo } from "@/types/pagination";
import { PlayerCard } from "./PlayerCard";
import { RankingHeader } from "./RankingHeader";
import { PaginationPages } from "./PaginationPages";
import { Loader2, Search, X } from "lucide-react";

export const PlayerRanking = ({ kvk }: { kvk: string }) => {

  const [players, setPlayers] = useState<Player[]>([]);
  const [sortField, setSortField] = useState<SortField>("Power");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Novo estado para o filtro de data
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchPlayers = useCallback(async (
    page: number, 
    sort?: SortField, 
    search?: string, 
    dateFilter?: { startDate: string; endDate: string } | null
  ) => {
    setLoading(true);
    try {
      const sortParam = sort || sortField;
      const searchParam = search !== undefined ? search : searchTerm;
      const dateFilterParam = dateFilter !== undefined ? dateFilter : dateRange;
      
      let url = `/api/${kvk ? `${kvk}/` : ''}players/latest?page=${page}&limit=12&sortBy=${encodeURIComponent(sortParam)}`;
      
      if (searchParam.trim()) {
        url += `&search=${encodeURIComponent(searchParam.trim())}`;
      }
      
      // Adicionar parâmetros de data se houver filtro de data e se for Killpoints Gained
      if (dateFilterParam && sortParam === 'Killpoints Gained') {
        url += `&startDate=${encodeURIComponent(dateFilterParam.startDate)}`;
        url += `&endDate=${encodeURIComponent(dateFilterParam.endDate)}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.data);
        setPagination(data.pagination);
        setLastUpdated(data.lastUpdated || null);
      } else {
        console.error("Erro ao buscar jogadores");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [sortField, searchTerm, dateRange]);

  // Handler para mudança do filtro de data
  const handleDateRangeChange = (range: { startDate: string; endDate: string } | null) => {
    setDateRange(range);
    // Se não for Killpoints Gained, limpar o filtro de data
    if (sortField !== 'Killpoints Gained' && range) {
      setDateRange(null);
      return;
    }
  };
function formatDateUTC(dateStr: string) {
  // dateStr = 'YYYY-MM-DD'
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year.slice(2)}`; // dd/mm/yy
}
  // Handler para mudança do campo de ordenação
  const handleSortFieldChange = (field: SortField) => {
    setSortField(field);
    // Se mudou para um campo que não é Killpoints Gained, limpar o filtro de data
    if (field !== 'Killpoints Gained') {
      setDateRange(null);
    }
  };

  useEffect(() => {
    fetchPlayers(currentPage, sortField, searchTerm, dateRange);
  }, [currentPage]);

  useEffect(() => {
    // Reset para página 1 quando mudar a ordenação
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPlayers(1, sortField, searchTerm, dateRange);
    }
  }, [sortField]);

  useEffect(() => {
    // Reset para página 1 quando pesquisar
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPlayers(1, sortField, searchTerm, dateRange);
    }
  }, [searchTerm]);

  useEffect(() => {
    // Reset para página 1 quando mudar o filtro de data
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPlayers(1, sortField, searchTerm, dateRange);
    }
  }, [dateRange]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave para o topo
    //window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  // Não precisamos mais ordenar localmente, pois já vem ordenado do backend
  const displayPlayers = players;

  // Calcular rank global baseado na página atual
  const getGlobalRank = (index: number) => {
    if (!pagination) return index + 1;
    return (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1;
  };

  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading Players...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <RankingHeader 
          sortField={sortField} 
          onSortChange={handleSortFieldChange} 
          loading={loading}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
        
        {/* Última atualização */}
        {lastUpdated && (
          <div className="flex justify-center mb-6">
            <span className="px-4 py-2 border-2 border-yellow-400 text-yellow-400 bg-gray-900 rounded-lg font-semibold text-sm shadow-md shadow-yellow-500/50 animate-pulse">
              ⏱ Last update: {new Date(lastUpdated).toLocaleDateString('en-GB')}
            </span>
          </div>
        )}
        
        {/* Campo de Busca */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search player by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-foreground text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Informações de paginação */}
        {pagination && (
          <div className="text-center text-sm text-muted-foreground mb-6">
            {searchTerm.trim() ? (
              <>
                Found {pagination.totalItems} player{pagination.totalItems !== 1 ? 's' : ''} 
                {pagination.totalItems > 0 && (
                  <> (showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)})</>
                )}
                {' '}for "{searchTerm}"
                {sortField === 'Killpoints Gained' && dateRange && (
                  <> from {formatDateUTC(dateRange.startDate)} to {formatDateUTC(dateRange.endDate)}</>
                )}
              </>
            ) : (
              <>
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} from {pagination.totalItems} players
{sortField === 'Killpoints Gained' && dateRange && (
  <> (Killpoints gained from {formatDateUTC(dateRange.startDate)} to {formatDateUTC(dateRange.endDate)})</>
)}
              </>
            )}
          </div>
        )}

        {/* Loading overlay durante carregamento */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading...</span>
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayPlayers.map((player, index) => (
              <PlayerCard 
                key={`${player.playerId}-${currentPage}-${sortField}-${searchTerm}-${dateRange?.startDate || 'no-date'}-${index}`} 
                player={player} 
                rank={player.rank}
                kvk={kvk}

              />
            ))}
          </div>
        </div>

        {/* Paginação */}
        {pagination && pagination.totalPages > 1 && (
          <PaginationPages
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        {/* Mensagem quando não há dados */}
        {!loading && players.length === 0 && (
          <div className="text-center py-12">
            {searchTerm.trim() ? (
              <div>
                <p className="text-lg text-muted-foreground mb-2">
                  No players found for "{searchTerm}"
                  {sortField === 'Killpoints Gained' && dateRange && (
                    <> in the period from {new Date(dateRange.startDate).toLocaleDateString('pt-BR')} to {new Date(dateRange.endDate).toLocaleDateString('pt-BR')}</>
                  )}
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-primary hover:underline"
                >
                  Clear search to see all players
                </button>
              </div>
            ) : (
              <div>
                <p className="text-lg text-muted-foreground mb-2">No Players found.</p>
                {sortField === 'Killpoints Gained' && dateRange && (
                  <p className="text-sm text-muted-foreground">
                    Try a different date range or clear the date filter.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};