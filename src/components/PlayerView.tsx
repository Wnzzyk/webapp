'use client';
// src/components/PlayerView.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber } from './ui/AnimatedNumber';
import { RingChart } from './ui/RingChart';
import { LevelBadge } from './ui/LevelBadge';
import { MapStats } from './MapStats';
import type { PlayerProfile } from '@/lib/types';

const CUSTOM_TITLES: Record<string, string> = {
  legend: '🏆 Легенда',
  veteran: '⚔️ Ветеран',
  challenger: '🎯 Претендент',
  elite: '💎 Элита',
  predator: '🔥 Хищник',
};

type LeagueTab = 'default' | 'pro';

interface Props {
  player: PlayerProfile;
  isOwn?: boolean;
}

export function PlayerView({ player, isOwn }: Props) {
  const [leagueTab, setLeagueTab] = useState<LeagueTab>('default');
  const showPL = player.hasProLeague && player.proLeague;

  const bannerSrc = player.bannerFileId
    ? `/api/telegram-file?file_id=${player.bannerFileId}`
    : null;

  const levelGradient = getLevelGradient(player.level);

  return (
    <div className="pb-6">

      {/* ── Banner / Header ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: 160 }}>
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ background: levelGradient }} />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(13,13,13,0) 0%, rgba(13,13,13,0.7) 60%, #0d0d0d 100%)',
        }} />
        {/* Player name on banner */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <LevelBadge level={player.level} size="md" />
                {player.isPremium && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700' }}>
                    ✨ Premium
                  </span>
                )}
                {player.hasProLeague && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: 'rgba(255,140,0,0.2)', color: '#FFA500' }}>
                    🏅 Pro
                  </span>
                )}
              </div>
              <h1 className="text-xl font-black text-white leading-none"
                style={player.nickColor ? { color: player.nickColor } : {}}>
                {player.gameNickname}
              </h1>
              {player.playerTag && (
                <span className="text-xs text-[#a0a0a0]">[{player.playerTag}]</span>
              )}
            </div>
            {/* Rank badge */}
            <div className="text-right">
              <div className="text-[10px] text-[#6b7280] mb-0.5">РЕЙТИНГ</div>
              <div className="text-2xl font-black" style={{ color: player.rank <= 3 ? '#FFD700' : '#ffffff' }}>
                #{player.rank}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── League tabs (only if Pro League available) ────────────────── */}
      {showPL && (
        <div className="flex mx-4 mt-4 rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
          {(['default', 'pro'] as LeagueTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setLeagueTab(tab)}
              className="flex-1 py-2.5 text-sm font-semibold relative btn-press transition-colors"
              style={{ color: leagueTab === tab ? '#FFD700' : '#6b7280' }}
            >
              {tab === 'default' ? '🎮 Default' : '🏅 Pro League'}
              {leagueTab === tab && (
                <motion.div
                  layoutId="league-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: '#FFD700' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={leagueTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          {leagueTab === 'default'
            ? <DefaultLeagueStats player={player} />
            : <ProLeagueStats player={player} />
          }
        </motion.div>
      </AnimatePresence>

      {/* ── Custom title & extra info ─────────────────────────────────── */}
      {(player.customTitle || player.mvpCount > 0) && (
        <div className="mx-4 mt-4 rounded-xl p-3.5 flex items-center justify-between"
          style={{ background: 'var(--surface)' }}>
          {player.customTitle && (
            <span className="text-sm font-semibold" style={{ color: '#FFD700' }}>
              {CUSTOM_TITLES[player.customTitle] ?? player.customTitle}
            </span>
          )}
          {player.mvpCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">👑</span>
              <span className="text-sm text-[#a0a0a0]">MVP ×{player.mvpCount}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Battle Pass strip ─────────────────────────────────────────── */}
      {player.battlePass && (
        <div className="mx-4 mt-3 rounded-xl p-3.5"
          style={{ background: 'var(--surface)', borderLeft: '3px solid #FFD700' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#6b7280]">Battle Pass</div>
              <div className="font-bold text-white">
                Уровень {player.battlePass.bpLevel}
                <span className="text-xs text-[#6b7280] ml-1.5">
                  ({player.battlePass.bpWins} побед к следующему)
                </span>
              </div>
            </div>
            {player.battlePass.isBought && (
              <span className="text-[10px] px-2 py-1 rounded font-bold"
                style={{ background: 'rgba(255,215,0,0.15)', color: '#FFD700' }}>
                ⚔️ КУПЛЕН
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Joined date ───────────────────────────────────────────────── */}
      <div className="text-center mt-5 text-[11px] text-[#3a3a3a]">
        В Faceit Arena с {formatDate(player.createdAt)}
      </div>
    </div>
  );
}

// ── Default League stats ──────────────────────────────────────────────────────

function DefaultLeagueStats({ player }: { player: PlayerProfile }) {
  return (
    <>
      {/* ELO */}
      <div className="mx-4 mt-4 rounded-2xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid rgba(255,215,0,0.1)' }}>
        <div className="text-[11px] text-[#6b7280] uppercase tracking-wider mb-1">ELO рейтинг</div>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-black elo-gradient leading-none">
            <AnimatedNumber value={player.elo} duration={800} />
          </span>
          <div className="pb-1 text-xs text-[#6b7280]">
            <div>Лучшая серия: <span className="text-white font-bold">{player.bestStreak}</span></div>
            <div>Текущая серия: <span className="text-white font-bold">{player.winStreak}</span></div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
        <StatCard label="Матчей" value={player.totalMatches} />
        <StatCard label="Побед"  value={player.wins} accent />
        <StatCard label="K/D"    value={player.kd} decimals={2} />
        <WinRateCard winRate={player.winRate} />
      </div>

      {/* Extended stats */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        <MiniStat label="Убийства"  value={player.kills} />
        <MiniStat label="Смерти"    value={player.deaths} />
        <MiniStat label="Ассисты"   value={player.assists} />
      </div>

      {/* Map stats */}
      <div className="mt-5">
        <MapStats stats={player.mapStats} />
      </div>
    </>
  );
}

// ── Pro League stats ──────────────────────────────────────────────────────────

function ProLeagueStats({ player }: { player: PlayerProfile }) {
  const pl = player.proLeague!;
  return (
    <>
      {/* PL ELO */}
      <div className="mx-4 mt-4 rounded-2xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid rgba(255,140,0,0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] text-[#6b7280] uppercase tracking-wider">Pro League ELO</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
            style={{ background: 'rgba(255,140,0,0.15)', color: '#FFA500' }}>
            #{pl.rank}
          </span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-black leading-none" style={{
            background: 'linear-gradient(135deg, #FFA500, #FF6B00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            <AnimatedNumber value={pl.elo} duration={800} />
          </span>
          <div className="pb-1 text-xs text-[#6b7280]">
            <div>Лучшая серия: <span className="text-white font-bold">{pl.bestStreak}</span></div>
            <div>Текущая серия: <span className="text-white font-bold">{pl.winStreak}</span></div>
          </div>
        </div>
      </div>

      {/* PL Stats grid */}
      <div className="mx-4 mt-3 grid grid-cols-4 gap-2">
        <StatCard label="Матчей" value={pl.totalMatches} />
        <StatCard label="Побед"  value={pl.wins} accent />
        <StatCard label="K/D"    value={pl.kd} decimals={2} />
        <WinRateCard winRate={pl.winRate} />
      </div>

      {/* PL Map stats */}
      <div className="mt-5">
        <MapStats stats={pl.mapStats} title="Карты — Pro League" />
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, decimals = 0 }: {
  label: string; value: number; accent?: boolean; decimals?: number;
}) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)' }}>
      <div className="text-[10px] text-[#6b7280] mb-1">{label}</div>
      <div className={`text-lg font-black ${accent ? 'text-green-400' : 'text-white'}`}>
        <AnimatedNumber value={value} decimals={decimals} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: 'var(--surface)' }}>
      <div className="text-[10px] text-[#6b7280] mb-0.5">{label}</div>
      <div className="text-sm font-bold text-white">
        <AnimatedNumber value={value} />
      </div>
    </div>
  );
}

function WinRateCard({ winRate }: { winRate: number }) {
  return (
    <div className="rounded-xl p-2 flex items-center justify-center" style={{ background: 'var(--surface)' }}>
      <RingChart
        value={winRate}
        size={52}
        stroke={5}
        label={`${winRate}%`}
        sublabel="WR"
      />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLevelGradient(level: number): string {
  if (level <= 2) return 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)';
  if (level <= 4) return 'linear-gradient(135deg, #0a1a0a 0%, #1a2a1a 100%)';
  if (level <= 6) return 'linear-gradient(135deg, #1a1500 0%, #2a2000 100%)';
  if (level <= 8) return 'linear-gradient(135deg, #1a0e00 0%, #2a1800 100%)';
  return 'linear-gradient(135deg, #1a0000 0%, #2a0808 100%)';
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  } catch { return '—'; }
}
