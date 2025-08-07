'use client';

import { useState, useMemo, useEffect } from "react";
import { Player, SortField } from "@/types/player";
import { PaginationInfo } from "@/types/pagination";
import { PlayerCard } from "./PlayerCard";
import { RankingHeader } from "./RankingHeader";
import { PaginationPages } from "./PaginationPages";
import { Loader2 } from "lucide-react";

export const PlayerRanking = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortField, setSortField] = useState<SortField>("Power");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchPlayers = async (page: number, sort?: SortField) => {
    setLoading(true);
    try {
      const sortParam = sort || sortField;
      const res = await fetch(`/api/players/latest?page=${page}&limit=12&sortBy=${encodeURIComponent(sortParam)}`);
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
  };

  useEffect(() => {
    fetchPlayers(currentPage, sortField);
  }, [currentPage]);

  useEffect(() => {
    // Reset para página 1 quando mudar a ordenação
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchPlayers(1, sortField);
    }
  }, [sortField]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        {/* Informações de paginação */}
        {pagination && (
          <div className="text-center text-sm text-muted-foreground mb-6">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} from {pagination.totalItems} players
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
                key={`${player.playerId}-${currentPage}-${sortField}`} 
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
            <p className="text-lg text-muted-foreground">Nothing Player are found.</p>
          </div>
        )}
      </div>
    </div>
  );
};