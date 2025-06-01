
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { FoodTruck } from '@/lib/types'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface FoodTruckMapProps {
  trucks: FoodTruck[];
}

const FoodTruckMap: React.FC<FoodTruckMapProps> = ({ trucks }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [apiScriptLoaded, setApiScriptLoaded] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps API script
  useEffect(() => {
    if (!apiKey) {
      const errorMsg = 'Google Maps API key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file.';
      console.error(errorMsg);
      setApiError(errorMsg);
      return;
    }

    if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
      setApiScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Attach the callback function to the window object
    (window as any).initMap = () => {
      setApiScriptLoaded(true);
    };

    script.onerror = () => {
      const errorMsg = 'Failed to load Google Maps script. Check your API key, internet connection, or Google Cloud Console settings.';
      console.error(errorMsg);
      setApiError(errorMsg);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete (window as any).initMap; // Clean up the callback
    };
  }, [apiKey]);

  // Initialize the map
  useEffect(() => {
    if (apiScriptLoaded && mapRef.current && !map && !apiError) {
      try {
        const initialMapOptions: google.maps.MapOptions = {
          center: { lat: 34.0522, lng: -118.2437 }, // Default center (e.g., Los Angeles)
          zoom: 10, // Default zoom level
          mapTypeControl: false,
          streetViewControl: false,
        };
        const newMap = new google.maps.Map(mapRef.current!, initialMapOptions);
        setMap(newMap);
      } catch (e) {
        console.error("Error initializing Google Map:", e);
        setApiError("Could not initialize the map. Ensure the Google Maps API loaded correctly.");
      }
    }
  }, [apiScriptLoaded, map, apiError]);

  // Add markers to the map
  useEffect(() => {
    if (!map || !apiScriptLoaded || apiError) return;

    markers.forEach(marker => marker.setMap(null));
    const newMarkersList: google.maps.Marker[] = [];
    let bounds: google.maps.LatLngBounds | null = null;

    if (trucks.length > 0) {
        bounds = new google.maps.LatLngBounds();
    }

    trucks.forEach(truck => {
      if (truck.location && typeof truck.location.lat === 'number' && typeof truck.location.lng === 'number') {
        const position = { lat: truck.location.lat, lng: truck.location.lng };
        const marker = new google.maps.Marker({
          position,
          map: map,
          title: truck.name,
          // icon: { // Optional: custom marker icon
          //   url: '/path/to/custom-marker.png',
          //   scaledSize: new google.maps.Size(30, 30)
          // }
        });
        newMarkersList.push(marker);

        const infoWindowContent = `
          <div style="max-width: 200px; font-family: sans-serif; font-size: 14px;">
            <h4 style="margin: 0 0 5px 0; font-weight: bold;">${truck.name}</h4>
            <p style="margin: 0 0 3px 0;">${truck.cuisine}</p>
            ${truck.isOpen !== undefined ? `<p style="margin: 0; color: ${truck.isOpen ? 'green' : 'red'};">${truck.isOpen ? 'Open Now' : 'Closed'}</p>` : ''}
            <a href="/trucks/${truck.id}" style="color: #1a73e8; text-decoration: none; display: block; margin-top: 5px;">View Details</a>
          </div>`;
        
        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        if (bounds) {
            bounds.extend(position);
        }
      }
    });
    setMarkers(newMarkersList);
    if (bounds && newMarkersList.length > 0) {
        map.fitBounds(bounds);
        // If only one marker, don't zoom in too much
        if (newMarkersList.length === 1) {
            map.setZoom(Math.min(map.getZoom() ?? 15, 15)); // Adjust zoom for single marker
        }
    } else if (newMarkersList.length === 0 && !bounds) {
        // No trucks, reset to default view or a wider area
        map.setCenter({ lat: 34.0522, lng: -118.2437 });
        map.setZoom(10);
    }

  }, [map, apiScriptLoaded, trucks, apiError]);

  if (apiError) {
    return (
      <Card className="w-full h-96 rounded-md flex flex-col items-center justify-center bg-destructive/10 border-destructive">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
          <CardTitle className="text-destructive">Map Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-destructive-foreground">{apiError}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please ensure your Google Maps API key is correctly configured in a <code>.env.local</code> file and that the Maps JavaScript API is enabled in your Google Cloud Console.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!apiScriptLoaded && !apiKey) { // Covers case where apiKey is dynamically checked before script load attempt
     return (
      <Card className="w-full h-96 rounded-md flex flex-col items-center justify-center bg-muted">
        <CardHeader className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
          <CardTitle>Loading Map...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
           <p className="text-muted-foreground">Waiting for Google Maps API key...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!apiScriptLoaded) {
    return (
      <Card className="w-full h-96 rounded-md flex flex-col items-center justify-center bg-muted">
        <CardHeader className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
          <CardTitle>Loading Map...</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
           <p className="text-muted-foreground">Initializing Google Maps service...</p>
        </CardContent>
      </Card>
    );
  }

  return <div ref={mapRef} className="w-full h-96 rounded-md shadow-md border"></div>;
};

export default FoodTruckMap;
