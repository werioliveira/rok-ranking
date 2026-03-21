// hooks/usePlayerDetail.ts
import { useState, useEffect } from 'react';
import { PlayerDetailResponse } from '@/types/playerDetails';

export const usePlayerDetail = (playerId: string, kvk?: string) => {
  const baseUrl = `/api/players`;


  const [data, setData] = useState<PlayerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!playerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const suffix = kvk ? `?kvk=${encodeURIComponent(kvk)}` : "";
        const response = await fetch(`${baseUrl}/${playerId}${suffix}`);

        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const playerData = await response.json();
        setData(playerData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao buscar dados do player:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [baseUrl, kvk, playerId]);

  return { data, loading, error };
};