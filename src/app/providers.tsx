'use client';
// src/app/providers.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { PlayerProfile, TelegramUser } from '@/lib/types';

interface AppCtx {
  player: PlayerProfile | null;
  tgUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const Ctx = createContext<AppCtx>({ player: null, tgUser: null, loading: true, error: null, refetch: () => {} });

export function useApp() { return useContext(Ctx); }

export function Providers({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [tgUser, setTgUser]  = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let initData = '';
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const wa = window.Telegram.WebApp;
        wa.ready();
        wa.expand();
        wa.setHeaderColor('#0d0d0d');
        wa.setBackgroundColor('#0d0d0d');
        initData = wa.initData;
      }

      if (!initData) {
        // Dev mode — expose a mock env var or skip auth
        setLoading(false);
        return;
      }

      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlayer(data.player);
        setTgUser(data.tgUser);
      } else if (res.status === 404) {
        setError('not_registered');
      } else {
        setError('auth_failed');
      }
    } catch {
      setError('network_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  return (
    <Ctx.Provider value={{ player, tgUser, loading, error, refetch: fetchMe }}>
      {children}
    </Ctx.Provider>
  );
}

// Extend window type
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: { user?: TelegramUser };
        ready: () => void;
        expand: () => void;
        close: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}
