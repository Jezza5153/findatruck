'use client';

import { useCallback, useRef, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Image from 'next/image';
import { Star, MapPin, CircleCheck, Clock, Utensils } from 'lucide-react';
import type { TruckWithMenu, MenuItem } from '@/lib/types';

// ---- Config ----
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string; // Set in .env.local
const DEFAULT_CENTER = { lat: -34.9285, lng: 138.6007 }; // Adelaide

const mapContainerStyle = { width: '100%', height: '580px', borderRadius: '1.5rem' } as const;

function getMarkerIcon(isOpen: boolean) {
  // You can swap this SVG out for your branding!
  return {
    url: isOpen
      ? '/foodtruck-here.png'
      : '/foodtruck-marker.png',
    scaledSize: { width: 54, height: 54 } as google.maps.Size,
    anchor: { x: 27, y: 54 } as google.maps.Point,
  };
}

function getTruckPosition(truck: TruckWithMenu) {
  if (typeof truck.lat === 'number' && typeof truck.lng === 'number') return { lat: truck.lat, lng: truck.lng };
  if (truck.currentLocation && typeof truck.currentLocation.lat === 'number' && typeof truck.currentLocation.lng === 'number')
    return { lat: truck.currentLocation.lat, lng: truck.currentLocation.lng };
  return null;
}

function RatingStars({ rating = 0, count = 0 }: { rating?: number; count?: number }) {
  if (!rating || !count) return null;
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center ml-2">
      {[...Array(rounded)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-yellow-400" fill="yellow" />
      ))}
      <span className="ml-1 text-xs text-gray-600">({count})</span>
    </span>
  );
}

function getTodaysHours(truck: TruckWithMenu): string {
  if (typeof truck.todaysHours === 'string') return truck.todaysHours;
  if (typeof truck.todaysHours === 'object' && truck.todaysHours) {
    if (truck.todaysHours.open && truck.todaysHours.close)
      return `${truck.todaysHours.open}–${truck.todaysHours.close}`;
  }
  return '';
}

export default function FoodTruckMap({ trucks }: { trucks: TruckWithMenu[] }) {
  // Load Google Maps JS API only on client
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ['places'],
  });

  // InfoWindow logic
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Center on first open/visible truck, else Adelaide
  const mapCenter = useMemo(() => {
    const first = trucks.find(t => t.isHere && getTruckPosition(t));
    return first ? getTruckPosition(first)! : DEFAULT_CENTER;
  }, [trucks]);

  const handleMarkerClick = useCallback((id: string) => setActiveMarker(id), []);
  const handleMapClick = useCallback(() => setActiveMarker(null), []);

  if (loadError) return <div className="p-8 text-red-600 font-bold">Error loading Google Maps</div>;
  if (!isLoaded) return <div style={{ height: 480, textAlign: 'center', padding: 24 }}>Loading Google Map…</div>;

  const trucksWithLoc = trucks.filter(t => t.isHere && getTruckPosition(t));

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden shadow-xl border border-primary/30">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
          styles: [
            // Soft light Google map style (optional)
          ],
        }}
      >
        {trucksWithLoc.map(truck => {
          const pos = getTruckPosition(truck)!;
          return (
            <Marker
              key={truck.id}
              position={pos}
              icon={getMarkerIcon(!!truck.isOpen)}
              onClick={() => handleMarkerClick(truck.id)}
              zIndex={truck.isOpen ? 999 : 1}
              animation={window?.google?.maps?.Animation?.DROP}
            >
              {activeMarker === truck.id && (
                <InfoWindow
                  position={pos}
                  onCloseClick={() => setActiveMarker(null)}
                  options={{ maxWidth: 320 }}
                >
                  <div className="min-w-[220px] max-w-[300px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Image
                        src={truck.imageUrl || '/fallback-truck.jpg'}
                        width={48}
                        height={48}
                        alt={truck.name}
                        className="rounded-lg object-cover border"
                        onError={(e: any) => {
                          e.target.src = '/fallback-truck.jpg';
                        }}
                      />
                      <div>
                        <div className="font-bold text-lg leading-tight flex items-center gap-1">
                          {truck.name}
                          {truck.isOpen && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded inline-flex items-center">
                              <CircleCheck className="w-3 h-3 mr-1" />Open
                            </span>
                          )}
                          <RatingStars rating={truck.rating} count={truck.numberOfRatings} />
                        </div>
                        <div className="text-xs text-muted-foreground">{truck.cuisine}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs mb-1 text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {truck.currentLocation?.address || truck.address || <span className="italic">No address set</span>}
                    </div>
                    <div className="flex items-center text-xs mb-1 text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTodaysHours(truck) || truck.operatingHoursSummary || <span className="italic">Hours not set</span>}
                    </div>
                    <div className="mt-2 mb-1">
                      <span className="font-medium text-primary text-sm">Today's Menu:</span>
                      {truck.todaysMenuItems?.length ? (
                        <ul className="mt-1 flex flex-col gap-1">
                          {truck.todaysMenuItems.slice(0, 2).map((item: MenuItem) => (
                            <li key={item.id} className="flex items-center gap-1 text-xs">
                              {item.imageUrl && (
                                <Image
                                  src={item.imageUrl}
                                  width={20}
                                  height={20}
                                  alt={item.name}
                                  className="rounded-full mr-1 border"
                                />
                              )}
                              <span className="font-semibold">{item.name}</span>
                              {typeof item.price === 'number' &&
                                <span className="text-muted-foreground ml-2">${item.price.toFixed(2)}</span>
                              }
                            </li>
                          ))}
                          {truck.todaysMenuItems.length > 2 && (
                            <li className="italic text-muted-foreground text-xs">+{truck.todaysMenuItems.length - 2} more…</li>
                          )}
                        </ul>
                      ) : (
                        <div className="text-xs text-muted-foreground italic">Not published for today</div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          truck.currentLocation?.address ||
                          (truck.lat && truck.lng ? `${truck.lat},${truck.lng}` : '')
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 font-semibold"
                      >
                        Directions
                      </a>
                      <a
                        href={`/trucks/${truck.id}`}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
                      >
                        See Menu
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
      <div className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-xl shadow-lg flex gap-2 items-center">
        <Utensils className="text-primary w-5 h-5" />
        <span className="font-bold text-base">Find Food Trucks Near You</span>
      </div>
      {/* Empty state */}
      {trucksWithLoc.length === 0 && (
        <div className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-xl px-8 py-6 shadow-lg text-center">
          <Utensils className="mx-auto mb-2 text-primary w-10 h-10" />
          <div className="font-semibold text-lg mb-1">No food trucks are live right now.</div>
          <div className="text-sm text-muted-foreground mb-1">Check back soon or try a different area.</div>
        </div>
      )}
    </div>
  );
}
