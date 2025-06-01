'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MapPin, Clock4, Star } from 'lucide-react';

const openIcon = new L.Icon({
  iconUrl: '/truck-marker-open.svg',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -36],
});
const closedIcon = new L.Icon({
  iconUrl: '/truck-marker-closed.svg',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -36],
});
const userIcon = new L.Icon({
  iconUrl: '/user-marker.svg',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -18],
});

type Props = {
  trucks: FoodTruck[];
  userLocation?: { lat: number, lng: number };
  onTruckClick?: (truck: FoodTruck) => void;
};

function FitBounds({ trucks, userLocation }: Props) {
  const map = useMap();
  useEffect(() => {
    let points = trucks
      .filter(t => typeof t.lat === 'number' && typeof t.lng === 'number')
      .map(t => [t.lat as number, t.lng as number] as [number, number]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [trucks, userLocation, map]);
  return null;
}

export default function FoodTruckMap({
  trucks,
  userLocation,
  onTruckClick,
}: Props) {
  const mapRef = useRef<L.Map>(null);

  // Default center: central city
  const defaultCenter = { lat: -34.9285, lng: 138.6007 }; // Adelaide, AU

  return (
    <div className="w-full h-[65vh] rounded-xl overflow-hidden shadow border">
  <MapContainer
  center={defaultCenter}
  zoom={12}
  scrollWheelZoom
  className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Fit map to visible points */}
        <FitBounds trucks={trucks} userLocation={userLocation} />

        {/* Show user location */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Your Location</span>
                </div>
              </Popup>
            </Marker>
            <Circle center={userLocation} radius={2500} pathOptions={{ color: "#2563eb", fillColor: "#2563eb33", fillOpacity: 0.2 }} />
          </>
        )}

        {/* Truck markers */}
        {trucks.map(truck => (
          typeof truck.lat === 'number' && typeof truck.lng === 'number' && (
            <Marker
              key={truck.id}
              position={[truck.lat, truck.lng]}
              icon={truck.isOpen ? openIcon : closedIcon}
              eventHandlers={{
                click: () => onTruckClick?.(truck),
              }}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="font-bold text-lg flex items-center">
                    {truck.name}
                    {truck.isOpen
                      ? <span className="ml-2 text-green-600 text-xs font-semibold bg-green-50 rounded px-2 py-0.5">Open Now</span>
                      : <span className="ml-2 text-red-600 text-xs font-semibold bg-red-50 rounded px-2 py-0.5">Closed</span>
                    }
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{truck.cuisine}</div>
                  {truck.rating &&
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">{truck.rating.toFixed(1)}</span>
                    </div>
                  }
                  <div className="text-sm mt-2 line-clamp-2">{truck.description}</div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={`/trucks/${truck.id}`}>View Menu</a>
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
