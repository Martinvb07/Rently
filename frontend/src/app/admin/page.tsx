import AdminClient from './AdminClient';
import { reservas } from '@/lib/data';

export default function AdminPage() {
  return <AdminClient initialReservas={reservas} />;
}
