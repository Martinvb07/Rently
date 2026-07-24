import FincasClient from './FincasClient';
import { fincas, cities } from '@/lib/data';

interface PageProps {
  searchParams: Promise<{
    ciudad?: string; checkin?: string; checkout?: string;
    huespedes?: string; adultos?: string; ninos?: string; bebes?: string;
  }>;
}

export default async function FincasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  /* Compat: si viene "huespedes" (total) sin desglose, se toma como adultos */
  const adultos = params.adultos ? Number(params.adultos)
    : params.huespedes ? Number(params.huespedes) : 0;
  return (
    <FincasClient
      fincas={fincas}
      cities={cities}
      initialCity={params.ciudad ?? 'todas'}
      initialCheckIn={params.checkin ?? ''}
      initialCheckOut={params.checkout ?? ''}
      initialAdults={adultos}
      initialChildren={params.ninos ? Number(params.ninos) : 0}
      initialBabies={params.bebes ? Number(params.bebes) : 0}
    />
  );
}
