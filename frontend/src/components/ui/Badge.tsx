import type { ReservaStatus, FincaStatus } from '@/types';

type Status = FincaStatus | ReservaStatus;

const STATUS_MAP: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  disponible: { bg: '#e7f6ec', text: '#157a42', dot: '#1f9d57', label: 'Disponible' },
  ocupado:    { bg: '#fbe7e2', text: '#dd4f38', dot: '#dd4f38', label: 'Ocupado' },
  pendiente:  { bg: '#fbf1da', text: '#bf7d10', dot: '#bf7d10', label: 'Pendiente' },
  confirmada: { bg: '#e7f6ec', text: '#157a42', dot: '#1f9d57', label: 'Confirmada' },
  cancelada:  { bg: '#fbe7e2', text: '#dd4f38', dot: '#dd4f38', label: 'Cancelada' },
};

interface BadgeProps {
  status: Status;
  dot?: boolean;
}

export default function Badge({ status, dot = true }: BadgeProps) {
  const m = STATUS_MAP[status] ?? { bg: '#f0eef4', text: '#4c4559', dot: '#837c91', label: status };
  return (
    <span
      className="inline-flex items-center gap-[6px] font-bold text-[12.5px] px-[11px] py-[5px] rounded-full leading-none"
      style={{ background: m.bg, color: m.text }}
    >
      {dot && <span className="w-[7px] h-[7px] rounded-full" style={{ background: m.dot }} />}
      {m.label}
    </span>
  );
}
