// src/components/FoodTruckMap.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import type { FoodTruck } from '@/lib/types';
import Image from 'next/image';
import { IconLocateFixed, IconMapPin, IconStar } from '@/components/ui/branded-icons';

// Marker clustering
import { MarkerClusterer } from '@googlemaps/markerclusterer';

// Centralized marker system
import {
  MARKER_ASSETS,
  MARKER_SIZES,
  getMarkerAsset,
  getMarkerSize,
  makeGoogleMapsIcon,
  type FindATruckMarkerState,
} from '@/lib/map/markers';
import { makeClusterRenderer } from '@/lib/map/clusterRenderer';
import { getNetworkSafety } from '@/lib/map/network';

// =============================================================================
// BRAND COLORS
// =============================================================================
const BRAND = {
  primary: '#FF6A00',
  accent: '#FFC700',
  muted: '#9CA3AF',
  dark: '#1F1F1F',
  background: '#FAFAF7',
} as const;

// Animation gating constants
const MIN_ZOOM_FOR_ANIMATION = 15;
const MAX_ANIMATED_MARKERS = 6;
const IDLE_ENABLE_DELAY_MS = 2000;

// Google Maps libraries - MUST be static to prevent infinite reloads
const GOOGLE_MAPS_LIBRARIES: ("places")[] = ['places'];

// =============================================================================
// MAP STYLING
// =============================================================================
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f5f3" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e0e0de" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "on" }] },
  { featureType: "poi", elementType: "geometry.fill", stylers: [{ color: "#eeeee8" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#c9e6f2" }] },
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#1f1f1f" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
];

const containerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '1rem',
  overflow: 'hidden',
  border: `1px solid ${BRAND.muted}40`,
  margin: '0 auto',
  background: BRAND.background,
};

const defaultCenter = { lat: -34.9285, lng: 138.6007 };

type Props = {
  trucks: FoodTruck[];
  userLocation?: { lat: number; lng: number } | null;
  showUser?: boolean;
  showCluster?: boolean;
};

// =============================================================================
// TRUCK INFO CARD
// =============================================================================
function TruckCard({ truck, onClose }: { truck: FoodTruck; onClose: () => void }) {
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-3 min-w-[210px] max-w-[270px] relative">
      <button
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 font-bold text-xl"
        onClick={onClose}
        aria-label="Close"
        style={{ background: 'none', border: 0, cursor: 'pointer' }}
      >×</button>
      <div className="flex items-center gap-2 mb-2">
        <Image
          src={truck.imageUrl || '/fallback-truck.jpg'}
          alt={truck.name}
          width={38}
          height={38}
          className="rounded-lg border object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="truncate font-bold text-base text-gray-900">{truck.name}</div>
          <div className="text-xs text-gray-500 truncate">{truck.cuisine}</div>
        </div>
      </div>
      {truck.rating && (
        <div className="flex gap-1 text-yellow-500 items-center text-xs">
          {[...Array(Math.round(truck.rating))].map((_, i) => (
            <IconStar key={i} className="w-4 h-4" fill="#FFC700" stroke="#FFC700" />
          ))}
          <span className="ml-1 font-semibold text-gray-700">{truck.rating?.toFixed(1)}</span>
        </div>
      )}
      <div className="text-xs text-gray-600 mt-1">{truck.address}</div>
      <div className="text-sm mt-2 text-gray-700 line-clamp-2">
        {truck.description || <span className="italic text-gray-400">No description yet.</span>}
      </div>
      <a
        href={`/trucks/${truck.id}`}
        className="block text-center mt-3 text-white font-bold rounded-lg py-2 transition-all"
        style={{ backgroundColor: BRAND.primary }}
      >
        View Menu
      </a>
    </div>
  );
}

// =============================================================================
// MAIN MAP COMPONENT (Imperative Marker Pattern + Slow Network Safety)
// =============================================================================
export default function FoodTruckMap({
  trucks,
  userLocation,
  showUser = true,
  showCluster = true,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(14);

  // Animation gating state
  const [userInteracted, setUserInteracted] = useState(false);
  const [networkSlow, setNetworkSlow] = useState(true); // Assume slow until proven otherwise
  const [viewportTick, setViewportTick] = useState(0); // Triggers animateIds recompute on viewport change

  // Persistent refs - markers survive re-renders
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersByIdRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const mapCenter = userLocation || defaultCenter;

  // Check network on mount (client-side only)
  useEffect(() => {
    const { isSlow } = getNetworkSafety();
    setNetworkSlow(isSlow);
  }, []);

  // Get selected truck for InfoWindow
  const selectedTruck = useMemo(
    () => trucks.find(t => t.id === selectedId) ?? null,
    [trucks, selectedId]
  );

  // Compute which markers are allowed to animate (selected + 6 nearest visible)
  const animateIds = useMemo(() => {
    const map = mapRef.current;
    if (!map) return new Set<string>();

    const bounds = map.getBounds();
    const center = map.getCenter();
    if (!bounds || !center) return new Set<string>();

    // Get visible trucks sorted by distance to center
    const candidates: { id: string; d: number }[] = [];
    for (const t of trucks) {
      if (typeof t.lat !== 'number' || typeof t.lng !== 'number') continue;

      const pos = new google.maps.LatLng(t.lat, t.lng);
      if (!bounds.contains(pos)) continue;

      // Distance squared (fast approximation)
      const d = Math.pow(pos.lat() - center.lat(), 2) + Math.pow(pos.lng() - center.lng(), 2);
      candidates.push({ id: t.id, d });
    }

    candidates.sort((a, b) => a.d - b.d);
    const ids = new Set(candidates.slice(0, MAX_ANIMATED_MARKERS).map(x => x.id));

    // Always include selected
    if (selectedId) ids.add(selectedId);

    return ids;
  }, [trucks, selectedId, viewportTick]);

  // Master animation allowed flag
  const animationAllowed = !networkSlow && userInteracted && zoom >= MIN_ZOOM_FOR_ANIMATION;

  // Compute marker state from truck data
  function computeState(truck: FoodTruck, isSelected: boolean): FindATruckMarkerState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isEvent = !!(truck as any)?.isEvent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isBusy = !!(truck as any)?.isBusy;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isFeatured = !!(truck as any)?.isFeatured;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isOpen = !!(truck as any)?.isOpen;
    const isClosed = !isOpen;

    return {
      isSelected,
      isEvent,
      isFeatured,
      isBusy,
      isOpen: isOpen && !isSelected,
      isClosed: isClosed && !isSelected,
    };
  }

  // Map load handler
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    // Track zoom
    setZoom(map.getZoom() ?? 14);
    map.addListener('zoom_changed', () => {
      const z = map.getZoom();
      if (typeof z === 'number') setZoom(z);
    });

    // Enable animation after user interaction
    const enableInteraction = () => setUserInteracted(true);
    map.addListener('dragstart', enableInteraction);
    map.addListener('click', enableInteraction);

    // Also enable after idle delay (covers passive users)
    setTimeout(() => setUserInteracted(true), IDLE_ENABLE_DELAY_MS);

    // Recompute animated markers when viewport settles after pan/zoom
    map.addListener('idle', () => setViewportTick(t => t + 1));

    // Init clusterer once
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: [],
        renderer: makeClusterRenderer(),
      });
    }
  };

  // Map unmount cleanup
  const handleMapUnmount = () => {
    clustererRef.current?.clearMarkers();
    clustererRef.current = null;

    markersByIdRef.current.forEach(m => m.setMap(null));
    markersByIdRef.current.clear();

    userMarkerRef.current?.setMap(null);
    userMarkerRef.current = null;

    mapRef.current = null;
  };

  // Effect: Create/update/remove markers
  useEffect(() => {
    const map = mapRef.current;
    const clusterer = clustererRef.current;
    if (!map || !clusterer) return;

    const markersById = markersByIdRef.current;
    const nextIds = new Set(trucks.map(t => t.id));

    // Remove markers that no longer exist
    for (const [id, marker] of Array.from(markersById.entries())) {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        markersById.delete(id);
      }
    }

    // Create or update markers
    for (const truck of trucks) {
      if (typeof truck.lat !== 'number' || typeof truck.lng !== 'number') continue;

      const isSelected = truck.id === selectedId;
      const state = computeState(truck, isSelected);

      // Per-marker animation: must be globally allowed + in animate set
      const canAnimate = animationAllowed && animateIds.has(truck.id);
      const asset = getMarkerAsset(state, { zoom, noAnimation: !canAnimate });
      const size = getMarkerSize(state);
      const icon = makeGoogleMapsIcon(asset, size);

      const existing = markersById.get(truck.id);

      if (!existing) {
        // Create new marker
        const marker = new google.maps.Marker({
          position: { lat: truck.lat, lng: truck.lng },
          icon,
          zIndex: isSelected ? 9999 : (truck.isOpen ? 100 : 50),
        });

        marker.addListener('click', () => setSelectedId(truck.id));
        markersById.set(truck.id, marker);
      } else {
        // Update existing marker in place
        existing.setPosition({ lat: truck.lat, lng: truck.lng });
        existing.setIcon(icon);
        existing.setZIndex(isSelected ? 9999 : (truck.isOpen ? 100 : 50));
      }
    }

    // Re-sync clusterer
    clusterer.clearMarkers();
    if (showCluster && markersById.size > 3) {
      clusterer.addMarkers(Array.from(markersById.values()));
    } else {
      markersById.forEach(marker => marker.setMap(map));
    }
  }, [trucks, selectedId, zoom, showCluster, animationAllowed, animateIds]);

  // Effect: User location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !showUser || !userLocation) {
      userMarkerRef.current?.setMap(null);
      return;
    }

    const size = MARKER_SIZES.user;

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        icon: makeGoogleMapsIcon(MARKER_ASSETS.user, size),
        zIndex: 200,
        title: 'You are here',
        map,
      });
    } else {
      userMarkerRef.current.setPosition(userLocation);
      userMarkerRef.current.setMap(map);
    }
  }, [showUser, userLocation]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-background rounded-xl">
        <span className="ml-4 text-lg text-muted-foreground font-medium">Loading Map…</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] rounded-xl shadow-sm border border-border bg-background">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={14}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        options={{
          styles: MAP_STYLE,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          clickableIcons: false,
          backgroundColor: BRAND.background,
          minZoom: 11,
          maxZoom: 18,
        }}
      >
        {/* Info popup */}
        {selectedTruck && selectedTruck.lat && selectedTruck.lng && (
          <InfoWindow
            position={{ lat: selectedTruck.lat, lng: selectedTruck.lng }}
            onCloseClick={() => setSelectedId(null)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -56),
              maxWidth: 320,
            }}
          >
            <TruckCard truck={selectedTruck} onClose={() => setSelectedId(null)} />
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating action buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          className="rounded-full shadow-lg p-3 flex items-center justify-center transition-colors"
          style={{ backgroundColor: BRAND.primary }}
          aria-label="Show all trucks"
          onClick={() => {
            if (!mapRef.current) return;
            const bounds = new window.google.maps.LatLngBounds();
            trucks.forEach(t => {
              if (typeof t.lat === 'number' && typeof t.lng === 'number')
                bounds.extend({ lat: t.lat, lng: t.lng });
            });
            if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 100);
          }}
        >
          <IconMapPin className="h-5 w-5 text-white" />
        </button>
        <button
          className="rounded-full bg-white shadow-lg p-3 border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Locate Me"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition(
              pos => mapRef.current?.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            );
          }}
        >
          <IconLocateFixed className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
