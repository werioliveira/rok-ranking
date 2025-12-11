"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Player, SortField } from "@/types/player";
import { PaginationInfo } from "@/types/pagination";
import { PlayerCard } from "./PlayerCard";
import { RankingHeader } from "./RankingHeader";
import { PaginationPages } from "./PaginationPages";
import { Loader2, Search, X } from "lucide-react";

export const PlayerRanking = ({ kvk }: { kvk?: string }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortField, setSortField] = useState<SortField>("Power");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // filtro de data
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce para a busca (mantive seu debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Atualiza searchTerm e reseta a página para 1 em conjunto (batched update)
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // fetchPlayers agora depende APENAS dos argumentos passados (sem capturar estados externos)
  const fetchPlayers = useCallback(async (
    page: number,
    sort: SortField,
    search: string,
    dateFilter: { startDate: string; endDate: string } | null,
    order: 'asc' | 'desc'
  ) => {
    setLoading(true);
    try {
      const sortParam = sort;
      const searchParam = search ?? "";
      const dateFilterParam = dateFilter ?? null;
      const orderParam = order ?? 'desc';
      let url = `/api/${kvk ? `${kvk}/` : ''}players/latest?page=${page}&limit=12&sortBy=${encodeURIComponent(sortParam)}&order=${orderParam}`;

      if (searchParam.trim()) {
        url += `&search=${encodeURIComponent(searchParam.trim())}`;
      }

      if (dateFilterParam && (sortParam === 'Killpoints Gained' || sortParam === 'Deads Gained' || sortParam === 'Killpoints T45 Gained')) {
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
  }, [kvk]); // dep apenas kvk pois faz parte da URL

  // AGORA: um único objeto memoizado com todos os parâmetros que influenciam a chamada
  const params = useMemo(() => ({
    page: currentPage,
    sortField,
    searchTerm,
    dateRange,
    sortOrder,
  }), [currentPage, sortField, searchTerm, dateRange, sortOrder]);

  // ÚNICO useEffect que chama a API (1 chamada por alteração combinada de params)
  useEffect(() => {
    // chama a função com os parâmetros explícitos (sem ler estados dentro da função)
    fetchPlayers(params.page, params.sortField, params.searchTerm, params.dateRange, params.sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, fetchPlayers]);

  // Handler para mudança do filtro de data
  const handleDateRangeChange = (range: { startDate: string; endDate: string } | null) => {
    // Se não for Killpoints Gained, limpar o filtro de data
    if (range && sortField !== 'Killpoints Gained') {
      setDateRange(null);
      return;
    }
    // atualiza o filtro e reseta a página (batched)
    setDateRange(range);
    setCurrentPage(1);
  };

  function formatDateUTC(dateStr: string) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(2)}`; // dd/mm/yy
  }

  // Handler para mudança do campo de ordenação
  const handleSortFieldChange = (field: SortField) => {
    setSortField(field);
    setSortOrder('desc'); // resetar para padrão
    // limpar filtro de data se necessário
    if (field !== 'Killpoints Gained') {
      setDateRange(null);
    }
    // resetar página para 1 em conjunto com o setSortField (batched)
    setCurrentPage(1);
  };

  const handleSortOrderChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // scroll suavemente se quiser
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchInput("");
    // também resetamos termo e página
    setSearchTerm("");
    setCurrentPage(1);
  };

  // displayPlayers permanece igual
  const displayPlayers = players;

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
          sortOrder={sortOrder}
          onSortChange={handleSortFieldChange}
          onSortOrderChange={handleSortOrderChange}
          loading={loading}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />

        {lastUpdated && (
          <div className="flex justify-center mb-6">
            <span className="px-4 py-2 border-2 border-yellow-400 text-yellow-400 bg-gray-900 rounded-lg font-semibold text-sm shadow-md shadow-yellow-500/50 animate-pulse">
              ⏱ Last update: {new Date(lastUpdated).toLocaleDateString('en-GB')}
            </span>
          </div>
        )}

        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search by Player name or ID..."
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
                kvk={kvk ? "kvk1" : ""}
              />
            ))}
          </div>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <PaginationPages
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

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
