'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Circle } from '@react-google-maps/api';
import type { FoodTruck } from '@/lib/types';
import Image from 'next/image';
import { LocateFixed, Loader2, Star } from 'lucide-react';

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#181a1b" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#181a1b" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#a7fffa" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#e0fbfc" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#e0fbfc" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#233542" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#a7fffa" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#262f36" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#0ff4c6" }, { "weight": 0.2 }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#94a3b8" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#f72585" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#c77dff" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#ffb4a2" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#354f52" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#264653" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#a7fffa" }]
  }
];

const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '1.5rem',
  boxShadow: '0 4px 32px 0 #00d8ff33',
  overflow: 'hidden',
  border: '2px solid #23234f',
  margin: '0 auto'
};

const defaultCenter = { lat: -34.9285, lng: 138.6007 };

type Props = { trucks: FoodTruck[] };

// SVGs for markers (as crisp data:uris)
const openTruckSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 46" width="38" height="46"><ellipse cx="19" cy="36" rx="15" ry="7" fill="%2300fff7" fill-opacity="0.16"/><rect x="6" y="14" width="26" height="14" rx="4" fill="%2300FFAB" stroke="%2300eaff" stroke-width="2"/><rect x="14" y="8" width="10" height="6" rx="2" fill="%2300eaff"/><circle cx="12" cy="32" r="3" fill="white" stroke="%2300eaff" stroke-width="2"/><circle cx="26" cy="32" r="3" fill="white" stroke="%2300eaff" stroke-width="2"/></svg>`;
const closedTruckSVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 46" width="38" height="46"><ellipse cx="19" cy="36" rx="15" ry="7" fill="%23ff4d6d" fill-opacity="0.10"/><rect x="6" y="14" width="26" height="14" rx="4" fill="%23FF4D6D" stroke="%23c77dff" stroke-width="2"/><rect x="14" y="8" width="10" height="6" rx="2" fill="%23c77dff"/><circle cx="12" cy="32" r="3" fill="white" stroke="%23ff4d6d" stroke-width="2"/><circle cx="26" cy="32" r="3" fill="white" stroke="%23ff4d6d" stroke-width="2"/></svg>`;
const userSVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><circle cx='18' cy='18' r='15' fill='%2300eaff' fill-opacity='0.35'/><circle cx='18' cy='18' r='8' fill='%2300eaff' stroke='white' stroke-width='2'/></svg>`;

function GlassCard({
  truck,
  onClose,
}: {
  truck: FoodTruck;
  onClose: () => void;
}) {
  return (
    <div
      className="backdrop-blur-2xl bg-[#191a1cdd] border border-cyan-300/40 rounded-xl shadow-2xl p-3 max-w-[290px] min-w-[220px] animate-in fade-in relative"
      tabIndex={0}
      aria-label={`${truck.name} details`}
      style={{ boxShadow: '0 4px 32px #00eaff33, 0 2px 8px #0ff4  ' }}
    >
      <button
        className="absolute top-2 right-2 text-cyan-200 hover:text-cyan-100 text-2xl bg-transparent border-0 p-0"
        aria-label="Close"
        tabIndex={0}
        onClick={onClose}
        style={{ fontWeight: 800, fontSize: 20, cursor: "pointer" }}
      >
        ×
      </button>
      <div className="flex items-center gap-2 mb-1">
        <Image
          src={truck.imageUrl || '/fallback-truck.jpg'}
          width={42}
          height={42}
          alt={truck.name}
          className="rounded-lg object-cover border"
        />
        <div className="flex-1">
          <div className="font-bold text-lg flex items-center gap-2 text-cyan-300">
            {truck.name}
            {truck.isOpen && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-cyan-300/20 text-cyan-300 rounded inline-flex items-center font-semibold">
                ● Open
              </span>
            )}
          </div>
          <div className="text-xs text-cyan-100/80">{truck.cuisine}</div>
          {truck.rating !== undefined && (
            <div className="flex gap-1 text-yellow-300 mt-1">
              {[...Array(Math.round(truck.rating))].map((_, i) => (
                <Star key={i} className="w-4 h-4" fill="yellow" />
              ))}
              <span className="ml-1 text-xs text-cyan-100 font-semibold">{truck.rating?.toFixed(1) ?? ""}</span>
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-cyan-100/60 my-1">{truck.address}</div>
      <div className="text-sm text-cyan-100/90 mt-1 line-clamp-2">{truck.description || <span className="italic text-cyan-100/40">No description yet.</span>}</div>
      <a
        href={`/trucks/${truck.id}`}
        className="block text-center mt-3 bg-cyan-500/80 hover:bg-cyan-400 text-white font-bold rounded-md py-1 transition-shadow shadow-lg hover:shadow-cyan-300/60"
      >
        View Menu
      </a>
    </div>
  );
}

export default function GoogleFoodTruckMap({ trucks }: Props) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTruck, setActiveTruck] = useState<FoodTruck | null>(null);
  const [recenter, setRecenter] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    );
  }, []);

  useEffect(() => {
    if (recenter && userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
      setRecenter(false);
    }
  }, [recenter, userLocation]);

  // Fit bounds to all trucks
  const fitBounds = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = new window.google.maps.LatLngBounds();
    trucks.filter(t => t.lat && t.lng).forEach(t => bounds.extend({ lat: t.lat!, lng: t.lng! }));
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 80);
  }, [trucks]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-gradient-to-br from-[#111827] via-[#22234a] to-[#111827] rounded-2xl shadow-xl">
        <Loader2 className="animate-spin h-10 w-10 text-cyan-400" />
        <span className="ml-4 text-lg text-cyan-300/80 font-mono tracking-wider">Loading Map…</span>
      </div>
    );
  }

  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="relative w-full h-[70vh] rounded-2xl shadow-xl border border-cyan-500/30 backdrop-blur-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={map => { mapRef.current = map; fitBounds(); }}
        options={{
          styles: MAP_STYLE,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          backgroundColor: "#191a1c",
        }}
      >
        {/* User marker */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={{
                url: userSVG,
                scaledSize: new window.google.maps.Size(36, 36),
                anchor: new window.google.maps.Point(18, 18)
              }}
              zIndex={100}
              title="You are here"
            />
            <Circle
              center={userLocation}
              radius={900}
              options={{
                strokeColor: '#00eaff',
                fillColor: '#00eaff44',
                fillOpacity: 0.18,
                strokeWeight: 1,
              }}
            />
          </>
        )}
        {/* Food trucks */}
        {trucks.map(truck =>
          truck.lat && truck.lng ? (
            <Marker
              key={truck.id}
              position={{ lat: truck.lat, lng: truck.lng }}
              icon={{
                url: truck.isOpen ? openTruckSVG : closedTruckSVG,
                scaledSize: new window.google.maps.Size(38, 46),
                anchor: new window.google.maps.Point(19, 46),
              }}
              onClick={() => setActiveTruck(truck)}
              zIndex={activeTruck?.id === truck.id ? 200 : 10}
              animation={activeTruck?.id === truck.id ? window.google.maps.Animation.BOUNCE : undefined}
            />
          ) : null
        )}
        {activeTruck && activeTruck.lat && activeTruck.lng && (
          <InfoWindow
            position={{ lat: activeTruck.lat, lng: activeTruck.lng }}
            onCloseClick={() => setActiveTruck(null)}
            options={{ pixelOffset: new google.maps.Size(0, -38) }}
          >
            <GlassCard truck={activeTruck} onClose={() => setActiveTruck(null)} />
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Neon Locate Me + Show All */}
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-50">
        <button
          className="rounded-full bg-cyan-400/80 hover:bg-cyan-500/90 shadow-lg p-3 border-2 border-cyan-200 flex items-center justify-center"
          style={{ boxShadow: '0 0 12px #00eaffbb, 0 0 2px #00eaff' }}
          aria-label="Locate Me"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  setRecenter(true);
                },
                () => { /* Handle denial */ }
              );
            }
          }}
        >
          <LocateFixed className="h-6 w-6 text-black" />
        </button>
        <button
          className="rounded-full bg-cyan-400/70 hover:bg-cyan-400/90 shadow-lg p-3 border-2 border-cyan-100 flex items-center justify-center"
          aria-label="Show all trucks"
          onClick={fitBounds}
        >
          <svg width={24} height={24} fill="none" stroke="#111" strokeWidth={2}><rect x={3} y={3} width={18} height={18} rx={6} /><circle cx={12} cy={12} r={4} /></svg>
        </button>
      </div>
      <div className="absolute top-2 left-2 z-20 p-2 bg-[#1e232d]/80 rounded-xl shadow-lg flex gap-2 items-center">
        <span className="font-bold text-base text-cyan-100/90 drop-shadow-[0_1px_4px_#00eaff90]">🚚 Find Food Trucks Near You</span>
      </div>
    </div>
  );
}
