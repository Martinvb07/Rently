const COLORS = ['#8125E2', '#1f9d57', '#bf7d10', '#2b86c5', '#dd4f38', '#7720d1'];

interface AvatarProps {
  name: string;
  size?: number;
}

export default function Avatar({ name, size = 38 }: AvatarProps) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const color = COLORS[name.length % COLORS.length];
  return (
    <span
      className="rounded-full grid place-items-center font-extrabold text-white flex-none"
      style={{ width: size, height: size, background: color, fontSize: size * 0.37 }}
    >
      {initials}
    </span>
  );
}
