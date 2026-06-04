import Link from 'next/link';
import OwlMark from '@/components/ui/OwlMark';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center" style={{ paddingTop: 74 }}>
      <OwlMark size={72} head="#8125E2" cut="#fff" />
      <h1 className="text-[80px] font-extrabold text-gray-900 tracking-tight leading-none mt-6">404</h1>
      <p className="text-[20px] font-bold text-gray-700 mt-3">Página no encontrada</p>
      <p className="text-gray-400 text-[15px] mt-2 max-w-[360px] leading-relaxed">
        La página que buscas no existe o fue movida. Vuelve al inicio para explorar las fincas.
      </p>
      <div className="flex items-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#8125E2] text-white px-6 py-3 rounded-xl font-bold text-[14px] hover:bg-[#7720d1] transition-colors"
          style={{ boxShadow: '0 6px 20px rgba(129,37,226,.3)' }}
        >
          Volver al inicio
        </Link>
        <Link
          href="/fincas"
          className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold text-[14px] hover:border-[#8125E2] hover:text-[#8125E2] transition-all"
        >
          Ver fincas
        </Link>
      </div>
    </div>
  );
}
