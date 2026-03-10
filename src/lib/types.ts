// src/lib/types.ts

export interface PlayerProfile {
  id: number;
  userId: string;
  gameNickname: string;
  gameId: string;
  elo: number;
  level: number;
  totalMatches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  roundsPlayed: number;
  winStreak: number;
  bestStreak: number;
  mvpCount: number;
  isPremium: boolean;
  hasProLeague: boolean;
  premiumUntil: string | null;
  playerTag: string | null;
  customTitle: string | null;
  nickColor: string | null;
  patternId: number;
  bannerUrl: string | null;
  bannerFileId: string | null;
  seasonSkin: string | null;
  createdAt: string;
  // computed
  kd: number;
  winRate: number;
  avgKills: number;
  rank: number; // position in leaderboard
  // relations
  mapStats: MapStatEntry[];
  proLeague: ProLeagueData | null;
  battlePass: BattlePassData | null;
}

export interface MapStatEntry {
  mapName: string;
  matches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  // computed
  kd: number;
  winRate: number;
  avgKills: number;
}

export interface ProLeagueData {
  elo: number;
  totalMatches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  winStreak: number;
  bestStreak: number;
  // computed
  kd: number;
  winRate: number;
  rank: number;
  mapStats: MapStatEntry[];
}

export interface BattlePassData {
  isBought: boolean;
  bpLevel: number;
  bpWins: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  gameNickname: string;
  elo: number;
  level: number;
  wins: number;
  totalMatches: number;
  winRate: number;
  kd: number;
  isPremium: boolean;
  hasProLeague: boolean;
  isCurrentUser?: boolean;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export type League = 'default' | 'pro';
