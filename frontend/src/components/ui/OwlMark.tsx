interface OwlMarkProps {
  size?: number;
  head?: string;
  cut?: string;
}

export default function OwlMark({ size = 34, head = '#8125E2', cut = '#fff' }: OwlMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Rently">
      <circle cx="24" cy="22" r="16" fill={head} />
      <path d="M18 34 L24 45 L30 33 Z" fill={head} />
      <circle cx="17.5" cy="20" r="5.4" fill={cut} />
      <circle cx="30.5" cy="20" r="5.4" fill={cut} />
      <path d="M12.1 20a5.4 5.4 0 0 1 10.8 0z" fill={head} />
      <path d="M25.1 20a5.4 5.4 0 0 1 10.8 0z" fill={head} />
      <path d="M21 24.5 L27 24.5 L24 30 Z" fill={cut} />
    </svg>
  );
}
