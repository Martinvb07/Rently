import type { ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

type Variant = 'primary' | 'ghost' | 'outline' | 'soft';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconR?: string;
  block?: boolean;
}

const base = 'inline-flex items-center justify-center gap-[9px] font-bold text-[15px] rounded-[999px] transition-all duration-200 active:translate-y-px active:scale-99 whitespace-nowrap leading-none';

const variants: Record<Variant, string> = {
  primary: 'bg-[#8125E2] text-white shadow-[0_14px_34px_rgba(129,37,226,.32)] hover:bg-[#7720d1] hover:shadow-[0_18px_40px_rgba(129,37,226,.4)] hover:-translate-y-px',
  ghost: 'bg-white/[.16] text-white border border-white/50 backdrop-blur-sm hover:bg-white/[.28]',
  outline: 'bg-white text-[#211b2e] border border-[#e2dcec] shadow-[0_1px_2px_rgba(33,27,46,.06)] hover:border-[#c0a0f1] hover:text-[#6814ad]',
  soft: 'bg-[#ece1fb] text-[#6814ad] hover:bg-[#dcc8f8]',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-[9px] text-[13.5px]',
  md: 'px-[22px] py-[13px]',
  lg: 'px-7 py-4 text-[16px]',
};

export default function Button({ variant = 'primary', size = 'md', icon, iconR, block, children, className = '', disabled, ...rest }: ButtonProps) {
  const cls = [base, variants[variant], sizes[size], block ? 'w-full' : '', disabled ? 'opacity-50 cursor-not-allowed shadow-none translate-y-0' : '', className].filter(Boolean).join(' ');
  const icSize = size === 'lg' ? 19 : 17;
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {icon && <Icon name={icon} size={icSize} />}
      {children}
      {iconR && <Icon name={iconR} size={icSize} />}
    </button>
  );
}
