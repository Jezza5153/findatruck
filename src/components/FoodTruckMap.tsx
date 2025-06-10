// src/components/FoodTruckMap.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import type { FoodTruck } from '@/lib/types';
import Image from 'next/image';
import { LocateFixed, MapPin, Star } from 'lucide-react';

// Marker clustering
// Install: npm i @googlemaps/markerclusterer
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  // Light, clear Google look
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#e7f5fd" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#b3d8ec" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi", elementType: "geometry.fill", stylers: [{ color: "#f6fcff" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#aed9fa" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#274063" }] }
];

const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '1.5rem',
  boxShadow: '0 4px 32px 0 #00d8ff22',
  overflow: 'hidden',
  border: '2px solid #e0f2fe',
  margin: '0 auto',
  background: '#e6f7ff'
};

const defaultCenter = { lat: -34.9285, lng: 138.6007 };

type Props = {
  trucks: FoodTruck[];
  userLocation?: { lat: number; lng: number } | null;
  showUser?: boolean;
  showCluster?: boolean;
};

function TruckCard({
  truck,
  onClose
}: {
  truck: FoodTruck;
  onClose: () => void;
}) {
  return (
    <div
      className="bg-white/95 backdrop-blur-xl border border-cyan-200 shadow-lg rounded-xl p-3 min-w-[210px] max-w-[270px] animate-in fade-in"
      style={{
        position: 'relative'
      }}
    >
      <button
        className="absolute top-2 right-3 text-cyan-400 font-bold text-xl"
        onClick={onClose}
        aria-label="Close"
        style={{ background: 'none', border: 0, cursor: 'pointer' }}
      >×</button>
      <div className="flex items-center gap-2 mb-2">
        <Image
          src={truck.imageUrl || '/fallback-truck.jpg'}
          alt={truck.name}
          width={38}
          height={38}
          className="rounded-lg border object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="truncate font-bold text-base text-cyan-800">{truck.name}</div>
          <div className="text-xs text-cyan-600 truncate">{truck.cuisine}</div>
        </div>
      </div>
      {truck.rating && (
        <div className="flex gap-1 text-yellow-500 items-center text-xs">
          {[...Array(Math.round(truck.rating))].map((_, i) => (
            <Star key={i} className="w-4 h-4" fill="yellow" />
          ))}
          <span className="ml-1 font-semibold">{truck.rating?.toFixed(1)}</span>
        </div>
      )}
      <div className="text-xs text-cyan-900/70 mt-1">{truck.address}</div>
      <div className="text-sm mt-2 text-cyan-700/90 line-clamp-2">
        {truck.description || <span className="italic text-cyan-400/60">No description yet.</span>}
      </div>
      <a
        href={`/trucks/${truck.id}`}
        className="block text-center mt-3 bg-cyan-500/90 hover:bg-cyan-400 text-white font-bold rounded-md py-1 transition-all"
      >
        View Menu
      </a>
    </div>
  );
}

export default function FoodTruckMap({
  trucks,
  userLocation,
  showUser = true,
  showCluster = true,
}: Props) {
  const [activeTruck, setActiveTruck] = useState<FoodTruck | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  // Center: user if available, else default
  const mapCenter = userLocation || defaultCenter;

  // Handle clustering and marker updates
  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;
    // Remove old
    markersRef.current.forEach(marker => marker.setMap(null));
    clustererRef.current?.clearMarkers?.();

    // Add new
    const markers: google.maps.Marker[] = trucks
      .filter(t => typeof t.lat === 'number' && typeof t.lng === 'number')
      .map(truck => {
        const marker = new window.google.maps.Marker({
          position: { lat: truck.lat!, lng: truck.lng! },
          icon: {
            url: truck.isOpen
              ? 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35f.png' // Open = fries emoji
              : 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f372.png', // Closed = stew emoji
            scaledSize: new window.google.maps.Size(38, 38),
            anchor: new window.google.maps.Point(19, 38),
          },
          title: truck.name,
        });
        marker.addListener('click', () => setActiveTruck(truck));
        return marker;
      });

    markersRef.current = markers;

    if (showCluster && markers.length > 3) {
      clustererRef.current = new MarkerClusterer({ markers, map: mapRef.current! });
    } else {
      markers.forEach(marker => marker.setMap(mapRef.current));
      clustererRef.current = null;
    }
  }, [trucks, showCluster]);

  // Effect: update markers on map load or trucks update
  useEffect(() => {
    if (!mapLoaded) return;
    updateMarkers();
    // Clean up on unmount
    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      clustererRef.current?.clearMarkers?.();
    };
  }, [mapLoaded, updateMarkers]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-gradient-to-br from-cyan-100 via-white to-cyan-50 rounded-2xl shadow-xl">
        <span className="ml-4 text-lg text-cyan-500 font-mono tracking-wider">Loading Map…</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] rounded-2xl shadow-xl border border-cyan-100 bg-cyan-50/60">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={map => { mapRef.current = map; setMapLoaded(true); }}
        options={{
          styles: MAP_STYLE,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          backgroundColor: "#e6f7ff",
          minZoom: 11,
          maxZoom: 18,
        }}
      >
        {/* User marker */}
        {showUser && userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9d1-200d-1f373.png', // chef emoji
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 32),
            }}
            zIndex={100}
            title="You are here"
            onClick={() => mapRef.current?.panTo(userLocation)}
          />
        )}
        {/* Info popover card */}
        {activeTruck && activeTruck.lat && activeTruck.lng && (
          <InfoWindow
            position={{ lat: activeTruck.lat, lng: activeTruck.lng }}
            onCloseClick={() => setActiveTruck(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -40),
              maxWidth: 320,
            }}
          >
            <TruckCard truck={activeTruck} onClose={() => setActiveTruck(null)} />
          </InfoWindow>
        )}
      </GoogleMap>
      {/* Floating buttons */}
      <div className="absolute top-5 right-5 flex flex-col gap-3 z-20">
        <button
          className="rounded-full bg-cyan-400/90 hover:bg-cyan-500/90 shadow-lg p-3 border-2 border-cyan-100 flex items-center justify-center"
          aria-label="Show all trucks"
          onClick={() => {
            if (!mapRef.current) return;
            const bounds = new window.google.maps.LatLngBounds();
            trucks.forEach(t => {
              if (typeof t.lat === 'number' && typeof t.lng === 'number')
                bounds.extend({ lat: t.lat, lng: t.lng });
            });
            if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 100);
          }}
        >
          <MapPin className="h-6 w-6 text-white" />
        </button>
        <button
          className="rounded-full bg-cyan-300/80 hover:bg-cyan-400 shadow-lg p-3 border-2 border-cyan-100 flex items-center justify-center"
          aria-label="Locate Me"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              pos => mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            );
          }}
        >
          <LocateFixed className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}
