'use client';
// src/components/Navigation.tsx
import { motion } from 'framer-motion';

export type Tab = 'profile' | 'leaderboard' | 'search';

interface Props {
  active: Tab;
  onChange: (t: Tab) => void;
  hasProfile: boolean;
}

const tabs: { id: Tab; icon: React.FC<{ active: boolean }>; label: string }[] = [
  {
    id: 'profile',
    label: 'Профиль',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill={active ? '#FFD700' : '#6b7280'} />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#FFD700' : '#6b7280'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'Топ',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3"  y="12" width="4" height="9" rx="1" fill={active ? '#FFD700' : '#6b7280'} />
        <rect x="10" y="7"  width="4" height="14" rx="1" fill={active ? '#FFD700' : '#6b7280'} />
        <rect x="17" y="3"  width="4" height="18" rx="1" fill={active ? '#FFD700' : '#6b7280'} />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Поиск',
    icon: ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={active ? '#FFD700' : '#6b7280'} strokeWidth="2" />
        <path d="M20 20l-3-3" stroke={active ? '#FFD700' : '#6b7280'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Navigation({ active, onChange, hasProfile }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div
        className="flex items-center justify-around px-2 pt-2 pb-1"
        style={{
          background: 'rgba(13,13,13,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {tabs.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
                onChange(tab.id);
              }}
              className="flex flex-col items-center gap-0.5 px-6 py-1 relative btn-press"
            >
              <tab.icon active={isActive} />
              <span
                className="text-[10px] font-medium transition-colors duration-200"
                style={{ color: isActive ? '#FFD700' : '#6b7280' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
