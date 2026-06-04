import type { Finca, City, Reserva, CalendarState } from '@/types';

const PIC = (seed: string, w = 800, h = 500) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const fincas: Finca[] = [
  {
    id: 'piedemonte', name: 'Finca El Piedemonte',
    sector: 'Vereda San Cristóbal', city: 'Acacías', dept: 'Meta',
    capacity: 12, bedrooms: 4, baths: 3, price: 680000, rating: 4.9, reviews: 87,
    status: 'disponible', scene: 'amanecer',
    tagline: 'Piscina, asador y vista al piedemonte llanero',
    desc: 'A 10 minutos del centro de Acacías, El Piedemonte es una finca de descanso rodeada de palmas y morichales. Amplias zonas verdes, kiosko con asador llanero y piscina con vista a la cordillera. Ideal para reuniones familiares y planes de fin de semana en el Meta.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire', 'rio'],
    imageUrl: PIC('finca-llanera', 800, 500),
    galleryUrls: [PIC('finca-llanera', 1200, 700), PIC('piscina-llanera', 400, 300), PIC('rio-meta', 400, 300), PIC('kiosko', 400, 300), PIC('finca-noche', 400, 300)],
  },
  {
    id: 'tamarindo', name: 'Quinta El Tamarindo',
    sector: 'Vía Carmen de Apicalá', city: 'Melgar', dept: 'Tolima',
    capacity: 14, bedrooms: 4, baths: 4, price: 750000, rating: 4.88, reviews: 119,
    status: 'disponible', scene: 'pradera',
    tagline: 'Clásico plan de piscina en tierra caliente',
    desc: 'Melgar en su máxima expresión: piscina amplia con jacuzzi, zona de hamacas y palmeras por todos lados. Quinta El Tamarindo es perfecta para grupos que buscan sol, calor y descanso a solo dos horas de Bogotá.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire'],
    imageUrl: PIC('piscina-palmas', 800, 500),
    galleryUrls: [PIC('piscina-palmas', 1200, 700), PIC('hamacas', 400, 300), PIC('jacuzzi', 400, 300), PIC('terraza-melgar', 400, 300), PIC('bbq-tolima', 400, 300)],
  },
  {
    id: 'anapoima', name: 'Finca Sol de Anapoima',
    sector: 'Vereda La Paz', city: 'Anapoima', dept: 'Cundinamarca',
    capacity: 10, bedrooms: 3, baths: 3, price: 640000, rating: 4.86, reviews: 64,
    status: 'disponible', scene: 'atardecer',
    tagline: 'El mejor clima de Colombia, todo el año',
    desc: "En la 'ciudad del eterno sol', Sol de Anapoima ofrece un clima privilegiado de 28°C constantes. Piscina infinita con vista al valle, terrazas amplias y atardeceres inolvidables. El escape ideal cerca de Bogotá.",
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire', 'rio'],
    imageUrl: PIC('finca-atardecer', 800, 500),
    galleryUrls: [PIC('finca-atardecer', 1200, 700), PIC('piscina-infinita', 400, 300), PIC('terraza-valle', 400, 300), PIC('vista-cundinamarca', 400, 300), PIC('sunset-finca', 400, 300)],
  },
  {
    id: 'cafe-niebla', name: 'Finca Café & Niebla',
    sector: 'Vereda Cocora', city: 'Salento', dept: 'Quindío',
    capacity: 8, bedrooms: 3, baths: 2, price: 590000, rating: 4.95, reviews: 142,
    status: 'disponible', scene: 'rio',
    tagline: 'Cultura cafetera entre montañas y neblina',
    desc: 'En el corazón del Eje Cafetero, rodeada de palmas de cera del Valle del Cocora. Café & Niebla combina una casa tradicional cafetera con chimenea, miradores y tour de café propio. Mañanas frescas y verdes infinitos.',
    amenities: ['bbq', 'parqueadero', 'wifi', 'rio'],
    imageUrl: PIC('eje-cafetero', 800, 500),
    galleryUrls: [PIC('eje-cafetero', 1200, 700), PIC('cafe-palmas', 400, 300), PIC('cocora', 400, 300), PIC('chimenea', 400, 300), PIC('niebla-quindio', 400, 300)],
  },
  {
    id: 'palmeras', name: 'Hacienda Las Palmeras',
    sector: 'Vía Restrepo', city: 'Villavicencio', dept: 'Meta',
    capacity: 20, bedrooms: 6, baths: 5, price: 1150000, rating: 4.92, reviews: 132,
    status: 'ocupado', scene: 'atardecer',
    tagline: 'Hacienda ganadera para grandes celebraciones',
    desc: 'Una hacienda llanera de tradición con corredores amplios, hamacas y caballerizas. Capacidad para eventos de hasta 20 huéspedes con salón social, dos piscinas y cancha múltiple.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire', 'rio'],
    imageUrl: PIC('hacienda-llanera', 800, 500),
    galleryUrls: [PIC('hacienda-llanera', 1200, 700), PIC('salon-hacienda', 400, 300), PIC('caballeriza', 400, 300), PIC('piscina-hacienda', 400, 300), PIC('noche-llano', 400, 300)],
  },
  {
    id: 'santafe', name: 'Hacienda La Esperanza',
    sector: 'Vía al río Tonusco', city: 'Santa Fe de Antioquia', dept: 'Antioquia',
    capacity: 16, bedrooms: 5, baths: 4, price: 880000, rating: 4.84, reviews: 91,
    status: 'disponible', scene: 'amanecer',
    tagline: 'Casona colonial con piscina y mucha historia',
    desc: 'A una hora de Medellín, esta casona de arquitectura colonial mezcla patios empedrados, corredores con arcos y una piscina rodeada de buganviles. Calor antioqueño, pueblo patrimonio y descanso de lujo.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire'],
    imageUrl: PIC('casona-colonial', 800, 500),
    galleryUrls: [PIC('casona-colonial', 1200, 700), PIC('patio-colonial', 400, 300), PIC('corredor-arcos', 400, 300), PIC('piscina-buganviles', 400, 300), PIC('pueblo-antioquia', 400, 300)],
  },
  {
    id: 'villa-acacia', name: 'Villa Acacía',
    sector: 'Sector centro', city: 'Acacías', dept: 'Meta',
    capacity: 8, bedrooms: 3, baths: 2, price: 520000, rating: 4.8, reviews: 54,
    status: 'disponible', scene: 'pradera',
    tagline: 'Casa campestre a pasos del parque principal',
    desc: 'Comodidad campestre sin alejarte de la ciudad. Villa Acacía combina jardines tropicales con espacios frescos y bien ventilados. Perfecta para grupos que quieren piscina de día y la vida del pueblo de noche.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire'],
    imageUrl: PIC('villa-campestre', 800, 500),
    galleryUrls: [PIC('villa-campestre', 1200, 700), PIC('jardin-tropical', 400, 300), PIC('piscina-villa', 400, 300), PIC('terraza-villa', 400, 300), PIC('habitacion-villa', 400, 300)],
  },
  {
    id: 'hato-llanero', name: 'El Hato Llanero',
    sector: 'Vía Puerto López', city: 'Villavicencio', dept: 'Meta',
    capacity: 16, bedrooms: 5, baths: 4, price: 920000, rating: 4.85, reviews: 96,
    status: 'ocupado', scene: 'pradera',
    tagline: 'Auténtica experiencia llanera con cabalgatas',
    desc: 'Vive el llano de verdad: cabalgatas al amanecer, mamona a la llanera y noches de joropo. El Hato Llanero ofrece alojamiento amplio con kiosko principal, piscina y zona de fogata bajo las estrellas.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'aire', 'rio'],
    imageUrl: PIC('llano-cabalgata', 800, 500),
    galleryUrls: [PIC('llano-cabalgata', 1200, 700), PIC('caballos-llano', 400, 300), PIC('fogata-llano', 400, 300), PIC('kiosko-llano', 400, 300), PIC('amanecer-meta', 400, 300)],
  },
  {
    id: 'acaciitas', name: 'Finca Río Acaciítas',
    sector: 'Vereda Las Margaritas', city: 'Acacías', dept: 'Meta',
    capacity: 6, bedrooms: 2, baths: 2, price: 390000, rating: 4.7, reviews: 41,
    status: 'disponible', scene: 'rio',
    tagline: 'Refugio íntimo a orillas del río Acaciítas',
    desc: 'Un plan tranquilo para parejas y familias pequeñas. Acceso directo a una playita del río Acaciítas, charcos cristalinos y mucha sombra de árboles nativos.',
    amenities: ['bbq', 'parqueadero', 'wifi', 'rio'],
    imageUrl: PIC('rio-acacias', 800, 500),
    galleryUrls: [PIC('rio-acacias', 1200, 700), PIC('charco-cristalino', 400, 300), PIC('playa-rio', 400, 300), PIC('sombra-arboles', 400, 300), PIC('finca-pequena', 400, 300)],
  },
  {
    id: 'cascada', name: 'Finca La Cascada',
    sector: 'Vereda El Salado', city: 'Melgar', dept: 'Tolima',
    capacity: 10, bedrooms: 3, baths: 3, price: 610000, rating: 4.88, reviews: 73,
    status: 'disponible', scene: 'rio',
    tagline: 'Cascada natural privada y senderos ecológicos',
    desc: 'En la parte alta de Melgar, La Cascada regala una caída de agua privada y senderos entre bosque. Clima cálido de día, noches frescas y todas las comodidades para un fin de semana de reconexión.',
    amenities: ['piscina', 'bbq', 'parqueadero', 'wifi', 'aire', 'rio'],
    imageUrl: PIC('cascada-melgar', 800, 500),
    galleryUrls: [PIC('cascada-melgar', 1200, 700), PIC('sendero-bosque', 400, 300), PIC('cascada-privada', 400, 300), PIC('piscina-cascada', 400, 300), PIC('bosque-tolima', 400, 300)],
  },
];

const _cities = [
  { key: 'acacias', name: 'Acacías', dept: 'Meta', scene: 'amanecer' as const, count: 0, imageUrl: PIC('acacias-llanos', 600, 480) },
  { key: 'villavicencio', name: 'Villavicencio', dept: 'Meta', scene: 'pradera' as const, count: 0, imageUrl: PIC('villavicencio-meta', 600, 480) },
  { key: 'melgar', name: 'Melgar', dept: 'Tolima', scene: 'pradera' as const, count: 0, imageUrl: PIC('melgar-piscinas', 600, 480) },
  { key: 'anapoima', name: 'Anapoima', dept: 'Cundinamarca', scene: 'atardecer' as const, count: 0, imageUrl: PIC('anapoima-sol', 600, 480) },
  { key: 'santafe', name: 'Santa Fe de Antioquia', dept: 'Antioquia', scene: 'amanecer' as const, count: 0, imageUrl: PIC('santafe-antioquia', 600, 480) },
  { key: 'salento', name: 'Salento', dept: 'Quindío', scene: 'rio' as const, count: 0, imageUrl: PIC('salento-cocora', 600, 480) },
];

export type CityWithImage = (typeof _cities)[0];

export const cities: (CityWithImage & { count: number })[] = _cities.map((c) => ({
  ...c,
  count: fincas.filter((f) => f.city === c.name).length,
}));

export const reservas: Reserva[] = [
  { id: 'RT-2041', guest: 'María Camila Rojas', email: 'mc.rojas@gmail.com', finca: 'Finca El Piedemonte', city: 'Acacías, Meta', inDate: '12 jun', outDate: '15 jun', nights: 3, people: 10, total: 2040000, status: 'confirmada' },
  { id: 'RT-2040', guest: 'Andrés Felipe Gómez', email: 'afgomez@hotmail.com', finca: 'Quinta El Tamarindo', city: 'Melgar, Tolima', inDate: '13 jun', outDate: '16 jun', nights: 3, people: 12, total: 2250000, status: 'pendiente' },
  { id: 'RT-2039', guest: 'Laura Vanegas', email: 'lvanegas@outlook.com', finca: 'Finca Sol de Anapoima', city: 'Anapoima, Cund.', inDate: '14 jun', outDate: '17 jun', nights: 3, people: 8, total: 1920000, status: 'confirmada' },
  { id: 'RT-2038', guest: 'Juan David Pérez', email: 'jdperez@gmail.com', finca: 'Hacienda Las Palmeras', city: 'Villavicencio, Meta', inDate: '20 jun', outDate: '23 jun', nights: 3, people: 18, total: 3450000, status: 'pendiente' },
  { id: 'RT-2037', guest: 'Daniela Ortiz', email: 'dani.ortiz@gmail.com', finca: 'Finca Café & Niebla', city: 'Salento, Quindío', inDate: '06 jun', outDate: '08 jun', nights: 2, people: 7, total: 1180000, status: 'cancelada' },
  { id: 'RT-2036', guest: 'Sebastián Mora', email: 'smora@gmail.com', finca: 'Hacienda La Esperanza', city: 'Santa Fe, Ant.', inDate: '21 jun', outDate: '24 jun', nights: 3, people: 14, total: 2640000, status: 'confirmada' },
  { id: 'RT-2035', guest: 'Valentina Suárez', email: 'vsuarez@yahoo.com', finca: 'Finca El Piedemonte', city: 'Acacías, Meta', inDate: '27 jun', outDate: '30 jun', nights: 3, people: 12, total: 2040000, status: 'pendiente' },
  { id: 'RT-2034', guest: 'Carlos Méndez', email: 'cmendez@gmail.com', finca: 'Finca La Cascada', city: 'Melgar, Tolima', inDate: '04 jul', outDate: '06 jul', nights: 2, people: 9, total: 1220000, status: 'confirmada' },
];

export const calState: CalendarState = {
  reserved: [6, 7, 8, 13, 14, 15, 20, 21, 22, 27, 28],
  blocked: [1, 2, 17, 18],
};

export function fmtCOP(n: number): string {
  return '$' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
