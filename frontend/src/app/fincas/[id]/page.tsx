import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fincas, calState, fmtCOP } from '@/lib/data';
import DetailClient from './DetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return fincas.map((f) => ({ id: f.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const f = fincas.find((finca) => finca.id === id);
  if (!f) return {};
  return {
    title: f.name,
    description: `${f.tagline} — ${f.city}, ${f.dept}. Capacidad: ${f.capacity} personas. Desde ${fmtCOP(f.price)} / noche.`,
    openGraph: {
      title: `${f.name} | Rently`,
      description: f.tagline,
      images: [{ url: f.imageUrl, width: 800, height: 500, alt: f.name }],
      type: 'website',
    },
  };
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;
  const finca = fincas.find((f) => f.id === id);
  if (!finca) notFound();
  return <DetailClient finca={finca} calState={calState} />;
}
