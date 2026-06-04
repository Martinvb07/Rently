import type { CSSProperties } from 'react';

const PATHS: Record<string, React.ReactNode> = {
  pin: <><path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6" /><path d="M16.5 13.6A5.5 5.5 0 0 1 20.5 19" /></>,
  star: <path d="M12 3.5l2.6 5.3 5.9.86-4.25 4.14 1 5.87L12 17.9l-5.25 2.77 1-5.87L3.5 9.66l5.9-.86L12 3.5Z" />,
  heart: <path d="M12 20s-7-4.6-9.2-9.1C1.3 7.9 3 4.8 6.2 4.8c1.9 0 3.2 1.1 3.8 2.2.6-1.1 1.9-2.2 3.8-2.2 3.2 0 4.9 3.1 3.4 6.1C19 15.4 12 20 12 20Z" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" /></>,
  arrowR: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowL: <path d="M19 12H5m6 6-6-6 6-6" />,
  chevL: <path d="m15 6-6 6 6 6" />,
  chevR: <path d="m9 6 6 6-6 6" />,
  chevD: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.8 2.8L16 9" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  bed: <><path d="M3 8.5V19M3 13h18v6M21 13v-2.2a2.3 2.3 0 0 0-2.3-2.3H8.5A2.3 2.3 0 0 0 6.2 10.8V13" /></>,
  bath: <><path d="M4 12V6.5A2.5 2.5 0 0 1 8.6 5.2M4 12h16v2.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 14.5V12ZM7 19l-1 2m11-2 1 2" /><path d="M8.5 7.2 6.3 5" /></>,
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8 15.6a5.5 5.5 0 0 1 8 0" /><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" /></>,
  pool: <><path d="M3 18c1.6 0 1.6 1.3 3.2 1.3S7.8 18 9.4 18s1.6 1.3 3.2 1.3S14.2 18 15.8 18s1.6 1.3 3.2 1.3S20.6 18 22 18" /><path d="M7 17V6.5A2 2 0 0 1 9 4.5h.2M7 10h6M13 17V6.5a2 2 0 0 1 2-2h.2" /></>,
  bbq: <><path d="M5 9h14l-1.4 6.2A4 4 0 0 1 13.7 18.3h-3.4a4 4 0 0 1-3.9-3.1L5 9Z" /><path d="M9 21l1-3m4 3-1-3M12 4c-1 .8-1 1.6 0 2.4M9.5 5c-.6.5-.6 1 0 1.5M14.5 5c-.6.5-.6 1 0 1.5" /></>,
  parking: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><path d="M9.5 16V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" /></>,
  ac: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  river: <><path d="M3 8c2-1.5 3.5 1.5 5.5 0S12 6.5 14 8s3.5-.5 5.5-1M3 13c2-1.5 3.5 1.5 5.5 0S12 11.5 14 13s3.5-.5 5.5-1M3 18c2-1.5 3.5 1.5 5.5 0S12 16.5 14 18s3.5-.5 5.5-1" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  sparkle: <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3Z" />,
  dots: <><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" /></>,
  home: <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5" />,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></>,
  money: <><rect x="3" y="6" width="18" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.6" /><path d="M6.5 9v6M17.5 9v6" /></>,
  trendUp: <path d="M4 16l5-5 3.5 3.5L20 8m0 0h-4m4 0v4" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none" /></>,
  share: <><circle cx="6" cy="12" r="2.4" /><circle cx="17" cy="6" r="2.4" /><circle cx="17" cy="18" r="2.4" /><path d="m8.1 10.9 6.8-3.7m0 9.6-6.8-3.7" /></>,
  shield: <path d="M12 3.5 19 6v5.5c0 4.6-3.2 7.4-7 8.9-3.8-1.5-7-4.3-7-8.9V6l7-2.5Z" />,
  bell: <><path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 5 2 6 2 6H4.5s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  mountain: <path d="M3 19 9.5 7l4 6 2-3L21 19H3Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8L4 5Z" />,
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
  fill?: string;
}

export default function Icon({ name, size = 20, stroke = 1.85, style, className, fill = 'none' }: IconProps) {
  const p = PATHS[name];
  if (!p) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true"
    >
      {p}
    </svg>
  );
}
