'use client';
// src/components/ui/RingChart.tsx
import { useEffect, useState } from 'react';

interface Props {
  value: number;    // 0–100
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

export function RingChart({ value, size = 80, stroke = 7, label, sublabel }: Props) {
  const [animated, setAnimated] = useState(0);
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (animated / 100) * circ;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label    && <span className="text-white font-bold leading-none" style={{ fontSize: size * 0.22 }}>{label}</span>}
        {sublabel && <span className="text-[10px] text-[#a0a0a0] leading-none mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}
