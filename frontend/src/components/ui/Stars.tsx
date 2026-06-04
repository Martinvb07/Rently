import Icon from './Icon';

interface StarsProps {
  value: number;
  reviews?: number;
  size?: number;
}

export default function Stars({ value, reviews, size = 15 }: StarsProps) {
  return (
    <span className="inline-flex items-center gap-[5px] font-bold text-[14px]">
      <Icon name="star" size={size} style={{ color: '#f0a728', fill: '#f0a728' }} stroke={0} />
      <b>{value}</b>
      {reviews != null && <span style={{ color: '#837c91', fontWeight: 600 }}>({reviews})</span>}
    </span>
  );
}
