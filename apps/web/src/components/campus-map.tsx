'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

const PLAKSHA_CENTER: [number, number] = [30.6717, 76.7311];

interface MarkerInput {
  id: string;
  publicCode?: string;
  title?: string | null;
  category?: string;
  priority?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function CampusMap({ incidents }: { incidents: MarkerInput[] }) {
  const markers = useMemo(
    () =>
      incidents.filter(
        (i): i is MarkerInput & { latitude: number; longitude: number } =>
          typeof i.latitude === 'number' && typeof i.longitude === 'number',
      ),
    [incidents],
  );

  return (
    <div className="h-[60vh] min-h-[420px] w-full">
      <MapContainer
        center={PLAKSHA_CENTER}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                {m.publicCode}
              </div>
              <div className="text-sm font-semibold">{m.title ?? m.category}</div>
              <div className="text-xs text-zinc-600">{m.priority}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
