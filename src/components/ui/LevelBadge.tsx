'use client';
// src/components/ui/LevelBadge.tsx

const LEVEL_COLORS: Record<number, { bg: string; text: string; glow?: string }> = {
  1:  { bg: '#2a2a2a', text: '#6b7280' },
  2:  { bg: '#2a2a2a', text: '#6b7280' },
  3:  { bg: '#1a2a1a', text: '#34C759' },
  4:  { bg: '#1a2a1a', text: '#34C759' },
  5:  { bg: '#2a2500', text: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
  6:  { bg: '#2a2500', text: '#FFD700', glow: 'rgba(255,215,0,0.3)' },
  7:  { bg: '#2a1a00', text: '#FF8C00', glow: 'rgba(255,140,0,0.3)' },
  8:  { bg: '#2a1a00', text: '#FF8C00', glow: 'rgba(255,140,0,0.3)' },
  9:  { bg: '#2a0a0a', text: '#FF3B30', glow: 'rgba(255,59,48,0.35)' },
  10: { bg: '#1a0000', text: '#FF0000', glow: 'rgba(255,0,0,0.4)' },
};

interface Props {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LevelBadge({ level, size = 'md', showLabel = false }: Props) {
  const lvl   = Math.max(1, Math.min(10, level));
  const style = LEVEL_COLORS[lvl];

  const dims = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-10 h-10 text-base',
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${dims} rounded flex items-center justify-center font-black shrink-0`}
        style={{
          background: style.bg,
          color: style.text,
          border: `1px solid ${style.text}40`,
          boxShadow: style.glow ? `0 0 10px ${style.glow}` : 'none',
        }}
      >
        {lvl}
      </div>
      {showLabel && (
        <span className="text-xs font-medium" style={{ color: style.text }}>
          Уровень {lvl}
        </span>
      )}
    </div>
  );
}

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[Math.max(1, Math.min(10, level))]?.text ?? '#6b7280';
}
