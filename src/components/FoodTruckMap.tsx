'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { FoodTruck } from '@/lib/types'; // Assuming your types are here

interface FoodTruckMapProps {
  trucks: FoodTruck[];
}

const FoodTruckMap: React.FC<FoodTruckMapProps> = ({ trucks }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps API script
  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is not set.');
      // Optionally, show a user-facing error message
      return;
    }

    // Check if the API is already loaded
    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
      setApiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setApiLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script.');
      // Optionally, show a user-facing error message
    };
    document.head.appendChild(script);

    return () => {
      // Clean up the script if the component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey]);

  // Initialize the map
  useEffect(() => {
    if (apiLoaded && mapRef.current && !map) {
      const initialMapOptions = {
        center: { lat: 34.0522, lng: -118.2437 }, // Default center (e.g., Los Angeles)
        zoom: 12, // Default zoom level
      };

      const newMap = new google.maps.Map(mapRef.current, initialMapOptions);
      setMap(newMap);
    }
  }, [apiLoaded, map, mapRef]);

  // Add markers to the map
  useEffect(() => {
    if (!map || !apiLoaded) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    const newMarkers: google.maps.Marker[] = [];
    trucks.forEach(truck => {
      if (truck.location && truck.location.lat !== undefined && truck.location.lng !== undefined) {
        const marker = new google.maps.Marker({
          position: { lat: truck.location.lat, lng: truck.location.lng },
          map: map,
          title: truck.name,
        });
        newMarkers.push(marker);

        // Optional: Add info window on marker click
        const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${truck.name}</strong><p>${truck.cuisine}</p></div>`
        });
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
      }
    });
    setMarkers(newMarkers);
  }, [map, apiLoaded, trucks]);

  if (!apiKey) {
    return <div className="text-red-500">Google Maps API key is missing. Map cannot load.</div>;
  }

  if (!apiLoaded) {
 return (
 <div className="flex flex-col justify-center items-center h-96 text-muted-foreground">
 <Loader2 className="h-12 w-12 animate-spin mb-4" />
 </div>); // Basic loading indicator
  }

  return <div ref={mapRef} className="w-full h-96 rounded-md"></div>; // Map container div
};

export default FoodTruckMap;