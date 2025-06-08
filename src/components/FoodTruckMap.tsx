'use client';

import { useRef, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import Image from 'next/image';
import { Star, CircleCheck, Clock, MapPin } from 'lucide-react';
import type { TruckWithMenu } from '@/lib/types';

const DEFAULT_CENTER = { lat: -34.9285, lng: 138.6007 };

const mapContainerStyle = {
  width: '100%',
  height: '580px',
  borderRadius: '1rem',
  overflow: 'hidden',
  boxShadow: '0 2px 24px rgba(0,0,0,0.08)'
};

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

export default function FoodTruckMap({ trucks }: { trucks: TruckWithMenu[] }) {
  // Center to first "here" truck or default
  const firstHere = trucks.find(t => t.isHere && t.lat && t.lng);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // You MUST set your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your env file!
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const center = firstHere
    ? { lat: firstHere.lat!, lng: firstHere.lng! }
    : DEFAULT_CENTER;

  // Auto-fit bounds to all visible trucks
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    const bounds = new window.google.maps.LatLngBounds();
    trucks.filter(t => t.isHere && t.lat && t.lng)
      .forEach(t => bounds.extend({ lat: t.lat!, lng: t.lng! }));
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 80);
  }, [isLoaded, trucks]);

  if (loadError) return <div>Error loading Google Maps.</div>;
  if (!isLoaded) return <div style={{ height: 480 }}>Loading Google Maps…</div>;

  return (
    <div style={mapContainerStyle} className="relative border border-primary/30">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={map => (mapRef.current = map)}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        }}
      >
        {trucks.filter(t => t.isHere && t.lat && t.lng).map(truck => (
          <Marker
            key={truck.id}
            position={{ lat: truck.lat!, lng: truck.lng! }}
            icon={{
              url: truck.isOpen
                ? '/foodtruck-here.png'
                : '/foodtruck-marker.png',
              scaledSize: new window.google.maps.Size(62, 62),
              anchor: new window.google.maps.Point(31, 61)
            }}
            onClick={() => setSelected(truck.id)}
          >
            {selected === truck.id && (
              <InfoWindow onCloseClick={() => setSelected(null)}>
                <div className="min-w-[225px] max-w-[280px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={truck.imageUrl || '/fallback-truck.jpg'}
                      width={46}
                      height={46}
                      alt={truck.name}
                      className="rounded-lg object-cover border"
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
                    {truck.todaysHours?.open && truck.todaysHours?.close
                      ? `${truck.todaysHours.open} – ${truck.todaysHours.close}`
                      : truck.operatingHoursSummary || <span className="italic">Hours not set</span>
                    }
                  </div>
                  <div className="mt-2 mb-1">
                    <span className="font-medium text-primary text-sm">Today's Menu:</span>
                    {truck.todaysMenuItems?.length ? (
                      <ul className="mt-1 flex flex-col gap-1">
                        {truck.todaysMenuItems.slice(0, 2).map(item => (
                          <li key={item.id} className="flex items-center gap-1 text-xs">
                            {item.imageUrl && (
                              <Image
                                src={item.imageUrl}
                                width={22}
                                height={22}
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
        ))}
      </GoogleMap>
      {/* Find Me Button */}
      <button
        className="absolute top-4 right-4 z-20 bg-white shadow-md rounded-full px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition"
        onClick={() => {
          if (navigator.geolocation && mapRef.current) {
            navigator.geolocation.getCurrentPosition(pos => {
              mapRef.current!.panTo({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
              // Optionally, add a marker for "you are here"
            });
          }
        }}
      >
        Find Me
      </button>
      <div className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-xl shadow-lg flex gap-2 items-center">
        <span className="font-bold text-base">Find Food Trucks Near You</span>
      </div>
    </div>
  );
}
