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
  IconNavigation, IconCheckCircle, IconLogIn, IconChefHat, IconArrowRight, IconUser
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

type FilterType = 'all' | 'open';

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

  const filteredTrucks = trucks
    .filter(truck => {
      if (filter === 'open') return truck.isOpen;
      return true;
    })
    .filter(truck =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return 0;
  });

  const openTruckCount = trucks.filter(t => t.isOpen).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section - Bright & Vibrant */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400">
        {/* Fun background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">🌮</div>
          <div className="absolute top-20 right-20 text-6xl">🍔</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🍕</div>
          <div className="absolute bottom-20 right-10 text-5xl">🌭</div>
          <div className="absolute top-1/3 left-1/2 text-6xl">🍟</div>
        </div>

        <div className="container mx-auto px-4 py-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="inline-block bg-white rounded-3xl p-4 shadow-2xl shadow-orange-500/30">
                <Image
                  src="/logo.png"
                  alt="Food Truck Next 2 Me"
                  width={180}
                  height={120}
                  className="h-24 w-auto"
                  priority
                />
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
              <span className="text-slate-800">Find Your</span>{' '}
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Perfect</span>
              <br />
              <span className="text-slate-800">Street Food!</span>
            </h1>

            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto font-medium">
              🚚 {openTruckCount} trucks serving now • Discover amazing local eats near you!
            </p>

            {/* CTA Buttons */}
            {status !== 'authenticated' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white bg-white/20 text-slate-800 hover:bg-white/40 backdrop-blur-sm font-semibold px-8 py-6 rounded-full shadow-lg"
                  >
                    <IconLogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-6 rounded-full shadow-xl"
                  >
                    <IconUser className="w-5 h-5 mr-2" />
                    Join Free
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-16 fill-amber-50">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Location denied banner */}
        {locationDenied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-amber-100 border-2 border-amber-300 rounded-2xl flex items-center gap-3 shadow-sm"
          >
            <IconNavigation className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 font-medium">
              Enable location for better results!
              <button
                onClick={getUserLocation}
                className="ml-2 underline hover:text-amber-600 font-bold"
              >
                Allow location
              </button>
            </p>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search trucks by name or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white border-2 border-orange-200 text-slate-800 placeholder:text-slate-400 rounded-full py-6 shadow-sm focus:border-orange-400 focus:ring-orange-400"
              />
            </div>
            <div className="flex gap-1 bg-white rounded-full p-1.5 border-2 border-orange-200 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-full px-4",
                  viewMode === 'list' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-500 hover:bg-orange-100'
                )}
              >
                <IconList className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('map')}
                className={cn(
                  "rounded-full px-4",
                  viewMode === 'map' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-500 hover:bg-orange-100'
                )}
              >
                <IconMap className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 items-center">
            {[
              { value: 'all', label: 'All Trucks', icon: IconTruck, emoji: '🚚' },
              { value: 'open', label: 'Open Now', icon: IconCheckCircle, emoji: '✅' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as FilterType)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm",
                  filter === f.value
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                    : "bg-white text-slate-600 hover:bg-orange-100 border-2 border-orange-200"
                )}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            ))}

            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-red-100 text-red-600 border-2 border-red-200 hover:bg-red-200 transition-all whitespace-nowrap"
              >
                ✕ Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 bg-orange-100 rounded-3xl" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[500px] rounded-3xl overflow-hidden border-4 border-orange-200 shadow-xl">
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
                  <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden cursor-pointer h-full group rounded-3xl shadow-md">
                    <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative overflow-hidden">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-5xl mb-2">🚚</div>
                          <span className="text-orange-400 font-medium text-sm">Food Truck</span>
                        </div>
                      )}

                      {/* Status badge */}
                      {truck.isOpen !== undefined && (
                        <div className={cn(
                          "absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
                          truck.isOpen
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-500 text-white'
                        )}>
                          {truck.isOpen ? '🟢 Open Now' : 'Closed'}
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

                      {truck.address && (
                        <p className="text-sm text-slate-400 flex items-center gap-2 mb-3">
                          <IconMapPin className="w-4 h-4 text-orange-400" />
                          <span className="truncate">{truck.address}</span>
                        </p>
                      )}

                      {truck.isOpen && truck.locationUpdatedAt && (
                        <p className="text-xs text-green-600 font-medium mb-3">
                          📍 Updated {getRelativeTime(truck.locationUpdatedAt)}
                        </p>
                      )}

                      <div className="pt-3 border-t border-orange-100">
                        <span className="text-sm text-orange-600 font-bold flex items-center justify-center gap-2 group-hover:text-orange-500">
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
          <Card className="bg-white border-2 border-orange-100 rounded-3xl shadow-lg">
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

        {/* Owner CTA - Bottom */}
        {status !== 'authenticated' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 shadow-2xl shadow-orange-500/30"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl">
                  👨‍🍳
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold">Own a food truck?</h3>
                  <p className="text-white/80">List your truck and reach hungry customers today!</p>
                </div>
              </div>
              <Link href="/owner/signup">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-6 rounded-full shadow-xl"
                >
                  Register Your Truck
                  <IconArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
