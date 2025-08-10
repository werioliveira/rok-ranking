'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { Player, SortField } from "@/types/player";
import { PaginationInfo } from "@/types/pagination";
import { PlayerCard } from "./PlayerCard";
import { RankingHeader } from "./RankingHeader";
import { PaginationPages } from "./PaginationPages";
import { Loader2, Search, X } from "lucide-react";
import DonationButton from "./DonationButton";

export const PlayerRanking = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortField, setSortField] = useState<SortField>("Power");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounce para a busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchPlayers = useCallback(async (page: number, sort?: SortField, search?: string) => {
    setLoading(true);
    try {
      const sortParam = sort || sortField;
      const searchParam = search !== undefined ? search : searchTerm;
      
      let url = `/api/players/latest?page=${page}&limit=12&sortBy=${encodeURIComponent(sortParam)}`;
      
      if (searchParam.trim()) {
        url += `&search=${encodeURIComponent(searchParam.trim())}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.data);
        setPagination(data.pagination);
      } else {
        console.error("Erro ao buscar jogadores");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [sortField, searchTerm]);

  useEffect(() => {
    fetchPlayers(currentPage, sortField, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    // Reset para página 1 quando mudar a ordenação
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPlayers(1, sortField, searchTerm);
    }
  }, [sortField]);

  useEffect(() => {
    // Reset para página 1 quando pesquisar
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPlayers(1, sortField, searchTerm);
    }
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <RankingHeader sortField={sortField} onSortChange={setSortField} loading={loading} />

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
              </>
            ) : (
              <>
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} from {pagination.totalItems} players
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
                key={`${player.playerId}-${currentPage}-${sortField}-${searchTerm}`} 
                player={player} 
                rank={getGlobalRank(index)} 
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
                </p>
                <button
                  onClick={clearSearch}
                  className="text-sm text-primary hover:underline"
                >
                  Clear search to see all players
                </button>
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">No Players found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};