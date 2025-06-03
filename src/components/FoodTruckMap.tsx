'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Crosshair, WifiOff } from 'lucide-react'; // Added WifiOff
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert components

type Props = {
  trucks: FoodTruck[];
  onTruckClick?: (truck: FoodTruck) => void;
};

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '65vh',
  borderRadius: '1rem', // Updated from 1rem to match theme
  overflow: 'hidden',
  boxShadow: '0 8px 24px hsl(var(--primary) / 0.1)', // Use theme variable
  border: '1px solid hsl(var(--border))', // Use theme variable
  position: 'relative',
  backgroundColor: 'hsl(var(--muted))', // Background for loading/error states
};

export default function FoodTruckMap({ trucks, onTruckClick }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // 1. Load Google Maps
  useEffect(() => {
    if (!mapRef.current || map) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        setMapError("Google Maps API Key is missing. Please configure it in your environment variables.");
        setIsLoadingMap(false);
        return;
    }
    
    setIsLoadingMap(true);
    setMapError(null);

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["marker"], // Using AdvancedMarkerElement
    });

    loader.load().then(async () => {
      if (mapRef.current && !map) {
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const initial = { lat: 34.0522, lng: -118.2437 }; // Default to Los Angeles
        const gmap = new Map(mapRef.current, {
          center: initial,
          zoom: 10,
          mapId: "YOUR_MAP_ID_HERE", // Replace with your actual Map ID if you have one
          disableDefaultUI: true,
          zoomControl: true,
        });
        setMap(gmap);
      }
    }).catch(e => {
      console.error("Failed to load Google Maps:", e);
      setMapError("Failed to load Google Maps. Check your API key and network connection.");
    }).finally(() => {
      setIsLoadingMap(false);
    });
  }, [mapRef, map]);

  // 2. Place truck markers
  useEffect(() => {
    if (!map || !google.maps.marker) return;

    // Clear previous markers
    (map as any).__truckMarkers?.forEach((marker: google.maps.marker.AdvancedMarkerElement) => {
      marker.map = null; // Correct way to remove AdvancedMarkerElement
    });
    
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    trucks.forEach(truck => {
      if (typeof truck.lat === "number" && typeof truck.lng === "number") {
        
        const truckIcon = document.createElement('img');
        truckIcon.src = truck.isOpen ? '/truck-marker-open.svg' : '/truck-marker-closed.svg'; // SVGs should be in /public
        truckIcon.style.width = '38px';
        truckIcon.style.height = '44px';
        // truckIcon.style.transform = 'translateY(-50%)'; // Adjust anchor if needed

        const marker = new google.maps.marker.AdvancedMarkerElement({
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

  // 3. Handle "Locate Me"
  const handleLocateMe = useCallback(() => {
    if (!map || !navigator.geolocation) {
        setMapError("Geolocation is not supported by your browser or map is not loaded.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(coords);
        map.setZoom(14);

        if (!userMarker) {
           const userIcon = document.createElement('img');
           userIcon.src = '/user-marker.svg'; // User marker SVG in /public
           userIcon.style.width = '30px';
           userIcon.style.height = '30px';

          const marker = new google.maps.marker.AdvancedMarkerElement({
            position: coords,
            map,
            content: userIcon,
            title: 'You are here',
            zIndex: 1000, // Ensure user marker is on top
          });
          setUserMarker(marker as any); // Cast as any if types conflict, or ensure correct type
        } else {
          (userMarker as google.maps.marker.AdvancedMarkerElement).position = coords;
        }
      },
      error => {
        console.error("Geolocation error:", error);
        setMapError("Could not access your location. Please allow location access.");
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
              <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
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
