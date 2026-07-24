/* Ilustraciones SVG propias por ciudad — estilo "landmark" tipo Airbnb, pero
   con motivos colombianos. Cada glifo usa una línea de color sólido sobre un
   relleno tenue del mismo tono, para leerse bien dentro de su tile redondeado. */
import type { CSSProperties } from 'react';

type Glyph = (c: string) => React.ReactNode;

/* stroke = color de marca de la ciudad; fill suave = mismo color al 18% aprox. */
const GLYPHS: Record<string, Glyph> = {
  /* Acacías — palma llanera y sol sobre el piedemonte */
  acacias: (c) => (
    <>
      <circle cx="33" cy="15" r="5" fill={c} opacity=".25" />
      <path d="M20 40c0-9 1-16 2-22" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 17c-4-2-8-1-11 2m11-2c4-2 9-1 12 3m-12-3c-2-4-1-8 1-11m-1 11c3-3 7-4 11-3" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 40h32" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  /* Villavicencio — cordillera, la puerta al llano */
  villavicencio: (c) => (
    <>
      <path d="M6 34 18 16l7 10 5-7 10 15z" fill={c} opacity=".2" />
      <path d="M6 34 18 16l7 10 5-7 10 15" stroke={c} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M15 20.5l3 2.6 2.4-1.8" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 34h34" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  /* Melgar — sol de tierra caliente sobre agua de piscina */
  melgar: (c) => (
    <>
      <circle cx="24" cy="17" r="6.5" fill={c} opacity=".25" />
      <circle cx="24" cy="17" r="6.5" stroke={c} strokeWidth="2.2" />
      <path d="M24 6v3m0 16v3m-11-14h3m16 0h3M16 9l2 2m12-2-2 2M16 25l2-2m12 2-2-2" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M7 33c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 39c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2 2.5 2 5 2 2.5-2 5-2" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  /* Anapoima — el eterno sol, rayos plenos */
  anapoima: (c) => (
    <>
      <circle cx="24" cy="24" r="8" fill={c} opacity=".25" />
      <circle cx="24" cy="24" r="8" stroke={c} strokeWidth="2.4" />
      <path d="M24 6v5m0 26v5M6 24h5m26 0h5M11 11l3.5 3.5m19 19L37 37M37 11l-3.5 3.5m-19 19L11 37" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
  /* Santa Fe de Antioquia — torre colonial (pueblo patrimonio) */
  santafe: (c) => (
    <>
      <path d="M24 6l4 5v3h-8v-3z" fill={c} opacity=".25" />
      <path d="M24 6l4 5v3h-8v-3z" stroke={c} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M18 40V17h12v23" fill={c} opacity=".18" />
      <path d="M18 40V17h12v23" stroke={c} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M21 40v-6a3 3 0 0 1 6 0v6" stroke={c} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 22h4M24 6v-2" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 40h24" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  /* Salento — palma de cera del Cocora entre montañas */
  salento: (c) => (
    <>
      <path d="M8 40 20 20l6 9 4-6 10 17z" fill={c} opacity=".18" />
      <path d="M8 40 20 20l6 9 4-6 10 17" stroke={c} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M30 40V16" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M30 16c-3-2-6-1.5-8.5.8M30 16c3-2 6.5-1.5 9 1M30 16c-1.5-3-1-6.5 1-8.5M30 16c2-2.5 5.5-3 8.5-2" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 40h34" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
};

interface CityGlyphProps {
  city: string;
  color: string;
  size?: number;
  style?: CSSProperties;
}

export default function CityGlyph({ city, color, size = 26, style }: CityGlyphProps) {
  const glyph = GLYPHS[city];
  if (!glyph) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style} aria-hidden="true">
      {glyph(color)}
    </svg>
  );
}
