import { PaginatedResponse } from "./pagination"

export interface Player {
  id: number
  createdAt: string // ou Date, dependendo do que o backend envia
  playerId: number
  name: string
  power: number
  rank?: number // Nova propriedade
  killpoints: number
  killpointsGained: string; // Nova propriedade
  deads: number
  t1Kills: number
  t2Kills: number
  t3Kills: number
  t4Kills: number
  t5Kills: number
  totalKills: number
  t45Kills: number
  ranged: number
  rssGathered: string | number
  rssAssist: string | number
  helps: number
  alliance: string
  deadsGained: number;
}
// Adicione ao seu types/player.ts existente
export interface PlayerResponse extends PaginatedResponse<Player> {}
export type SortField = 'Power' | 'Killpoints' | 'Total Kills' | 'T45 Kills' | 'Rss Gathered' | 'Killpoints Gained' | 'Deads Gained';