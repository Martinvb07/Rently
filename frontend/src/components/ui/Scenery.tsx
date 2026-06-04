'use client';
import { useMemo } from 'react';
import type { SceneType } from '@/types';
import Icon from './Icon';

interface Palette {
  sky: string[];
  sun: string;
  hills: string[];
  water: string[] | null;
  birds: boolean;
}

const PALETTES: Record<SceneType, Palette> = {
  amanecer: { sky: ['#ffe7c2', '#ffd2a0', '#f3b78c'], sun: '#ffce82', hills: ['#86b074', '#578256', '#3b6245'], water: null, birds: true },
  pradera:  { sky: ['#d3ecff', '#ecf7ff'], sun: '#fff0bd', hills: ['#9ccc7f', '#65a256', '#427745'], water: null, birds: true },
  atardecer:{ sky: ['#f8c489', '#ec8197', '#8155ad'], sun: '#ff9a64', hills: ['#5d5e72', '#41415a', '#2c2c41'], water: null, birds: false },
  rio:      { sky: ['#d8f0ff', '#f1fbff'], sun: '#fff3c8', hills: ['#94c873', '#5c934d'], water: ['#74b9e0', '#a6d8ef'], birds: true },
};

interface SceneryProps {
  scene?: SceneType;
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function Scenery({ scene = 'pradera', label, style, className = '' }: SceneryProps) {
  const uid = useMemo(() => 'sc' + Math.random().toString(36).slice(2, 8), []);
  const p = PALETTES[scene] ?? PALETTES.pradera;

  return (
    <div className={`relative overflow-hidden bg-[#dfe7e0] ${className}`} style={style}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            {p.sky.map((c, i) => (
              <stop key={i} offset={`${(i / Math.max(p.sky.length - 1, 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
          {p.water && (
            <linearGradient id={`${uid}-water`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.water[0]} />
              <stop offset="100%" stopColor={p.water[1]} />
            </linearGradient>
          )}
          <radialGradient id={`${uid}-sun`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={p.sun} />
            <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#${uid}-sky)`} />
        <circle cx="300" cy="78" r="46" fill={`url(#${uid}-sun)`} />
        <circle cx="300" cy="78" r="22" fill={p.sun} opacity="0.95" />
        {p.birds && (
          <g stroke="rgba(60,60,80,.4)" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M70 70 q5 -5 10 0 q5 -5 10 0" />
            <path d="M104 84 q4 -4 8 0 q4 -4 8 0" />
          </g>
        )}
        <path d="M0 205 Q90 160 200 188 T400 178 L400 300 L0 300 Z" fill={p.hills[0]} />
        <path d="M0 235 Q120 200 240 228 T400 220 L400 300 L0 300 Z" fill={p.hills[1]} />
        {p.water ? (
          <>
            <path d="M0 250 Q110 232 230 250 T400 246 L400 300 L0 300 Z" fill={p.hills[1]} />
            <path d="M0 268 Q160 256 400 270 L400 300 L0 300 Z" fill={`url(#${uid}-water)`} />
          </>
        ) : (
          <path d="M0 258 Q140 234 270 256 T400 250 L400 300 L0 300 Z" fill={p.hills[2] ?? p.hills[1]} />
        )}
      </svg>
      {label && (
        <span className="absolute left-3 bottom-3 inline-flex items-center gap-[6px] font-mono text-[10.5px] tracking-wide bg-[rgba(33,27,46,.42)] text-[rgba(255,255,255,.92)] px-[9px] py-1 rounded-md backdrop-blur-sm">
          <Icon name="mountain" size={11} stroke={2} /> {label}
        </span>
      )}
    </div>
  );
}
