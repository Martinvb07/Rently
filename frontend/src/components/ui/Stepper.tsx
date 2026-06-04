'use client';
import Icon from './Icon';

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

export default function Stepper({ value, min = 1, max = 99, onChange }: StepperProps) {
  return (
    <div className="flex items-center gap-[14px]">
      <button
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="menos"
        className="w-8 h-8 rounded-full border border-[#e2dcec] bg-white grid place-items-center text-lg font-bold text-[#6814ad] transition-all hover:border-[#8125E2] hover:bg-[#f6f1fe] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="minus" size={16} />
      </button>
      <span className="font-extrabold min-w-[22px] text-center">{value}</span>
      <button
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="más"
        className="w-8 h-8 rounded-full border border-[#e2dcec] bg-white grid place-items-center text-lg font-bold text-[#6814ad] transition-all hover:border-[#8125E2] hover:bg-[#f6f1fe] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
