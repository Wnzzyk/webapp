'use client';
// src/app/page.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, type Tab } from '@/components/Navigation';
import { PlayerView } from '@/components/PlayerView';
import { LeaderboardPage } from '@/components/LeaderboardPage';
import { SearchPage } from '@/components/SearchPage';
import { useApp } from './providers';
import type { PlayerProfile } from '@/lib/types';

export default function Home() {
  const { player, tgUser, loading, error } = useApp();
  const [tab, setTab] = useState<Tab>('profile');

  // Viewed player (for viewing other profiles from search/leaderboard)
  const [viewedNick, setViewedNick]       = useState<string | null>(null);
  const [viewedPlayer, setViewedPlayer]   = useState<PlayerProfile | null>(null);
  const [viewLoading, setViewLoading]     = useState(false);

  const handleSelectPlayer = async (nickname: string) => {
    if (nickname === player?.gameNickname) {
      setViewedNick(null);
      setViewedPlayer(null);
      setTab('profile');
      return;
    }
    setViewedNick(nickname);
    setViewedPlayer(null);
    setViewLoading(true);
    setTab('profile');
    try {
      const res = await fetch(`/api/player/${encodeURIComponent(nickname)}`);
      if (res.ok) setViewedPlayer(await res.json());
    } finally {
      setViewLoading(false);
    }
  };

  const handleBack = () => {
    setViewedNick(null);
    setViewedPlayer(null);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return <SplashScreen />;

  // ── Not registered ───────────────────────────────────────────────────────
  if (error === 'not_registered') return <NotRegistered />;

  // ── Auth failed in dev mode (no initData) ────────────────────────────────
  const currentPlayer = viewedNick ? viewedPlayer : player;
  const isOwn = !viewedNick;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Viewed player back button */}
      {viewedNick && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleBack}
          className="fixed top-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl btn-press"
          style={{ background: 'rgba(22,22,22,0.9)', backdropFilter: 'blur(10px)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-[#FFD700] font-semibold">Назад</span>
        </motion.button>
      )}

      {/* Main content */}
      <div className="pb-20 overflow-y-auto" style={{ height: '100dvh' }}>
        <AnimatePresence mode="wait" custom={1}>
          {tab === 'profile' && (
            <motion.div
              key={viewedNick ?? 'own-profile'}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              {viewLoading ? (
                <ProfileSkeleton />
              ) : currentPlayer ? (
                <PlayerView player={currentPlayer} isOwn={isOwn} />
              ) : player ? (
                <PlayerView player={player} isOwn />
              ) : (
                <NotRegistered />
              )}
            </motion.div>
          )}

          {tab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <LeaderboardPage
                currentPlayerId={player?.id}
                onSelectPlayer={nick => handleSelectPlayer(nick)}
              />
            </motion.div>
          )}

          {tab === 'search' && (
            <motion.div
              key="search"
              custom={-1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <SearchPage onSelectPlayer={nick => handleSelectPlayer(nick)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navigation
        active={tab}
        onChange={t => {
          setViewedNick(null);
          setViewedPlayer(null);
          setTab(t);
        }}
        hasProfile={!!player}
      />
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────────

function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-5"
      >
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.2)' }}>
          ⚡
        </div>
        <div className="text-center">
          <div className="text-xl font-black text-white">Faceit Arena</div>
          <div className="text-sm text-[#6b7280]">Standoff 2</div>
        </div>
        {/* Loading dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-yellow-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function NotRegistered() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-center"
      >
        <div className="text-6xl mb-5">🎮</div>
        <h2 className="text-xl font-black text-white mb-2">Профиль не найден</h2>
        <p className="text-sm text-[#6b7280] leading-relaxed">
          Зарегистрируйся в боте Faceit Arena, чтобы начать играть и видеть свою статистику
        </p>
        <div className="mt-6 px-4 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
          Напиши /start в боте
        </div>
      </motion.div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 skeleton" />
      <div className="px-4 space-y-3">
        <div className="h-24 rounded-2xl skeleton" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl skeleton" />)}
        </div>
        <div className="h-40 rounded-xl skeleton" />
      </div>
    </div>
  );
}
