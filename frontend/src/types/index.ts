export type SceneType = 'amanecer' | 'pradera' | 'atardecer' | 'rio';
export type FincaStatus = 'disponible' | 'ocupado';
export type ReservaStatus = 'pendiente' | 'confirmada' | 'cancelada';
export type AmenityKey = 'piscina' | 'bbq' | 'parqueadero' | 'wifi' | 'aire' | 'rio';

export interface Finca {
  id: string;
  name: string;
  sector: string;
  city: string;
  dept: string;
  capacity: number;
  bedrooms: number;
  baths: number;
  price: number;
  rating: number;
  reviews: number;
  status: FincaStatus;
  scene: SceneType;
  tagline: string;
  desc: string;
  amenities: AmenityKey[];
  imageUrl: string;
  galleryUrls?: string[];
  discount?: number;
}

export interface City {
  key: string;
  name: string;
  dept: string;
  scene: SceneType;
  count: number;
  imageUrl?: string;
}

export interface Reserva {
  id: string;
  guest: string;
  email: string;
  finca: string;
  city: string;
  inDate: string;
  outDate: string;
  nights: number;
  people: number;
  total: number;
  status: ReservaStatus;
}

export interface CalendarState {
  reserved: number[];
  blocked: number[];
}

export interface DateSel {
  start: Date | null;
  end: Date | null;
}
