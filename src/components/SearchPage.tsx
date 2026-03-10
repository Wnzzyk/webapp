'use client';
// src/components/SearchPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelBadge, getLevelColor } from './ui/LevelBadge';

interface SearchResult {
  id: number;
  gameNickname: string;
  elo: number;
  level: number;
  isPremium: boolean;
  hasProLeague: boolean;
  totalMatches: number;
}

interface Props {
  onSelectPlayer: (nickname: string) => void;
}

export function SearchPage({ onSelectPlayer }: Props) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-black text-white">Поиск</h1>
        <p className="text-sm text-[#6b7280] mt-0.5">Найти игрока по нику</p>
      </div>

      {/* Search input */}
      <div className="px-4 mb-4">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${focused ? 'rgba(255,215,0,0.4)' : 'var(--border)'}`,
            boxShadow: focused ? '0 0 0 3px rgba(255,215,0,0.08)' : 'none',
          }}
        >
          {loading ? (
            <Spinner />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#6b7280" strokeWidth="2" />
              <path d="M20 20l-3-3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Введите никнейм..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-white placeholder-[#5a5a5a] outline-none text-base"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="text-[#6b7280] btn-press"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="px-4 space-y-2"
          >
            <div className="text-xs text-[#6b7280] mb-2 px-1">
              Найдено: {results.length}
            </div>
            {results.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => {
                  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
                  onSelectPlayer(p.gameNickname);
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl btn-press"
                style={{ background: 'var(--surface)' }}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-lg"
                  style={{
                    background: `${getLevelColor(p.level)}18`,
                    color: getLevelColor(p.level),
                    border: `1.5px solid ${getLevelColor(p.level)}30`,
                  }}
                >
                  {p.gameNickname[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white truncate">{p.gameNickname}</span>
                    {p.isPremium && <span className="text-yellow-400 text-xs">✨</span>}
                    {p.hasProLeague && <span className="text-orange-400 text-xs">🏅</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <LevelBadge level={p.level} size="sm" />
                    <span className="text-[11px] text-[#6b7280]">{p.totalMatches} матчей</span>
                  </div>
                </div>

                {/* ELO */}
                <div className="text-right shrink-0">
                  <div className="font-black text-white">{p.elo.toLocaleString('ru-RU')}</div>
                  <div className="text-[10px] text-[#6b7280]">ELO</div>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M9 18l6-6-6-6" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </motion.button>
            ))}
          </motion.div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <span className="text-4xl mb-3 block">🔍</span>
            <div className="text-[#6b7280] text-sm">Игрок не найден</div>
            <div className="text-[#3a3a3a] text-xs mt-1">«{query}»</div>
          </motion.div>
        )}

        {query.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <span className="text-5xl mb-4 block">👾</span>
            <div className="text-[#6b7280] text-sm font-medium">Введите никнейм</div>
            <div className="text-[#3a3a3a] text-xs mt-1">минимум 2 символа</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Spinner() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#3a3a3a" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
