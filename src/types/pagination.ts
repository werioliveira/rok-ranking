// types/pagination.ts
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// Adicione ao seu types/player.ts existente
export interface PlayerResponse extends PaginatedResponse<Player> {}

export interface Player {
  id: number
  createdAt: string
  playerId: number
  name: string
  power: number
  killpoints: number
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
}

export type SortField = 'Power' | 'Killpoints' | 'Total Kills' | 'T45 Kills' | 'Rss Gathered';