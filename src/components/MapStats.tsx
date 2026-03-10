'use client';
// src/components/MapStats.tsx
import { motion } from 'framer-motion';
import type { MapStatEntry } from '@/lib/types';

// Map display names and accent colors
const MAP_META: Record<string, { label: string; color: string; emoji: string }> = {
  mirage:     { label: 'Mirage',      color: '#E8B847', emoji: '🏜️' },
  dust2:      { label: 'Dust 2',      color: '#C8A06A', emoji: '🏛️' },
  inferno:    { label: 'Inferno',     color: '#E8622A', emoji: '🔥' },
  nuke:       { label: 'Nuke',        color: '#4FC3F7', emoji: '☢️' },
  vertigo:    { label: 'Vertigo',     color: '#78909C', emoji: '🏗️' },
  ancient:    { label: 'Ancient',     color: '#66BB6A', emoji: '🏺' },
  anubis:     { label: 'Anubis',      color: '#FFAB40', emoji: '🗿' },
  overpass:   { label: 'Overpass',    color: '#42A5F5', emoji: '🌉' },
  cache:      { label: 'Cache',       color: '#8D6E63', emoji: '🏭' },
  train:      { label: 'Train',       color: '#B0BEC5', emoji: '🚂' },
  cobblestone:{ label: 'Cobblestone', color: '#8D6E63', emoji: '🏰' },
};

function getMapMeta(name: string) {
  const key = name.toLowerCase().replace(/\s/g, '');
  return MAP_META[key] ?? { label: name, color: '#FFD700', emoji: '🗺️' };
}

interface Props {
  stats: MapStatEntry[];
  title?: string;
}

export function MapStats({ stats, title = 'Статистика по картам' }: Props) {
  if (!stats.length) {
    return (
      <div className="text-center py-8 text-[#5a5a5a] text-sm">
        Нет данных по картам
      </div>
    );
  }

  const sorted = [...stats].sort((a, b) => b.matches - a.matches);

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="space-y-2 px-4">
        {sorted.map((map, i) => {
          const meta = getMapMeta(map.mapName);
          const kda  = map.deaths > 0
            ? ((map.kills + map.assists * 0.5) / map.deaths).toFixed(2)
            : map.kills.toString();

          return (
            <motion.div
              key={map.mapName}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 30 }}
              className="rounded-xl p-3.5"
              style={{ background: 'var(--surface)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.emoji}</span>
                  <div>
                    <div className="font-semibold text-white text-sm leading-tight">{meta.label}</div>
                    <div className="text-[11px] text-[#6b7280]">{map.matches} матчей</div>
                  </div>
                </div>
                {/* Win rate badge */}
                <div
                  className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: map.winRate >= 50 ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)',
                    color: map.winRate >= 50 ? '#34C759' : '#FF3B30',
                  }}
                >
                  {map.winRate}% WR
                </div>
              </div>

              {/* Win bar */}
              <div className="progress-bar mb-2.5">
                <div
                  className="progress-fill"
                  style={{ width: `${map.winRate}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-0 text-[11px]">
                <StatPill label="W" value={map.wins.toString()} color="#34C759" />
                <span className="text-[#3a3a3a] mx-1">•</span>
                <StatPill label="L" value={map.losses.toString()} color="#FF3B30" />
                <span className="text-[#3a3a3a] mx-1">•</span>
                <StatPill label="KDA" value={kda} color={meta.color} />
                <span className="text-[#3a3a3a] mx-1">•</span>
                <StatPill label="AVG K" value={map.avgKills.toFixed(1)} color="#a0a0a0" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[#6b7280]">{label}</span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
