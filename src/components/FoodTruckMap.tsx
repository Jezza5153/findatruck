'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';

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
  position: 'relative'
};

export default function FoodTruckMap({ trucks, onTruckClick }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);

  // 1. Load Google Maps with mapId (do not set styles in JS)
  useEffect(() => {
    if (!mapRef.current || map) return;
    setIsLoadingMap(true);
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
          mapId: "9d6a4c3fc6a7abdf44a06eac", // <-- REPLACE WITH YOUR OWN MAP ID!
          disableDefaultUI: true,
        });
        setMap(gmap);
        setIsLoadingMap(false);
      }
    });
  }, [mapRef, map]);

  // 2. Place truck markers
  useEffect(() => {
    if (!map) return;
    // Remove previous markers
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

  // 3. Only allow user to locate themselves when they click "Locate Me"
  const handleLocateMe = useCallback(() => {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(coords);
        if (!userMarker) {
          const marker = new google.maps.Marker({
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
          setUserMarker(marker);
        } else {
          userMarker.setPosition(coords);
        }
      },
      error => {
        // Optionally handle error (e.g., toast)
        alert('Could not access your location. Please allow location access.');
      },
      { enableHighAccuracy: true }
    );
  }, [map, userMarker]);

  return (
    <div className="relative w-full h-[65vh] rounded-xl overflow-hidden shadow border" style={mapContainerStyle}>
      {/* Locate Me Button */}
      <Button
        className="absolute z-10 top-4 left-4 bg-accent text-white shadow-lg"
        onClick={handleLocateMe}
        type="button"
        size="sm"
        aria-label="Locate Me"
      >
        <Crosshair className="mr-2 h-4 w-4" /> Locate Me
      </Button>
      <div ref={mapRef} className="w-full h-full" />
      {isLoadingMap && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
          <span className="text-lg text-muted-foreground">Loading map…</span>
        </div>
      )}
    </div>
  );
}
