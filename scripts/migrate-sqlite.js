#!/usr/bin/env node
/**
 * migrate-sqlite.js
 * Переносит все данные из SQLite (бот) в PostgreSQL (Railway)
 *
 * Запуск:
 *   DATABASE_URL="postgresql://..." SQLITE_PATH="../python_backend/faceit.db" node scripts/migrate-sqlite.js
 */

const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, '../../python_backend/faceit.db');
const BATCH = 50; // batch size for inserts

const prisma = new PrismaClient();
let sqlite;

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

async function migrate() {
  console.log('🚀 Начало миграции SQLite → PostgreSQL');
  console.log(`   SQLite: ${SQLITE_PATH}`);
  console.log(`   PostgreSQL: ${process.env.DATABASE_URL?.split('@')[1] || '(DATABASE_URL not set)'}\n`);

  sqlite = new Database(SQLITE_PATH, { readonly: true });

  // ── 1. Players ────────────────────────────────────────────────────────────
  console.log('📦 Миграция players...');
  const players = sqlite.prepare('SELECT * FROM players').all();
  console.log(`   Найдено: ${players.length}`);

  for (const batch of chunk(players, BATCH)) {
    await Promise.all(batch.map(p =>
      prisma.player.upsert({
        where: { userId: BigInt(p.user_id) },
        update: {},
        create: {
          id:              p.id,
          userId:          BigInt(p.user_id),
          username:        p.username || null,
          firstName:       p.first_name || null,
          lastName:        p.last_name || null,
          gameNickname:    p.game_nickname || '',
          gameId:          p.game_id || '',
          elo:             p.elo || 100,
          level:           p.level || 1,
          acfBalance:      p.acf_balance || 0,
          totalMatches:    p.total_matches || 0,
          wins:            p.wins || 0,
          losses:          p.losses || 0,
          kills:           p.kills || 0,
          deaths:          p.deaths || 0,
          assists:         p.assists || 0,
          roundsPlayed:    p.rounds_played || 0,
          winStreak:       p.win_streak || 0,
          bestStreak:      p.best_streak || 0,
          mvpCount:        p.mvp_count || 0,
          referralCode:    p.referral_code || null,
          referredBy:      p.referred_by || null,
          referralCount:   p.referral_count || 0,
          isBlocked:       Boolean(p.is_blocked),
          blockUntil:      p.block_until || null,
          blockCount:      p.block_count || 0,
          isRegistered:    Boolean(p.is_registered),
          isPremium:       Boolean(p.is_premium),
          hasProLeague:    Boolean(p.has_pro_league),
          premiumUntil:    p.premium_until || null,
          registrationStep: p.registration_step || 'start',
          createdAt:       p.created_at || new Date().toISOString(),
          lastActivity:    p.last_activity || null,
          playerTag:       p.player_tag || null,
          customTitle:     p.custom_title || null,
          eloInsurance:    Boolean(p.elo_insurance),
          bannerFileId:    p.banner_file_id || null,
          seasonSkin:      p.season_skin || null,
        },
      }).catch(e => console.warn(`   ⚠ Player ${p.id} (${p.game_nickname}): ${e.message}`))
    ));
  }
  console.log(`   ✅ Players: ${players.length}`);

  // ── 2. Matches ────────────────────────────────────────────────────────────
  console.log('\n📦 Миграция matches...');
  let matchRows = [];
  try { matchRows = sqlite.prepare('SELECT * FROM matches').all(); } catch {}
  console.log(`   Найдено: ${matchRows.length}`);
  for (const batch of chunk(matchRows, BATCH)) {
    await Promise.all(batch.map(m =>
      prisma.match.upsert({
        where: { matchNumber: m.match_number },
        update: {},
        create: {
          id:          m.id,
          matchNumber: m.match_number,
          status:      m.status || 'finished',
          map:         m.map || null,
          scoreT:      m.score_t || 0,
          scoreCt:     m.score_ct || 0,
          hostId:      m.host_id || null,
          groupId:     m.group_id ? BigInt(m.group_id) : null,
          inviteLink:  m.invite_link || null,
          createdAt:   m.created_at || new Date().toISOString(),
          startedAt:   m.started_at || null,
          finishedAt:  m.finished_at || null,
          league:      m.league || 'default',
        },
      }).catch(e => console.warn(`   ⚠ Match ${m.id}: ${e.message}`))
    ));
  }
  console.log(`   ✅ Matches: ${matchRows.length}`);

  // ── 3. Match players ──────────────────────────────────────────────────────
  console.log('\n📦 Миграция match_players...');
  let mpRows = [];
  try { mpRows = sqlite.prepare('SELECT * FROM match_players').all(); } catch {}
  for (const batch of chunk(mpRows, BATCH)) {
    await Promise.all(batch.map(mp =>
      prisma.matchPlayer.upsert({
        where: { id: mp.id },
        update: {},
        create: {
          id:          mp.id,
          matchId:     mp.match_id,
          playerId:    mp.player_id,
          team:        mp.team || '',
          kills:       mp.kills || 0,
          deaths:      mp.deaths || 0,
          assists:     mp.assists || 0,
          eloChange:   mp.elo_change || 0,
          joinedLobby: Boolean(mp.joined_lobby),
        },
      }).catch(() => {})
    ));
  }
  console.log(`   ✅ MatchPlayers: ${mpRows.length}`);

  // ── 4. Map stats ──────────────────────────────────────────────────────────
  console.log('\n📦 Миграция map_stats...');
  let msRows = [];
  try { msRows = sqlite.prepare('SELECT * FROM map_stats').all(); } catch {}
  for (const batch of chunk(msRows, BATCH)) {
    await Promise.all(batch.map(ms =>
      prisma.mapStat.upsert({
        where: { playerId_mapName: { playerId: ms.player_id, mapName: ms.map_name } },
        update: { wins: ms.wins, losses: ms.losses, kills: ms.kills, deaths: ms.deaths, assists: ms.assists, matches: ms.matches },
        create: {
          playerId: ms.player_id, mapName: ms.map_name,
          matches: ms.matches || 0, wins: ms.wins || 0, losses: ms.losses || 0,
          kills: ms.kills || 0, deaths: ms.deaths || 0, assists: ms.assists || 0,
        },
      }).catch(() => {})
    ));
  }
  console.log(`   ✅ MapStats: ${msRows.length}`);

  // ── 5. Pro League stats ───────────────────────────────────────────────────
  console.log('\n📦 Миграция pro_league_stats...');
  let plRows = [];
  try { plRows = sqlite.prepare('SELECT * FROM pro_league_stats').all(); } catch {}
  for (const batch of chunk(plRows, BATCH)) {
    await Promise.all(batch.map(pl =>
      prisma.proLeagueStat.upsert({
        where: { playerId: pl.player_id },
        update: {},
        create: {
          playerId: pl.player_id, elo: pl.elo || 100,
          totalMatches: pl.total_matches || 0, wins: pl.wins || 0, losses: pl.losses || 0,
          kills: pl.kills || 0, deaths: pl.deaths || 0, assists: pl.assists || 0,
          roundsPlayed: pl.rounds_played || 0, winStreak: pl.win_streak || 0, bestStreak: pl.best_streak || 0,
        },
      }).catch(() => {})
    ));
  }
  console.log(`   ✅ ProLeagueStats: ${plRows.length}`);

  // ── 6. Pro League map stats ───────────────────────────────────────────────
  console.log('\n📦 Миграция pro_league_map_stats...');
  let plmsRows = [];
  try { plmsRows = sqlite.prepare('SELECT * FROM pro_league_map_stats').all(); } catch {}
  for (const batch of chunk(plmsRows, BATCH)) {
    await Promise.all(batch.map(ms =>
      prisma.proLeagueMapStat.upsert({
        where: { playerId_mapName: { playerId: ms.player_id, mapName: ms.map_name } },
        update: {},
        create: {
          playerId: ms.player_id, mapName: ms.map_name,
          matches: ms.matches || 0, wins: ms.wins || 0, losses: ms.losses || 0,
          kills: ms.kills || 0, deaths: ms.deaths || 0, assists: ms.assists || 0,
        },
      }).catch(() => {})
    ));
  }
  console.log(`   ✅ ProLeagueMapStats: ${plmsRows.length}`);

  // ── 7. Battle pass ────────────────────────────────────────────────────────
  console.log('\n📦 Миграция battle_pass...');
  let bpRows = [];
  try { bpRows = sqlite.prepare('SELECT * FROM battle_pass').all(); } catch {}
  for (const batch of chunk(bpRows, BATCH)) {
    await Promise.all(batch.map(bp =>
      prisma.battlePass.upsert({
        where: { playerId: bp.player_id },
        update: {},
        create: {
          playerId: bp.player_id, isBought: Boolean(bp.is_bought),
          bpLevel: bp.bp_level || 0, bpWins: bp.bp_wins || 0,
          createdAt: bp.created_at || null,
        },
      }).catch(() => {})
    ));
  }
  console.log(`   ✅ BattlePass: ${bpRows.length}`);

  // ── Fix auto-increment sequences ──────────────────────────────────────────
  console.log('\n🔧 Сброс последовательностей PostgreSQL...');
  const tables = ['players', 'matches', 'match_players', 'map_stats',
    'pro_league_stats', 'pro_league_map_stats', 'battle_pass'];
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE(MAX(id), 1)) FROM "${t}"`
      );
    } catch {}
  }

  console.log('\n✅ Миграция завершена успешно!');
}

migrate()
  .catch(e => { console.error('❌ Ошибка миграции:', e); process.exit(1); })
  .finally(() => { sqlite?.close(); prisma.$disconnect(); });
