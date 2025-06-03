'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Crosshair, WifiOff, Loader as LoaderIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Props = {
  trucks: FoodTruck[];
  onTruckClick?: (truck: FoodTruck) => void;
};

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '65vh',
  borderRadius: '1rem',
  overflow: 'hidden',
  boxShadow: '0 8px 24px hsl(var(--primary) / 0.1)',
  border: '1px solid hsl(var(--border))',
  position: 'relative',
  backgroundColor: 'hsl(var(--muted))',
};

export default function FoodTruckMap({ trucks, onTruckClick }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<any>(null); // Type: google.maps.marker.AdvancedMarkerElement | null
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Load Google Maps and init map
  useEffect(() => {
    if (!mapRef.current || map) return;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError("Google Maps API Key is missing. Please configure it in your .env.local file (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).");
      setIsLoadingMap(false);
      return;
    }
    setIsLoadingMap(true);
    setMapError(null);

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["marker"], // Needed for Advanced Markers!
    });

    loader.load()
      .then(async () => {
        if (!mapRef.current || map) return;
        // Dynamically import the Maps Library
        const { Map } = await (window as any).google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const initial = { lat: -34.9285, lng: 138.6007 }; // Default: Adelaide
        const gmap = new Map(mapRef.current, {
          center: initial,
          zoom: 12,
          mapId: "FINDATRUCK_MAP_ID", // Replace with your Map ID or remove if not using cloud styling
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        setMap(gmap);
      })
      .catch(e => {
        setMapError("Failed to load Google Maps. Check your API key, network connection, and browser console for more details.");
      })
      .finally(() => {
        setIsLoadingMap(false);
      });
    // eslint-disable-next-line
  }, [mapRef]);

  // Place Advanced Markers for trucks
  useEffect(() => {
    if (!map || !(window as any).google.maps.marker) return;

    // Clean up previous markers
    (map as any).__truckMarkers?.forEach((marker: any) => {
      marker.map = null;
    });

    const newMarkers: any[] = [];
    trucks.forEach(truck => {
      if (typeof truck.lat === "number" && typeof truck.lng === "number") {
        const truckIcon = document.createElement('img');
        truckIcon.src = truck.isOpen ? '/truck-marker-open.svg' : '/truck-marker-closed.svg';
        truckIcon.style.width = '38px';
        truckIcon.style.height = '44px';
        const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
          position: { lat: truck.lat, lng: truck.lng },
          map,
          title: truck.name,
          content: truckIcon,
        });
        marker.addListener('click', () => onTruckClick?.(truck));
        newMarkers.push(marker);
      }
    });
    (map as any).__truckMarkers = newMarkers;

  }, [map, trucks, onTruckClick]);

  // Locate Me button logic (AdvancedMarkerElement for user location)
  const handleLocateMe = useCallback(() => {
    if (!map || !navigator.geolocation || !(window as any).google.maps.marker) {
      setMapError("Geolocation is not supported by your browser or map is not loaded.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(coords);
        map.setZoom(14);

        if (!userMarker) {
          const userIcon = document.createElement('img');
          userIcon.src = '/user-marker.svg';
          userIcon.style.width = '30px';
          userIcon.style.height = '30px';

          const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
            position: coords,
            map,
            content: userIcon,
            title: 'You are here',
            zIndex: 1000,
          });
          setUserMarker(marker);
        } else {
          userMarker.position = coords;
        }
      },
      error => {
        setMapError("Could not access your location. Please allow location access in your browser settings.");
      },
      { enableHighAccuracy: true }
    );
  }, [map, userMarker]);

  return (
    <div className="relative w-full h-[65vh] rounded-xl overflow-hidden shadow border" style={mapContainerStyle}>
      <Button
        className="absolute z-10 top-4 left-4 bg-accent text-accent-foreground shadow-lg"
        onClick={handleLocateMe}
        type="button"
        size="sm"
        aria-label="Locate Me"
        disabled={isLoadingMap || !!mapError}
      >
        <Crosshair className="mr-2 h-4 w-4" /> Locate Me
      </Button>
      <div ref={mapRef} className="w-full h-full" />
      {(isLoadingMap || mapError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20 p-4">
          {isLoadingMap && !mapError && (
            <div className="text-center">
              <LoaderIcon className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
              <p className="text-lg text-muted-foreground">Loading map…</p>
            </div>
          )}
          {mapError && (
            <Alert variant="destructive" className="max-w-md">
              <WifiOff className="h-5 w-5" />
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
