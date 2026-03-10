'use client';
// src/components/LeaderboardPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelBadge, getLevelColor } from './ui/LevelBadge';
import { AnimatedNumber } from './ui/AnimatedNumber';
import type { LeaderboardEntry, League } from '@/lib/types';

interface Props {
  currentPlayerId?: number;
  onSelectPlayer: (nickname: string) => void;
}

export function LeaderboardPage({ currentPlayerId, onSelectPlayer }: Props) {
  const [league, setLeague]   = useState<League>('default');
  const [data, setData]       = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?league=${league}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [league]);

  const top3  = data.slice(0, 3);
  const rest  = data.slice(3);
  const myPos = currentPlayerId ? data.findIndex(d => d.id === currentPlayerId) : -1;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-black text-white">Топ игроков</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Faceit Arena • Standoff 2</p>
      </div>

      {/* League tabs */}
      <div className="flex mx-4 mb-5 rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
        {(['default', 'pro'] as League[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
              setLeague(tab);
            }}
            className="flex-1 py-2.5 text-sm font-semibold relative btn-press transition-colors"
            style={{ color: league === tab ? '#FFD700' : '#6b7280' }}
          >
            {tab === 'default' ? '🎮 Default' : '🏅 Pro League'}
            {league === tab && (
              <motion.div
                layoutId="lb-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <SkeletonList key="skeleton" />
        ) : (
          <motion.div
            key={league}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Podium */}
            {top3.length >= 3 && (
              <Podium entries={top3} onSelect={onSelectPlayer} />
            )}

            {/* My position banner */}
            {myPos >= 3 && (
              <div className="mx-4 mb-3 rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)' }}>
                <span className="text-[#FFD700] font-black text-lg w-8">#{myPos + 1}</span>
                <span className="text-white text-sm font-medium">Ваша позиция</span>
              </div>
            )}

            {/* Full list */}
            <div className="px-4 space-y-2">
              {rest.map((entry, i) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  index={i}
                  isCurrentUser={entry.id === currentPlayerId}
                  onSelect={() => onSelectPlayer(entry.gameNickname)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Podium ────────────────────────────────────────────────────────────────────

function Podium({ entries, onSelect }: { entries: LeaderboardEntry[]; onSelect: (n: string) => void }) {
  // Order: 2nd, 1st, 3rd for visual podium
  const order = [entries[1], entries[0], entries[2]];
  const heights = [80, 110, 60];
  const medals  = ['🥈', '🥇', '🥉'];
  const colors  = ['#C0C0C0', '#FFD700', '#CD7F32'];

  return (
    <div className="mx-4 mb-5 rounded-2xl overflow-hidden p-4 pt-6"
      style={{ background: 'var(--surface)' }}>
      <div className="flex items-end justify-center gap-3">
        {order.map((entry, i) => {
          if (!entry) return null;
          const isFirst = i === 1;
          return (
            <motion.button
              key={entry.id}
              onClick={() => onSelect(entry.gameNickname)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.1, type: 'spring', stiffness: 400, damping: 28 }}
              className="flex flex-col items-center gap-2 btn-press"
              style={{ width: 100 }}
            >
              {/* Medal */}
              <span className="text-2xl">{medals[i]}</span>

              {/* Avatar placeholder */}
              <div
                className="rounded-2xl flex items-center justify-center font-black text-xl text-white"
                style={{
                  width: isFirst ? 60 : 50,
                  height: isFirst ? 60 : 50,
                  background: `linear-gradient(135deg, ${colors[i]}30, ${colors[i]}60)`,
                  border: `2px solid ${colors[i]}`,
                  boxShadow: isFirst ? `0 0 20px ${colors[i]}40` : 'none',
                }}
              >
                {entry.gameNickname[0].toUpperCase()}
              </div>

              {/* Pedestal */}
              <div
                className="w-full rounded-t-xl flex flex-col items-center justify-end pb-2 pt-2"
                style={{
                  height: heights[i],
                  background: `linear-gradient(180deg, ${colors[i]}20, ${colors[i]}08)`,
                  border: `1px solid ${colors[i]}20`,
                  borderBottom: 'none',
                }}
              >
                <span className="text-[11px] font-bold text-center leading-tight px-1 text-white line-clamp-1">
                  {entry.gameNickname}
                </span>
                <span className="text-xs font-black" style={{ color: colors[i] }}>
                  {entry.elo.toLocaleString('ru-RU')}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function LeaderboardRow({
  entry, index, isCurrentUser, onSelect,
}: {
  entry: LeaderboardEntry; index: number; isCurrentUser: boolean; onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={() => { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); onSelect(); }}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 30 }}
      className="w-full flex items-center gap-3 p-3 rounded-xl btn-press"
      style={{
        background: isCurrentUser ? 'rgba(255,215,0,0.08)' : 'var(--surface)',
        border: isCurrentUser ? '1px solid rgba(255,215,0,0.2)' : '1px solid transparent',
      }}
    >
      {/* Rank */}
      <span className="w-8 text-center font-black text-sm shrink-0"
        style={{ color: '#6b7280' }}>
        #{entry.rank}
      </span>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-black text-sm"
        style={{
          background: `${getLevelColor(entry.level)}20`,
          color: getLevelColor(entry.level),
          border: `1px solid ${getLevelColor(entry.level)}30`,
        }}
      >
        {entry.gameNickname[0].toUpperCase()}
      </div>

      {/* Name + badges */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-white truncate">{entry.gameNickname}</span>
          {entry.isPremium && <span className="text-[10px] text-yellow-400">✨</span>}
          {entry.hasProLeague && <span className="text-[10px] text-orange-400">🏅</span>}
        </div>
        <div className="flex items-center gap-2">
          <LevelBadge level={entry.level} size="sm" />
          <span className="text-[11px] text-[#6b7280]">
            {entry.winRate}% WR • {entry.totalMatches}М
          </span>
        </div>
      </div>

      {/* ELO */}
      <div className="text-right shrink-0">
        <div className="font-black text-base text-white">
          <AnimatedNumber value={entry.elo} />
        </div>
        <div className="text-[10px] text-[#6b7280]">ELO</div>
      </div>
    </motion.button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="px-4 space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-16 rounded-xl skeleton" />
      ))}
    </div>
  );
}
