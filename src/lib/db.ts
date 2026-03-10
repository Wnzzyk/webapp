// src/lib/db.ts
import { PrismaClient } from '@prisma/client';
import type { PlayerProfile, MapStatEntry, ProLeagueData, LeaderboardEntry } from './types';

// Singleton pattern for Prisma in Next.js
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcKD(kills: number, deaths: number): number {
  if (deaths === 0) return kills > 0 ? kills : 0;
  return Math.round((kills / deaths) * 100) / 100;
}

function calcWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

function calcAvgKills(kills: number, matches: number): number {
  if (matches === 0) return 0;
  return Math.round((kills / matches) * 10) / 10;
}

function mapStatToEntry(ms: { mapName: string; matches: number; wins: number; losses: number; kills: number; deaths: number; assists: number }): MapStatEntry {
  return {
    mapName: ms.mapName,
    matches: ms.matches,
    wins: ms.wins,
    losses: ms.losses,
    kills: ms.kills,
    deaths: ms.deaths,
    assists: ms.assists,
    kd: calcKD(ms.kills, ms.deaths),
    winRate: calcWinRate(ms.wins, ms.matches),
    avgKills: calcAvgKills(ms.kills, ms.matches),
  };
}

// ── Get player rank (position in leaderboard by ELO) ─────────────────────────

async function getPlayerRank(playerId: number): Promise<number> {
  const res = await prisma.$queryRaw<[{ rank: bigint }]>`
    SELECT COUNT(*) + 1 as rank FROM players
    WHERE elo > (SELECT elo FROM players WHERE id = ${playerId})
    AND is_registered = true
  `;
  return Number(res[0]?.rank ?? 1);
}

async function getPlayerProRank(playerId: number): Promise<number> {
  const res = await prisma.$queryRaw<[{ rank: bigint }]>`
    SELECT COUNT(*) + 1 as rank FROM pro_league_stats pls
    JOIN players p ON p.id = pls.player_id
    WHERE pls.elo > (SELECT elo FROM pro_league_stats WHERE player_id = ${playerId})
    AND p.is_registered = true AND p.has_pro_league = true
  `;
  return Number(res[0]?.rank ?? 1);
}

// ── Main profile fetch ────────────────────────────────────────────────────────

export async function getPlayerProfile(
  identifier: { telegramId?: bigint; nickname?: string; id?: number }
): Promise<PlayerProfile | null> {
  const where = identifier.telegramId
    ? { userId: identifier.telegramId }
    : identifier.nickname
    ? { gameNickname: { equals: identifier.nickname, mode: 'insensitive' as const } }
    : { id: identifier.id };

  const player = await prisma.player.findFirst({
    where: { ...where, isRegistered: true },
    include: {
      mapStats: { orderBy: { matches: 'desc' } },
      proLeagueStats: true,
      proLeagueMapStats: { orderBy: { matches: 'desc' } },
      battlePass: true,
    },
  });

  if (!player) return null;

  const rank = await getPlayerRank(player.id);

  let proLeague: ProLeagueData | null = null;
  if (player.proLeagueStats && player.hasProLeague) {
    const pl = player.proLeagueStats;
    const proRank = await getPlayerProRank(player.id);
    proLeague = {
      elo: pl.elo,
      totalMatches: pl.totalMatches,
      wins: pl.wins,
      losses: pl.losses,
      kills: pl.kills,
      deaths: pl.deaths,
      assists: pl.assists,
      winStreak: pl.winStreak,
      bestStreak: pl.bestStreak,
      kd: calcKD(pl.kills, pl.deaths),
      winRate: calcWinRate(pl.wins, pl.totalMatches),
      rank: proRank,
      mapStats: player.proLeagueMapStats.map(mapStatToEntry),
    };
  }

  return {
    id: player.id,
    userId: player.userId.toString(),
    gameNickname: player.gameNickname,
    gameId: player.gameId,
    elo: player.elo,
    level: player.level,
    totalMatches: player.totalMatches,
    wins: player.wins,
    losses: player.losses,
    kills: player.kills,
    deaths: player.deaths,
    assists: player.assists,
    roundsPlayed: player.roundsPlayed,
    winStreak: player.winStreak,
    bestStreak: player.bestStreak,
    mvpCount: player.mvpCount,
    isPremium: player.isPremium,
    hasProLeague: player.hasProLeague,
    premiumUntil: player.premiumUntil,
    playerTag: player.playerTag,
    customTitle: player.customTitle,
    nickColor: player.nickColor,
    patternId: player.patternId,
    bannerUrl: player.bannerUrl,
    bannerFileId: player.bannerFileId,
    seasonSkin: player.seasonSkin,
    createdAt: player.createdAt,
    kd: calcKD(player.kills, player.deaths),
    winRate: calcWinRate(player.wins, player.totalMatches),
    avgKills: calcAvgKills(player.kills, player.totalMatches),
    rank,
    mapStats: player.mapStats.map(mapStatToEntry),
    proLeague,
    battlePass: player.battlePass ? {
      isBought: player.battlePass.isBought,
      bpLevel: player.battlePass.bpLevel,
      bpWins: player.battlePass.bpWins,
    } : null,
  };
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(league: 'default' | 'pro', limit = 100): Promise<LeaderboardEntry[]> {
  if (league === 'default') {
    const players = await prisma.player.findMany({
      where: { isRegistered: true },
      orderBy: { elo: 'desc' },
      take: limit,
      select: {
        id: true, gameNickname: true, elo: true, level: true,
        wins: true, losses: true, totalMatches: true,
        kills: true, deaths: true, isPremium: true, hasProLeague: true,
      },
    });
    return players.map((p, i) => ({
      rank: i + 1,
      id: p.id,
      gameNickname: p.gameNickname,
      elo: p.elo,
      level: p.level,
      wins: p.wins,
      totalMatches: p.totalMatches,
      winRate: calcWinRate(p.wins, p.totalMatches),
      kd: calcKD(p.kills, p.deaths),
      isPremium: p.isPremium,
      hasProLeague: p.hasProLeague,
    }));
  } else {
    const stats = await prisma.proLeagueStat.findMany({
      where: { player: { isRegistered: true, hasProLeague: true } },
      orderBy: { elo: 'desc' },
      take: limit,
      include: {
        player: {
          select: { id: true, gameNickname: true, level: true, isPremium: true, hasProLeague: true },
        },
      },
    });
    return stats.map((s, i) => ({
      rank: i + 1,
      id: s.player.id,
      gameNickname: s.player.gameNickname,
      elo: s.elo,
      level: s.player.level,
      wins: s.wins,
      totalMatches: s.totalMatches,
      winRate: calcWinRate(s.wins, s.totalMatches),
      kd: calcKD(s.kills, s.deaths),
      isPremium: s.player.isPremium,
      hasProLeague: s.player.hasProLeague,
    }));
  }
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchPlayers(query: string, limit = 10) {
  if (!query || query.length < 2) return [];
  return prisma.player.findMany({
    where: {
      gameNickname: { contains: query, mode: 'insensitive' },
      isRegistered: true,
    },
    orderBy: { elo: 'desc' },
    take: limit,
    select: {
      id: true, gameNickname: true, elo: true, level: true,
      isPremium: true, hasProLeague: true, totalMatches: true,
    },
  });
}
