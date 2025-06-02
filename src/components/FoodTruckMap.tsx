'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { FoodTruck } from '@/lib/types';

type Props = {
  trucks: FoodTruck[];
  onTruckClick?: (truck: FoodTruck) => void;
};

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '65vh',
  borderRadius: '1rem',
  overflow: 'hidden',
  boxShadow: '0 0 24px #3e7fff22',
  border: '1px solid #222',
};

export default function FoodTruckMap({ trucks, onTruckClick }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 1. Load Google Maps with mapId (no custom styles in JS)
  useEffect(() => {
    if (!mapRef.current || map) return;
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
    });
    loader.load().then(() => {
      if (mapRef.current && !map) {
        const initial = { lat: -34.9285, lng: 138.6007 }; // Default to Adelaide
        const gmap = new google.maps.Map(mapRef.current, {
          center: initial,
          zoom: 12,
          mapId: "YOUR_CLOUD_CONSOLE_MAP_ID", // <--- Replace with your own mapId!
          disableDefaultUI: true,
        });
        setMap(gmap);
      }
    });
  }, [mapRef, map]);

  // 2. Place truck markers
  useEffect(() => {
    if (!map) return;
    (map as any).__truckMarkers?.forEach((marker: google.maps.Marker) => marker.setMap(null));
    const markers: google.maps.Marker[] = [];
    trucks.forEach(truck => {
      if (typeof truck.lat === "number" && typeof truck.lng === "number") {
        const marker = new google.maps.Marker({
          position: { lat: truck.lat, lng: truck.lng },
          map,
          title: truck.name,
          icon: {
            url: '/truck-marker-open.svg',
            scaledSize: new google.maps.Size(38, 44),
            anchor: new google.maps.Point(19, 44),
          },
          animation: google.maps.Animation.DROP,
        });
        marker.addListener('click', () => onTruckClick?.(truck));
        markers.push(marker);
      }
    });
    (map as any).__truckMarkers = markers;
  }, [map, trucks, onTruckClick]);

  // 3. Live locate me
  useEffect(() => {
    if (!map) return;
    const geo = navigator.geolocation;
    let userMarker: google.maps.Marker | null = null;
    let watchId: number;
    if (geo) {
      watchId = geo.watchPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.panTo(coords);
          if (!userMarker) {
            userMarker = new google.maps.Marker({
              position: coords,
              map,
              icon: {
                url: '/user-marker.svg',
                scaledSize: new google.maps.Size(30, 30),
                anchor: new google.maps.Point(15, 15),
              },
              zIndex: 1000,
              title: 'You are here',
              animation: google.maps.Animation.BOUNCE,
            });
          } else {
            userMarker.setPosition(coords);
          }
        },
        undefined,
        { enableHighAccuracy: true }
      );
    }
    return () => geo && geo.clearWatch(watchId);
  }, [map]);

  return (
    <div className="w-full h-[65vh] rounded-xl overflow-hidden shadow border" ref={mapRef} style={mapContainerStyle}>
      {!map && (
        <div className="flex items-center justify-center h-full">
          <span className="text-lg text-muted-foreground">Loading map…</span>
        </div>
      )}
    </div>
  );
}
