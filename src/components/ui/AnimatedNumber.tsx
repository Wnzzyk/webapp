'use client';
// src/components/ui/AnimatedNumber.tsx
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  suffix?: string;
}

export function AnimatedNumber({ value, duration = 900, decimals = 0, className, suffix = '' }: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);
  const fromRef  = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to   = value;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // iOS spring-like easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      else { setDisplay(to); fromRef.current = to; }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString('ru-RU');

  return <span className={className}>{formatted}{suffix}</span>;
}
