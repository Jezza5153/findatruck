'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Circle } from '@react-google-maps/api';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { LocateFixed, Loader2 } from 'lucide-react';

const MAP_STYLE = [
  // Cyberpunk style (feel free to swap for another theme!)
  {
    "featureType": "all",
    "elementType": "geometry",
    "stylers": [{ "color": "#191a1c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#23234f" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#24242c" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#22222a" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#e1e7ef" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#0a0a0f" }, { "weight": 3 }]
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

const defaultCenter = { lat: -34.9285, lng: 138.6007 }; // Adelaide

type Props = {
  trucks: FoodTruck[];
};

export default function GoogleFoodTruckMap({ trucks }: Props) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTruck, setActiveTruck] = useState<FoodTruck | null>(null);
  const [recenter, setRecenter] = useState(false);

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  // Attempt geolocation on mount
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

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-gradient-to-br from-[#111827] via-[#22234a] to-[#111827] rounded-2xl shadow-xl">
        <Loader2 className="animate-spin h-10 w-10 text-cyan-400" />
        <span className="ml-4 text-lg text-cyan-300/80 font-mono tracking-wider">Loading Map…</span>
      </div>
    );
  }

  // Center: user if available, else default
  const mapCenter = userLocation || defaultCenter;

  return (
    <div className="relative w-full h-[70vh] rounded-2xl shadow-xl border border-cyan-500/30 backdrop-blur-lg">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onLoad={map => { mapRef.current = map; }}
        options={{
          styles: MAP_STYLE as google.maps.MapTypeStyle[],
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          backgroundColor: "#191a1c",
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // replace with your SVG later
                scaledSize: new window.google.maps.Size(34, 34),
              }}
              zIndex={100}
            />
            <Circle
              center={userLocation}
              radius={1200}
              options={{
                strokeColor: '#00eaff',
                fillColor: '#00eaff44',
                fillOpacity: 0.18,
                strokeWeight: 1,
              }}
            />
          </>
        )}

        {/* Food truck markers */}
        {trucks.map(truck =>
          truck.lat && truck.lng ? (
            <Marker
              key={truck.id}
              position={{ lat: truck.lat, lng: truck.lng }}
              icon={{
                url: truck.isOpen
                  ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' // Your SVG soon!
                  : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(38, 46),
              }}
              onClick={() => setActiveTruck(truck)}
            />
          ) : null
        )}

        {/* Futuristic glass info window */}
        {activeTruck && activeTruck.lat && activeTruck.lng && (
          <InfoWindow
            position={{ lat: activeTruck.lat, lng: activeTruck.lng }}
            onCloseClick={() => setActiveTruck(null)}
          >
            <div className="bg-[#181A22cc] rounded-2xl px-4 py-3 shadow-lg border border-cyan-500/40 glassmorphism backdrop-blur-2xl">
              <div className="flex flex-col gap-1">
                <div className="font-extrabold text-lg tracking-wide text-cyan-300 flex items-center">
                  {activeTruck.name}
                  {activeTruck.isOpen ? (
                    <span className="ml-3 px-2 py-0.5 text-xs rounded-lg bg-cyan-700/70 text-white glow shadow">Open Now</span>
                  ) : (
                    <span className="ml-3 px-2 py-0.5 text-xs rounded-lg bg-pink-800/70 text-white">Closed</span>
                  )}
                </div>
                <div className="text-xs uppercase tracking-widest text-cyan-100/70 mb-1">{activeTruck.cuisine}</div>
                <div className="flex gap-2 items-center">
                  {activeTruck.rating !== undefined && (
                    <span className="text-yellow-400 font-bold tracking-wide">{activeTruck.rating.toFixed(1)}★</span>
                  )}
                </div>
                <div className="text-cyan-50/90 mt-2 line-clamp-2 text-sm font-medium">{activeTruck.description}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 bg-gradient-to-r from-cyan-400/30 to-cyan-600/50 border border-cyan-400/50 shadow hover:bg-cyan-500/30 text-white font-bold tracking-wide rounded-xl"
                  asChild
                >
                  <a href={`/trucks/${activeTruck.id}`}>View Menu</a>
                </Button>
              </div>
            </div>
          </InfoWindow>
        )}

      </GoogleMap>

      {/* Floating "Locate Me" neon button */}
      <button
        className="absolute z-[200] top-4 right-4 rounded-full bg-cyan-400/90 hover:bg-cyan-500/90 shadow-lg p-3 transition-all border-2 border-cyan-200 glow-lg flex items-center"
        style={{ boxShadow: '0 0 12px #00eaffbb, 0 0 2px #00eaff' }}
        aria-label="Locate Me"
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setRecenter(true);
              }
            );
          }
        }}
      >
        <LocateFixed className="h-6 w-6 text-black" />
      </button>
    </div>
  );
}
