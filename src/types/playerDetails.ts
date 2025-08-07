// types/playerDetail.ts
export interface PlayerSnapshot {
  id: number;
  createdAt: string;
  playerId: number;
  name: string;
  power: number;
  killpoints: number;
  deads: number;
  t1Kills: number;
  t2Kills: number;
  t3Kills: number;
  t4Kills: number;
  t5Kills: number;
  totalKills: number;
  t45Kills: number;
  ranged: number;
  rssGathered: string;
  rssAssist: string;
  helps: number;
  alliance: string;
}

export interface PlayerCurrentData extends PlayerSnapshot {
  currentRank: number;
}

export interface PlayerStatistics {
  totalSnapshots: number;
  firstSnapshot: string;
  lastSnapshot: string;
  minPower: number;
  maxPower: number;
  powerGrowth: number;
}

export interface PlayerDetailResponse {
  currentData: PlayerCurrentData;
  history: PlayerSnapshot[];
  statistics: PlayerStatistics;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
}