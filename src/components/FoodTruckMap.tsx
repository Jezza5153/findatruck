
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Crosshair, WifiOff, Loader as LoaderIcon, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from 'next/navigation'; // For navigating to truck page
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { FoodTruckCard } from './FoodTruckCard'; // Import FoodTruckCard for sheet content

type Props = {
  trucks: FoodTruck[];
};

const mapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '65vh', // Consider making this more dynamic or taller
  borderRadius: '0.75rem', // Adjusted to match theme
  overflow: 'hidden',
  boxShadow: '0 4px 12px hsl(var(--primary) / 0.1)',
  border: '1px solid hsl(var(--border))',
  position: 'relative',
  backgroundColor: 'hsl(var(--muted))', // Placeholder bg
};

export default function FoodTruckMap({ trucks }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userMarker, setUserMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const router = useRouter();

  const [selectedTruck, setSelectedTruck] = useState<FoodTruck | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTruckClick = (truck: FoodTruck) => {
    setSelectedTruck(truck);
    setIsSheetOpen(true);
    // Optionally pan map to truck
    if (map && truck.lat && truck.lng) {
      map.panTo({ lat: truck.lat, lng: truck.lng });
    }
  };

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setMapError("Google Maps API Key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.");
      setIsLoadingMap(false);
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["marker", "maps"], // Ensure 'maps' for Map class
    });

    loader.load().then(async () => {
      if (mapRef.current && !map) { // Check if map is not already initialized
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        
        const initialCenter = { lat: 34.0522, lng: -118.2437 }; // Default to LA
        const gmap = new Map(mapRef.current, {
          center: initialCenter,
          zoom: 10,
          mapId: "FINDATRUCK_MAIN_MAP_ID", // Replace with your Map ID if using Cloud-based styling
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          // styles: mapStyles, // Add custom map styles if desired
        });
        setMap(gmap);
      }
    }).catch(e => {
      console.error("Failed to load Google Maps:", e);
      setMapError("Failed to load Google Maps. Check API key, network, and console.");
    }).finally(() => {
      setIsLoadingMap(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // map was removed to prevent re-initialization loop

  useEffect(() => {
    if (!map || !google.maps.marker) return;

    // Clear existing markers
    markers.forEach(marker => marker.map = null);
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    trucks.forEach(truck => {
      if (typeof truck.lat === "number" && typeof truck.lng === "number") {
        const truckIconEl = document.createElement('img');
        truckIconEl.src = truck.isOpen ? '/truck-marker-open.svg' : '/truck-marker-closed.svg';
        truckIconEl.style.width = '36px';
        truckIconEl.style.height = '42px';
        truckIconEl.style.cursor = 'pointer';

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: truck.lat, lng: truck.lng },
          map,
          title: truck.name,
          content: truckIconEl,
        });
        marker.addListener('click', () => handleTruckClick(truck));
        newMarkers.push(marker);
      }
    });
    setMarkers(newMarkers);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, trucks]); // Removed onTruckClick because its identity changes often due to useCallback

  const handleLocateMe = useCallback(() => {
    if (!map || !navigator.geolocation) {
      setMapError("Geolocation is not supported or map is not loaded.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(coords);
        map.setZoom(14);

        const userIconEl = document.createElement('img');
        userIconEl.src = '/user-marker.svg'; 
        userIconEl.style.width = '28px';
        userIconEl.style.height = '28px';

        if (!userMarker) {
          const newMarker = new google.maps.marker.AdvancedMarkerElement({
            position: coords, map, content: userIconEl, title: 'You are here', zIndex: 1000,
          });
          setUserMarker(newMarker);
        } else {
          userMarker.position = coords;
        }
      },
      error => {
        console.error("Geolocation error:", error);
        setMapError("Could not access location. Please allow access in browser settings.");
      },
      { enableHighAccuracy: true }
    );
  }, [map, userMarker]);

  return (
    <>
      <div className="relative w-full h-[65vh] rounded-xl overflow-hidden shadow border" style={mapContainerStyle}>
        <Button
          className="absolute z-10 top-3 left-3 bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
          onClick={handleLocateMe}
          type="button"
          size="sm"
          aria-label="Center map on my location"
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
      {selectedTruck && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0"> {/* Adjust height as needed */}
            <SheetHeader className="p-4 border-b">
              <SheetTitle>{selectedTruck.name}</SheetTitle>
              <SheetDescription>{selectedTruck.cuisine}</SheetDescription>
               <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
            </SheetHeader>
            <div className="overflow-y-auto flex-grow p-4">
              <FoodTruckCard truck={selectedTruck} />
            </div>
            <div className="p-4 border-t">
               <Button className="w-full" onClick={() => router.push(`/trucks/${selectedTruck.id}`)}>
                 View Full Profile & Menu
               </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
