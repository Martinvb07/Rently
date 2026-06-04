import Link from 'next/link';
import Image from 'next/image';
import type { City } from '@/types';

interface CityCardProps {
  city: City;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <Link
      href={`/fincas?ciudad=${city.key}`}
      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block group"
      style={{ aspectRatio: '4/3' }}
    >
      {city.imageUrl ? (
        <Image
          src={city.imageUrl}
          alt={city.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute left-0 right-0 bottom-0 p-5 text-white">
        <p className="text-[20px] font-extrabold leading-tight">{city.name}</p>
        <p className="text-[13px] font-medium text-white/80 mt-1">
          {city.dept} · {city.count} {city.count === 1 ? 'finca' : 'fincas'}
        </p>
      </div>
    </Link>
  );
}
