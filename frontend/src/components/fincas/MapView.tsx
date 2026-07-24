'use client';
import { useEffect, useRef } from 'react';
import type { Finca } from '@/types';
import Link from 'next/link';
import { fmtCOP } from '@/lib/data';

const CITY_COORDS: Record<string, [number, number]> = {
  'Acacías':                [3.9876, -73.7534],
  'Villavicencio':          [4.1420, -73.6266],
  'Melgar':                 [4.2053, -74.6450],
  'Anapoima':               [4.5500, -74.5419],
  'Santa Fe de Antioquia':  [6.5566, -75.8257],
  'Salento':                [4.6388, -75.5714],
};

interface MapViewProps {
  fincas: Finca[];
  noPopup?: boolean;
}

export default function MapView({ fincas, noPopup = false }: MapViewProps) {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapInst   = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;
    let L: typeof import('leaflet');

    import('leaflet').then((leaflet) => {
      L = leaflet.default;

      // Guard: if container already has a leaflet instance, skip
      const container = mapRef.current!;
      if ((container as unknown as { _leaflet_id?: number })._leaflet_id) return;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(container, {
        center: [4.8, -74.0],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom purple marker icon
      const makeIcon = (count: number) => L.divIcon({
        className: '',
        html: `<div style="
          background: #8125E2;
          color: white;
          width: 34px; height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(129,37,226,.4);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-weight: 800; font-size: 12px;">${count}</span>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -36],
      });

      // Group by city
      const byCityKey: Record<string, Finca[]> = {};
      fincas.forEach((f) => {
        if (!byCityKey[f.city]) byCityKey[f.city] = [];
        byCityKey[f.city].push(f);
      });

      Object.entries(byCityKey).forEach(([city, farms]) => {
        const coords = CITY_COORDS[city];
        if (!coords) return;

        const popupHtml = farms.map(f => `
          <a href="/fincas/${f.id}" style="display:block; padding:8px 0; border-bottom:1px solid #f0f0f0; text-decoration:none; color:inherit;">
            <b style="font-size:13px;color:#211b2e;">${f.name}</b>
            <span style="display:block;font-size:11px;color:#837c91;margin-top:2px;">${fmtCOP(f.price)} / noche</span>
          </a>
        `).join('');

        const marker = L.marker(coords, { icon: makeIcon(farms.length) }).addTo(map);
        if (!noPopup) {
          marker.bindPopup(`
            <div style="min-width:200px;font-family:'Plus Jakarta Sans',sans-serif;">
              <b style="font-size:14px;color:#211b2e;display:block;margin-bottom:6px;">${city}</b>
              ${popupHtml}
            </div>
          `, { maxWidth: 260 });
        }
      });

      mapInst.current = map;
    });

    return () => {
      if (mapInst.current) {
        (mapInst.current as { remove: () => void }).remove();
        mapInst.current = null;
      }
    };
  }, [fincas]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </>
  );
}
