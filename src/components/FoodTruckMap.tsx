'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import Image from 'next/image';
import { Star, MapPin, CircleCheck, Clock, Utensils } from 'lucide-react';
import type { TruckWithMenu } from '@/lib/types';

const defaultPosition: LatLngExpression = [-34.9285, 138.6007];

const truckMarkerSVG = `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="56" height="56" rx="28" fill="#fff" fill-opacity="0.92"/><rect x="10" y="26" width="36" height="14" rx="4" fill="#64b867"/><rect x="34" y="14" width="12" height="14" rx="2" fill="#228be6"/><rect x="12" y="29" width="12" height="7" rx="2" fill="#fff"/><circle cx="18" cy="44" r="4" fill="#333"/><circle cx="38" cy="44" r="4" fill="#333"/></svg>`;
const truckHereMarkerSVG = `<svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="31" cy="31" r="31" fill="#fbe62f" fill-opacity="0.85"/><rect x="13" y="30" width="36" height="14" rx="4" fill="#fff176"/><rect x="37" y="18" width="12" height="14" rx="2" fill="#ffd60a"/><rect x="15" y="33" width="12" height="7" rx="2" fill="#fff"/><circle cx="21" cy="48" r="4" fill="#333"/><circle cx="41" cy="48" r="4" fill="#333"/></svg>`;

const svgToDataURL = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const truckIcon = new Icon({
  iconUrl: svgToDataURL(truckMarkerSVG),
  iconSize: [56, 56],
  iconAnchor: [28, 54],
  popupAnchor: [0, -52],
  className: 'drop-shadow-xl',
});

const hereIcon = new Icon({
  iconUrl: svgToDataURL(truckHereMarkerSVG),
  iconSize: [62, 62],
  iconAnchor: [31, 61],
  popupAnchor: [0, -60],
  className: 'animate-pulse shadow-2xl',
});

function RatingStars({ rating = 0, count = 0 }: { rating?: number, count?: number }) {
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

function FitMapToTrucks({ trucks }: { trucks: TruckWithMenu[] }) {
  const map = useMap();
  useEffect(() => {
    const trucksWithLoc = trucks.filter(t => t.isHere && t.lat && t.lng);
    if (!trucksWithLoc.length) return;
    const bounds = L.latLngBounds(trucksWithLoc.map(t => [t.lat!, t.lng!] as [number, number]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [trucks, map]);
  return null;
}

export default function FoodTruckMap({ trucks }: { trucks: TruckWithMenu[] }) {
  const firstHere = trucks.find(t => t.isHere && t.lat && t.lng);
  const mapCenter: LatLngExpression = firstHere
    ? [firstHere.lat!, firstHere.lng!]
    : defaultPosition;

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden shadow-xl border border-primary/30">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full z-0"
        style={{ minHeight: '580px' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> contributors'
        />
        <FitMapToTrucks trucks={trucks} />
        {trucks.filter(t => t.isHere && t.lat && t.lng).map((truck, idx) => (
          <Marker
            key={truck.id || idx}
            position={[truck.lat!, truck.lng!] as [number, number]}
            icon={truck.isOpen ? hereIcon : truckIcon}
            zIndexOffset={truck.isOpen ? 1000 : 500}
            eventHandlers={{
              add: (e: L.LeafletEvent) => {
                const marker = e.target as L.Marker;
                if (marker._icon) {
                  marker._icon.style.transition = 'transform 0.6s cubic-bezier(.2,1.7,.5,.86)';
                  marker._icon.style.transform = 'scale(0.6) translateY(-70px)';
                  setTimeout(() => {
                    marker._icon!.style.transform = 'scale(1) translateY(0)';
                  }, 50);
                }
              }
            }}
          >
            <Popup>
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
                      {truck.todaysMenuItems.slice(0, 2).map((item: any) => (
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
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute top-2 left-2 z-10 p-2 bg-white/90 rounded-xl shadow-lg flex gap-2 items-center">
        <Utensils className="text-primary w-5 h-5" />
        <span className="font-bold text-base">Find Food Trucks Near You</span>
      </div>
    </div>
  );
}
