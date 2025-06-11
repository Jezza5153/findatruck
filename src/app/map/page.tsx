'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { LocateFixed, RefreshCw, Filter, MapPin, Star, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { FoodTruck, MenuItem } from '@/lib/types';
import Image from 'next/image';
import AnimatedLoader from '@/components/AnimatedLoader';

// Dynamically import map with SSR off
const FoodTruckMap = dynamic(() => import('@/components/FoodTruckMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatedLoader />
    </div>
  ),
});

// ===== FilterBar component =====
function FilterBar({
  cuisines,
  value,
  onChange,
  onLocate,
  onReset,
  onRefresh,
  isLoading,
}: {
  cuisines: string[];
  value: {
    cuisine: string;
    openNow: boolean;
    search: string;
  };
  onChange: (v: Partial<typeof value>) => void;
  onLocate: () => void;
  onReset: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed left-1/2 top-6 z-30 -translate-x-1/2 w-[96vw] max-w-2xl rounded-2xl bg-white/95 border border-cyan-100 shadow-lg flex flex-wrap items-center gap-3 px-5 py-3 backdrop-blur-2xl transition-all">
      <Filter className="text-cyan-400" />
      <input
        type="text"
        placeholder="Search trucks or cuisines…"
        className="flex-1 rounded-md px-3 py-2 text-sm border border-cyan-100 focus:outline-none focus:border-cyan-400"
        value={value.search}
        onChange={e => onChange({ search: e.target.value })}
        aria-label="Search trucks"
      />
      <select
        className="rounded-md px-3 py-2 text-sm border border-cyan-100 bg-white focus:outline-none"
        value={value.cuisine}
        onChange={e => onChange({ cuisine: e.target.value })}
        aria-label="Filter by cuisine"
      >
        <option value="">All cuisines</option>
        {cuisines.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
        <input
          type="checkbox"
          checked={value.openNow}
          onChange={e => onChange({ openNow: e.target.checked })}
        />
        Open Now
      </label>
      <Button variant="ghost" className="px-2" aria-label="Locate Me" onClick={onLocate}>
        <LocateFixed className="text-cyan-400" />
      </Button>
      <Button variant="ghost" className="px-2" aria-label="Refresh" onClick={onRefresh} disabled={isLoading}>
        <RefreshCw className={`text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      <Button variant="ghost" className="px-2" aria-label="Reset filters" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}

// ===== Main Map Page =====
export default function MapPage() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [filtered, setFiltered] = useState<FoodTruck[]>([]);
  const [filters, setFilters] = useState({ cuisine: '', openNow: false, search: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const lastRefresh = useRef(Date.now());

  // Auto-refresh every 2.5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 150000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // Fetch trucks
  const fetchTrucks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'trucks'));
      const raw: FoodTruck[] = snap.docs.map(doc => {
        const data = doc.data() ?? {};
        // Ensure ALL required FoodTruck fields exist
        return {
          id: doc.id,
          name: data.name || 'Unnamed Truck',
          cuisine: data.cuisine || 'Unknown Cuisine',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          imagePath: data.imagePath || '',
          imageGallery: Array.isArray(data.imageGallery) ? data.imageGallery : [],
          ownerUid: data.ownerUid || '',
          address: data.address || '',
          lat: typeof data.lat === 'number' ? data.lat : undefined,
          lng: typeof data.lng === 'number' ? data.lng : undefined,
          operatingHoursSummary: data.operatingHoursSummary || '',
          isOpen: typeof data.isOpen === 'boolean' ? data.isOpen : false,
          isVisible: typeof data.isVisible === 'boolean' ? data.isVisible : true,
          currentLocation: data.currentLocation,
          todaysMenu: Array.isArray(data.todaysMenu) ? data.todaysMenu : [],
          todaysHours: data.todaysHours,
          regularHours: data.regularHours,
          specialHours: data.specialHours,
          isTruckOpenOverride: data.isTruckOpenOverride ?? null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          rating: typeof data.rating === 'number' ? data.rating : undefined,
          numberOfRatings: typeof data.numberOfRatings === 'number' ? data.numberOfRatings : undefined,
          features: Array.isArray(data.features) ? data.features : [],
          socialMediaLinks: data.socialMediaLinks || {},
          websiteUrl: data.websiteUrl || '',
          contactEmail: data.contactEmail || '',
          phone: data.phone || '',
          isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : false,
          subscriptionTier: data.subscriptionTier || 'free',
          isFavorite: typeof data.isFavorite === 'boolean' ? data.isFavorite : false,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          distance: data.distance || '',
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
        } as FoodTruck;
      });
      setTrucks(raw);
    } catch (err: any) {
      setError('Could not load trucks');
      toast({ title: 'Failed loading trucks', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  // Cuisine options (dynamic)
  const cuisineOptions = useMemo(() => {
    const set = new Set<string>();
    trucks.forEach(truck => {
      if (truck.cuisine) set.add(truck.cuisine);
    });
    return Array.from(set).sort();
  }, [trucks]);

  // Filters
  useEffect(() => {
    let result = trucks;
    if (filters.cuisine) {
      result = result.filter(truck => truck.cuisine?.toLowerCase() === filters.cuisine.toLowerCase());
    }
    if (filters.openNow) {
      result = result.filter(truck => truck.isOpen);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        truck =>
          truck.name?.toLowerCase().includes(q) ||
          truck.cuisine?.toLowerCase().includes(q) ||
          truck.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [trucks, filters]);

  // Locate me
  function handleLocate() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast({ title: "Location denied", description: "Can't center map to you." })
      );
    }
  }

  function handleReset() {
    setFilters({ cuisine: '', openNow: false, search: '' });
  }
  function handleRefresh() {
    if (Date.now() - lastRefresh.current > 5000) {
      fetchTrucks();
      lastRefresh.current = Date.now();
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      {/* Floating filter/search bar */}
      <FilterBar
        cuisines={cuisineOptions}
        value={filters}
        onChange={f => setFilters(prev => ({ ...prev, ...f }))}
        onLocate={handleLocate}
        onReset={handleReset}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      {/* Map */}
      <div className="pt-28 pb-8 px-0 w-full max-w-[100vw] mx-auto">
        <FoodTruckMap
          trucks={filtered}
          userLocation={userLoc}
          showUser={!!userLoc}
          showCluster={filtered.length > 10}
        />
        {!isLoading && !filtered.length && (
          <div className="absolute left-1/2 top-[46vh] -translate-x-1/2 flex flex-col items-center text-cyan-900">
            <Utensils className="w-16 h-16 mb-2 text-cyan-200/60" />
            <div className="font-bold text-xl">No food trucks found</div>
            <div className="text-xs text-cyan-700/70">Try different filters or check back later.</div>
          </div>
        )}
        {isLoading && <AnimatedLoader />}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>
    </div>
  );
}
