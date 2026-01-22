'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerClusterer, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Navigation, Truck, Crosshair, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TruckData {
    id: string;
    name: string;
    cuisine: string;
    lat?: number;
    lng?: number;
    isOpen?: boolean;
    rating?: number;
    imageUrl?: string;
    logoUrl?: string;
    pinIcon?: string;  // Custom pin icon URL
    locationUpdatedAt?: string;
}

interface TruckMapProps {
    trucks: TruckData[];
    center?: { lat: number; lng: number };
    onTruckSelect?: (truck: TruckData) => void;
    showCenterButton?: boolean;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = { lat: 52.3676, lng: 4.9041 }; // Amsterdam

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
        { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    ],
};

// Custom marker component with truck image
function TruckMarker({
    truck,
    onClick,
    isSelected
}: {
    truck: TruckData;
    onClick: () => void;
    isSelected: boolean;
}) {
    if (!truck.lat || !truck.lng) return null;

    return (
        <OverlayView
            position={{ lat: truck.lat, lng: truck.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
            <div
                onClick={onClick}
                className={`relative cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}`}
            >
                {/* Pin container */}
                <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
                    {/* Pin body */}
                    <div className={`
                        w-14 h-14 rounded-full overflow-hidden border-4 shadow-xl
                        ${truck.isOpen
                            ? 'border-emerald-500 shadow-emerald-500/30'
                            : 'border-gray-400 shadow-gray-400/30'
                        }
                        ${isSelected ? 'border-primary shadow-primary/50' : ''}
                    `}>
                        {truck.imageUrl || truck.logoUrl ? (
                            <img
                                src={truck.logoUrl || truck.imageUrl}
                                alt={truck.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${truck.isOpen ? 'bg-emerald-600' : 'bg-gray-500'}`}>
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Status indicator */}
                    <div className={`
                        absolute -bottom-1 left-1/2 -translate-x-1/2 
                        w-4 h-4 rounded-full border-2 border-white
                        ${truck.isOpen ? 'bg-emerald-500' : 'bg-gray-400'}
                    `} />

                    {/* Pin point */}
                    <div className={`
                        absolute -bottom-3 left-1/2 -translate-x-1/2 
                        w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] 
                        border-l-transparent border-r-transparent
                        ${truck.isOpen ? 'border-t-emerald-500' : 'border-t-gray-400'}
                        ${isSelected ? 'border-t-primary' : ''}
                    `} />
                </div>

                {/* Name label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                    <span className={`
                        px-2 py-1 rounded-full text-xs font-semibold shadow-lg
                        ${truck.isOpen
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-500 text-white'
                        }
                        ${isSelected ? 'bg-primary text-white' : ''}
                    `}>
                        {truck.name}
                    </span>
                </div>
            </div>
        </OverlayView>
    );
}

export function TruckMap({ trucks, center, onTruckSelect, showCenterButton = true }: TruckMapProps) {
    const [selectedTruck, setSelectedTruck] = useState<TruckData | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });

    // Filter trucks with valid coordinates
    const validTrucks = useMemo(() =>
        trucks.filter(t => t.lat && t.lng),
        [trucks]
    );

    const handleMarkerClick = useCallback((truck: TruckData) => {
        setSelectedTruck(truck);
        onTruckSelect?.(truck);

        // Pan to truck
        if (map && truck.lat && truck.lng) {
            map.panTo({ lat: truck.lat, lng: truck.lng });
        }
    }, [onTruckSelect, map]);

    const centerOnUser = useCallback(() => {
        setLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(loc);
                    if (map) {
                        map.panTo(loc);
                        map.setZoom(14);
                    }
                    setLocating(false);
                },
                () => {
                    setLocating(false);
                }
            );
        } else {
            setLocating(false);
        }
    }, [map]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);

        // Fit bounds to all markers
        if (validTrucks.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            validTrucks.forEach(truck => {
                if (truck.lat && truck.lng) {
                    bounds.extend({ lat: truck.lat, lng: truck.lng });
                }
            });
            map.fitBounds(bounds, 50);
        }
    }, [validTrucks]);

    if (loadError) {
        return (
            <Card className="h-full bg-slate-800/50 border-slate-700 flex items-center justify-center">
                <CardContent className="text-center text-red-400">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Failed to load map</p>
                </CardContent>
            </Card>
        );
    }

    if (!isLoaded) {
        return <Skeleton className="h-full w-full bg-slate-700 rounded-xl" />;
    }

    return (
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center || defaultCenter}
                zoom={12}
                options={mapOptions}
                onLoad={onLoad}
            >
                {/* Custom truck markers */}
                {validTrucks.map(truck => (
                    <TruckMarker
                        key={truck.id}
                        truck={truck}
                        onClick={() => handleMarkerClick(truck)}
                        isSelected={selectedTruck?.id === truck.id}
                    />
                ))}

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#FFC700',
                            fillOpacity: 1,
                            strokeColor: '#fff',
                            strokeWeight: 3,
                        }}
                        title="Your Location"
                    />
                )}

                {/* Info Window */}
                {selectedTruck && selectedTruck.lat && selectedTruck.lng && (
                    <InfoWindow
                        position={{ lat: selectedTruck.lat + 0.003, lng: selectedTruck.lng }}
                        onCloseClick={() => setSelectedTruck(null)}
                    >
                        <div className="p-3 min-w-[220px] bg-slate-800 text-white rounded-lg">
                            {selectedTruck.imageUrl && (
                                <img
                                    src={selectedTruck.imageUrl}
                                    alt={selectedTruck.name}
                                    className="w-full h-24 object-cover rounded-lg mb-3"
                                />
                            )}
                            <h3 className="font-bold text-lg">{selectedTruck.name}</h3>
                            <p className="text-sm text-slate-400">{selectedTruck.cuisine}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${selectedTruck.isOpen ? 'bg-emerald-500' : 'bg-gray-500'
                                    }`}>
                                    {selectedTruck.isOpen ? 'Open Now' : 'Closed'}
                                </span>
                                {selectedTruck.rating && (
                                    <span className="flex items-center gap-1 text-yellow-400 text-sm">
                                        <Star className="w-3 h-3 fill-current" />
                                        {selectedTruck.rating}
                                    </span>
                                )}
                            </div>
                            <Link href={`/trucks/${selectedTruck.id}`}>
                                <Button size="sm" className="w-full mt-3 bg-primary hover:bg-primary/90">
                                    View Menu & Details
                                </Button>
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Center on Location Button */}
            {showCenterButton && (
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                    <Button
                        onClick={centerOnUser}
                        disabled={locating}
                        className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg rounded-full w-12 h-12 p-0"
                        title="Center on my location"
                    >
                        {locating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Crosshair className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            )}

            {/* Map Legend */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 text-xs text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Open Now</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Closed</span>
                </div>
            </div>
        </div>
    );
}

export default TruckMap;
