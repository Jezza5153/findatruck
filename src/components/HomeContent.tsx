'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TruckMap } from '@/components/truck-map';
import {
  IconMapPin, IconStar, IconSearch, IconTruck, IconMap, IconList,
  IconNavigation, IconCheckCircle, IconLogIn, IconArrowRight, IconUser,
  IconGift, IconBell, IconSparkles
} from '@/components/ui/branded-icons';
import { cn } from '@/lib/utils';

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  isOpen?: boolean;
  address?: string;
  lat?: number;
  lng?: number;
  locationUpdatedAt?: string;
}

// Default fallback location (Adelaide CBD, South Australia)
const DEFAULT_LOCATION = { lat: -34.9285, lng: 138.6007 };

// Helper to get relative time
function getRelativeTime(dateString?: string): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

// Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

type FilterType = 'all' | 'open';

const EXPERIENCE_PILLARS = [
  {
    icon: IconMapPin,
    title: 'Live Adelaide Map',
    description: 'Track what is open now, spot nearby trucks fast, and jump straight into directions.',
  },
  {
    icon: IconGift,
    title: 'Check-In Rewards',
    description: 'Give regulars a reason to come back with loyalty-friendly discovery and repeat visits.',
  },
  {
    icon: IconBell,
    title: 'Fewer Missed Meals',
    description: 'Customers can stay close to favourites instead of guessing who is serving today.',
  },
];

export default function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  // Redirect logged-in owners/admins to their dashboards
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role;
      if (role === 'owner') {
        router.replace('/owner/dashboard');
      } else if (role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchTrucks();
    getUserLocation();
  }, []);

  const fetchTrucks = async () => {
    try {
      const res = await fetch('/api/trucks');
      const data = await res.json();
      if (data.success) {
        setTrucks(data.data);
      }
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationDenied(false);
        },
        () => {
          setLocationDenied(true);
          setUserLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      setLocationDenied(true);
      setUserLocation(DEFAULT_LOCATION);
    }
  };

  // Calculate distances from user to each truck
  const trucksWithDistance = trucks.map(truck => {
    let distance: number | null = null;
    if (userLocation && truck.lat && truck.lng) {
      distance = haversineKm(userLocation.lat, userLocation.lng, truck.lat, truck.lng);
    }
    return { ...truck, distance };
  });

  const filteredTrucks = trucksWithDistance
    .filter(truck => {
      if (filter === 'open') return truck.isOpen;
      return true;
    })
    .filter(truck =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Sort: open first, then by distance (nearest first) if GPS available
  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    // Within same open/closed group, sort by distance
    if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
    if (a.distance !== null) return -1;
    if (b.distance !== null) return 1;
    return 0;
  });

  // Near You: top 5 open trucks closest to user
  const nearbyTrucks = userLocation
    ? trucksWithDistance
      .filter(t => t.isOpen && t.distance !== null && t.distance < 50)
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
      .slice(0, 5)
    : [];

  const openTruckCount = trucks.filter(t => t.isOpen).length;
  const heroStats = [
    { label: 'Open right now', value: `${openTruckCount}+` },
    { label: 'Nearby picks', value: nearbyTrucks.length > 0 ? `${nearbyTrucks.length}` : 'Live' },
    { label: 'Coverage', value: 'Adelaide + SA' },
  ];

  return (
    <div className="ambient-shell min-h-screen">
      <section className="relative overflow-hidden px-4 pb-8 pt-6 sm:pb-10 sm:pt-8">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="container relative z-10 mx-auto">
          <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Live Food Truck Finder for Adelaide & South Australia
              </div>

              <div className="mt-6 inline-flex rounded-[30px] border border-white/70 bg-white/70 p-4 shadow-soft backdrop-blur">
                <Image
                  src="/logo.png"
                  alt="Food Truck Next 2 Me"
                  width={180}
                  height={120}
                  className="h-16 w-auto sm:h-20"
                  priority
                />
              </div>

              <h1 className="mt-6 max-w-4xl text-balance font-display text-5xl font-bold leading-[0.95] text-slate-950 sm:text-6xl lg:text-7xl">
                Find the food truck
                <span className="brand-gradient-text"> everyone wishes they found first.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-balance text-lg leading-8 text-slate-600 sm:text-xl">
                Track what is open now, browse menus before you commit, and get from craving to curbside faster across Adelaide and South Australia.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-7 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  <Link href="/map">
                    Open Live Map
                    <IconArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                {status !== 'authenticated' ? (
                  <>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full border-orange-200 bg-white/88 px-7 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50"
                    >
                      <Link href="/login">
                        <IconLogIn className="h-5 w-5" />
                        Sign In
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      className="rounded-full bg-slate-900 px-7 py-6 text-base font-semibold text-white hover:bg-slate-800"
                    >
                      <Link href="/signup">
                        <IconUser className="h-5 w-5" />
                        Join Free
                      </Link>
                    </Button>
                  </>
                ) : null}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="section-frame px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                      {stat.label}
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold text-slate-950">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="surface-panel overflow-hidden p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                    Start with what matters
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">
                    Search, filter, and switch views instantly
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                  <IconTruck className="h-4 w-4" />
                  {sortedTrucks.length} results
                </div>
              </div>

              {/* Search and Filters */}
              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <label htmlFor="home-truck-search" className="sr-only">
                      Search food trucks by name or cuisine
                    </label>
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="home-truck-search"
                      placeholder="Search trucks by name or cuisine..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded-full border-2 border-orange-100 bg-white py-6 pl-12 text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <div className="flex gap-1 rounded-full border-2 border-orange-100 bg-orange-50/80 p-1.5 shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setViewMode('list')}
                      aria-label="Show truck list"
                      aria-pressed={viewMode === 'list'}
                      title="Show truck list"
                      className={cn(
                        "rounded-full px-4",
                        viewMode === 'list' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-white hover:text-orange-700'
                      )}
                    >
                      <IconList className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setViewMode('map')}
                      aria-label="Show truck map"
                      aria-pressed={viewMode === 'map'}
                      title="Show truck map"
                      className={cn(
                        "rounded-full px-4",
                        viewMode === 'map' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-white hover:text-orange-700'
                      )}
                    >
                      <IconMap className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    { value: 'all', label: 'All Trucks', icon: IconTruck },
                    { value: 'open', label: 'Open Now', icon: IconCheckCircle },
                  ].map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFilter(f.value as FilterType)}
                      aria-pressed={filter === f.value}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all",
                        filter === f.value
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                          : "bg-orange-50 text-slate-700 hover:bg-orange-100"
                      )}
                    >
                      <f.icon className="h-4 w-4" />
                      {f.label}
                    </button>
                  ))}

                  {(searchTerm || filter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setFilter('all');
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      Reset filters
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {EXPERIENCE_PILLARS.map((pillar) => (
                  <div key={pillar.title} className="rounded-[24px] border border-orange-100 bg-orange-50/65 p-4">
                    <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
                      <pillar.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24">
        {locationDenied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-frame mb-5 flex items-center gap-3 px-4 py-4"
          >
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
              <IconNavigation className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700 sm:text-base">
              Enable location for sharper nearby results.
              <button
                type="button"
                onClick={getUserLocation}
                className="ml-2 font-semibold text-orange-700 underline decoration-orange-300 underline-offset-4 hover:text-orange-500"
              >
                Try location again
              </button>
            </p>
          </motion.div>
        )}

        {/* Near You Section */}
        {nearbyTrucks.length > 0 && !searchTerm && filter === 'all' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="section-frame mb-8 overflow-hidden p-5 sm:p-6"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20">
                  <IconNavigation className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                    Near You
                  </p>
                  <h2 className="font-display text-2xl font-bold text-slate-950">Open trucks closest to your location</h2>
                </div>
              </div>
              <Link href="/map" className="text-sm font-semibold text-orange-700 hover:text-orange-500">
                View on the live map
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {nearbyTrucks.map((truck) => (
                <Link key={truck.id} href={`/trucks/${truck.id}`}>
                  <div className="group h-full rounded-[24px] border border-orange-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100">
                        {truck.imageUrl ? (
                          <img src={truck.imageUrl} alt={truck.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-orange-600">{truck.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-display text-base font-bold text-slate-900 transition-colors group-hover:text-orange-600">{truck.name}</h3>
                        <p className="text-xs text-slate-500 truncate">{truck.cuisine}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Open Now</span>
                      {truck.distance !== null && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          {formatDistance(truck.distance)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                Browse trucks
              </p>
              <h2 className="font-display text-3xl font-bold text-slate-950">
                {filter === 'open' ? 'Serving right now' : 'Ready to explore'}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <IconTruck className="h-4 w-4 text-orange-500" />
              {sortedTrucks.length} truck{sortedTrucks.length !== 1 ? 's' : ''}
            </div>
          </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 bg-orange-100 rounded-3xl" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="section-frame h-[560px] overflow-hidden p-2">
            <TruckMap
              trucks={sortedTrucks}
              center={userLocation || undefined}
              onTruckSelect={(truck) => router.push(`/trucks/${truck.id}`)}
            />
          </div>
        ) : sortedTrucks.length > 0 ? (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {sortedTrucks.map((truck) => (
              <motion.div
                key={truck.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Link href={`/trucks/${truck.id}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden rounded-[28px] border border-orange-100 bg-white/96 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-2">
                            {truck.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-orange-500 font-semibold text-sm">{truck.cuisine}</span>
                        </div>
                      )}

                      {/* Status badge */}
                      {truck.isOpen !== undefined && (
                        <div className={cn(
                          "absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg",
                          truck.isOpen
                            ? 'bg-amber-300 text-slate-950'
                            : 'bg-slate-500 text-white'
                        )}>
                          {truck.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                            {truck.name}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium">{truck.cuisine}</p>
                        </div>
                        {truck.rating && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            <IconStar className="w-4 h-4 fill-current" />
                            <span className="text-sm font-bold">{truck.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        {truck.address && (
                          <p className="text-sm text-slate-400 flex items-center gap-1.5 min-w-0">
                            <IconMapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                            <span className="truncate">{truck.address}</span>
                          </p>
                        )}
                        {truck.distance !== null && (
                          <span className="ml-2 flex-shrink-0 whitespace-nowrap rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-600">
                            {formatDistance(truck.distance)}
                          </span>
                        )}
                      </div>

                      {truck.isOpen && truck.locationUpdatedAt && (
                        <p className="text-xs text-green-600 font-medium mb-3">
                          Updated {getRelativeTime(truck.locationUpdatedAt)}
                        </p>
                      )}

                      <div className="border-t border-orange-100 pt-3">
                        <span className="flex items-center justify-center gap-2 text-sm font-bold text-orange-600 group-hover:text-orange-500">
                          View Menu & Check In
                          <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="section-frame rounded-[28px] border-none shadow-none">
            <CardContent className="p-16 text-center">
              <div className="text-6xl mb-4">🚚</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                {filter === 'open' ? 'No trucks open right now' : 'No trucks found'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm ? 'Try a different search' : 'Check back soon!'}
              </p>
              {filter === 'open' && (
                <Button
                  onClick={() => setFilter('all')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-8"
                >
                  View All Trucks
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </section>

        <section className="mb-10 grid gap-4 lg:grid-cols-3">
          {EXPERIENCE_PILLARS.map((pillar) => (
            <div key={pillar.title} className="section-frame p-5 sm:p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-950">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                {pillar.description}
              </p>
            </div>
          ))}
        </section>

        {/* Owner CTA - Bottom */}
        {status !== 'authenticated' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="surface-panel-dark mt-12 overflow-hidden p-8 sm:p-10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-2xl shadow-lg">
                  <IconTruck className="h-8 w-8 text-brand-yellow" />
                </div>
                <div className="text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    For owners
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-bold">Own a food truck?</h3>
                  <p className="mt-2 max-w-xl text-white/75">
                    List your truck, update your live location, and show up when hungry customers are deciding where to go.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="lg"
                className="cta-sheen rounded-full bg-white px-8 py-6 font-bold text-slate-950 shadow-xl hover:bg-orange-50"
              >
                <Link href="/owner/signup">
                  Register Your Truck
                  <IconArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
