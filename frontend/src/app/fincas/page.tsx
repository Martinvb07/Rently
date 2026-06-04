import FincasClient from './FincasClient';
import { fincas, cities } from '@/lib/data';

interface PageProps {
  searchParams: Promise<{ ciudad?: string }>;
}

export default async function FincasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <FincasClient fincas={fincas} cities={cities} initialCity={params.ciudad ?? 'todas'} />;
}
