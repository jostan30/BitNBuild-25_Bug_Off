'use client';

import React, { useEffect, useState } from 'react';

interface MapProps {
  lat: number;
  lng: number;
  venue: string;
  location: string;
  name: string;
}

const MapComponent: React.FC<MapProps> = ({ lat, lng, venue, location, name }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mapInstance: any = null;

    const loadMap = async () => {
      try {
        // Dynamically import leaflet
        const L = (await import('leaflet')).default;

        // Add Leaflet CSS if not already present
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
          document.head.appendChild(link);
        }

        // Fix default markers
        if (L.Icon && L.Icon.Default) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/leaflet/marker-icon-2x.png',
            iconUrl: '/leaflet/marker-icon.png',
            shadowUrl: '/leaflet/marker-shadow.png',
          });
        }

        const mapContainer = document.getElementById('event-map');
        if (!mapContainer) return;

        mapInstance = L.map(mapContainer, {
          center: [lat, lng],
          zoom: 15,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance);

        const marker = L.marker([lat, lng]).addTo(mapInstance)
          .bindPopup(`<b>${venue}</b><br>${location}<br>${name}`)
          .openPopup();

        setMapLoaded(true);
      } catch (err) {
        console.error('Error loading map:', err);
        setMapError(true);
        setMapLoaded(true);
      }
    };

    loadMap();

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [lat, lng, venue, location, name]);

  return (
    <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden mt-6">
      <div className="bg-gradient-to-br from-[#F4FFEE] to-[#CDBBB9] p-4">
        <h3 className="font-bold text-[#003447]">Event Location</h3>
        <p className="text-[#441111]">{venue}</p>
        <p className="text-[#441111]">{location}</p>
        <p className="text-xs text-[#49747F] mt-1">📍 {lat}, {lng}</p>
      </div>

      <div id="event-map" className="w-full h-64 md:h-80" style={{ background: '#f0f0f0' }} />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/70 rounded-2xl">
          <p className="text-[#003447] font-semibold">Loading map...</p>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-red-100/50 rounded-2xl">
          <p className="text-red-600 font-semibold">Map failed to load.</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
