'use client';

import React, { useEffect, useState } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

interface MapProps {
  lat: number;
  lng: number;
  venue: string;
  location: string;
  name: string;
}

// Extend HTMLElement to include Leaflet's _leaflet_id
interface LeafletContainer extends HTMLElement {
  _leaflet_id?: number;
}

const MapComponent: React.FC<MapProps> = ({ lat, lng, venue, location, name }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mapInstance: LeafletMap | null = null;

    const loadMap = async () => {
      try {
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
          const iconDefault = L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void };
          delete iconDefault._getIconUrl;

          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        }

        const mapContainer = document.getElementById('event-map') as LeafletContainer | null;
        if (!mapContainer) return;

        // Prevent multiple initializations
        if (mapContainer._leaflet_id) {
          setMapLoaded(true);
          return;
        }

        // Initialize the map
        mapInstance = L.map(mapContainer, {
          center: [lat, lng],
          zoom: 15,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapInstance);

        // Add marker with popup
        const marker: LeafletMarker = L.marker([lat, lng]).addTo(mapInstance)
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
    <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden mt-6 relative">
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
