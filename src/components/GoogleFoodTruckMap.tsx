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
      () => setUserLocation(null) // Handle case where user denies location
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
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300E5FF" width="30px" height="30px"><circle cx="12" cy="12" r="10" stroke="%23FFFFFF" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="%23FFFFFF"/></svg>'),
                scaledSize: new window.google.maps.Size(30, 30),
                anchor: new window.google.maps.Point(15,15)
              }}
              zIndex={100}
            />
            <Circle
              center={userLocation}
              radius={1200} // Roughly 0.75 miles
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
                  ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300FFAB" width="38px" height="46px"><path d="M20 8h-3V4H7v4H4c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2V10c0-1.1-.9-2-2-2zm-9 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm7 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM20 11H4V10h16v1zM7 6h10v2H7V6z"/></svg>')
                  : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF4D6D" width="38px" height="46px"><path d="M20 8h-3V4H7v4H4c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2V10c0-1.1-.9-2-2-2zm-9 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm7 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM20 11H4V10h16v1zM7 6h10v2H7V6z"/></svg>'),
                scaledSize: new window.google.maps.Size(38, 46),
                anchor: new window.google.maps.Point(19, 46),
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
            options={{
              pixelOffset: new google.maps.Size(0, -40), // Adjust to position above marker
              disableAutoPan: true,
              content: `
                <div style="background: rgba(24, 26, 34, 0.85); backdrop-filter: blur(10px); border-radius: 1rem; padding: 12px 16px; box-shadow: 0 4px 20px rgba(0, 234, 255, 0.2); border: 1px solid rgba(0, 234, 255, 0.4); color: #e0f7fa; font-family: 'Inter', sans-serif; max-width: 250px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <h3 style="font-size: 1.1rem; font-weight: 700; color: #22d3ee; margin: 0;">${activeTruck.name}</h3>
                    ${activeTruck.isOpen ? 
                      '<span style="background: rgba(0, 255, 171, 0.2); color: #00FFAB; padding: 2px 6px; border-radius: 0.5rem; font-size: 0.7rem; font-weight: 500;">Open</span>' :
                      '<span style="background: rgba(255, 77, 109, 0.2); color: #FF4D6D; padding: 2px 6px; border-radius: 0.5rem; font-size: 0.7rem; font-weight: 500;">Closed</span>'
                    }
                  </div>
                  <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin: 0 0 6px 0;">${activeTruck.cuisine}</p>
                  ${activeTruck.rating !== undefined ? `<p style="font-size: 0.8rem; color: #facc15; margin: 0 0 8px 0;">${'★'.repeat(Math.round(activeTruck.rating))}${'☆'.repeat(5-Math.round(activeTruck.rating))} (${activeTruck.rating.toFixed(1)})</p>` : ''}
                  <p style="font-size: 0.85rem; margin: 0 0 10px 0; line-height: 1.4; max-height: 4.2em; overflow: hidden; text-overflow: ellipsis;">${activeTruck.description || 'No description available.'}</p>
                  <a href="/trucks/${activeTruck.id}" style="display: block; text-align: center; background: linear-gradient(to right, rgba(0, 234, 255, 0.3), rgba(0, 180, 255, 0.4)); border: 1px solid rgba(0, 234, 255, 0.5); color: #ffffff; padding: 6px 10px; border-radius: 0.75rem; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: background 0.2s ease;">View Details</a>
                </div>
              `
            }}
          >
            {/* Content is now set via options.content as HTML string */}
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
              },
              () => { /* Handle location denial or error */ }
            );
          }
        }}
      >
        <LocateFixed className="h-6 w-6 text-black" />
      </button>
    </div>
  );
}
