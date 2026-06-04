import OwlMark from './OwlMark';

interface LogoProps {
  dark?: boolean;
  size?: number;
  onClick?: () => void;
  href?: string;
}

export default function Logo({ dark = false, size = 34, onClick, href }: LogoProps) {
  const inner = (
    <>
      <OwlMark size={size} head={dark ? '#fff' : '#8125E2'} cut={dark ? '#1a1424' : '#fff'} />
      <span className="font-extrabold text-[23px] tracking-tight" style={{ color: dark ? '#fff' : '#211b2e' }}>
        Rently
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="inline-flex items-center gap-[11px] cursor-pointer">
        {inner}
      </a>
    );
  }

  return (
    <div className="inline-flex items-center gap-[11px] cursor-pointer" onClick={onClick}>
      {inner}
    </div>
  );
}
