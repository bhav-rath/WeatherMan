'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Place } from '@/lib/types';

export default function PlacesMap({ center, places }: { center: { lat: number; lon: number }; places: Place[] }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: any, dead = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (dead || !el.current) return;
      map = L.map(el.current).setView([center.lat, center.lon], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
      const pts: [number, number][] = [];
      places.forEach((p) => {
        const b = document.createElement('b'); b.textContent = p.title;
        L.circleMarker([p.lat, p.lon], { radius: 8, color: '#0F2A3D', fillColor: '#F4A300', fillOpacity: 0.95, weight: 2 }).addTo(map).bindPopup(b);
        pts.push([p.lat, p.lon]);
      });
      if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30] });
    })();
    return () => { dead = true; map?.remove(); };
  }, [center.lat, center.lon, places]);
  return <div ref={el} className="h-80 w-full rounded-xl" role="application" aria-label="Map of places to visit" />;
}
