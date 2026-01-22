'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TruckMap } from '@/components/truck-map';
import {
  MapPin, Star, Search, Truck, List, Map as MapIcon,
  Heart, Navigation, CheckCircle, LogIn, ChefHat, ArrowRight, User
} from 'lucide-react';
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

// Default fallback location (Amsterdam center)
const DEFAULT_LOCATION = { lat: 52.3676, lng: 4.9041 };

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

export default function HomePage() {
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
      // Customers stay on this page to find trucks
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

  // Sort: Open first
  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return 0;
  });

  const openTruckCount = trucks.filter(t => t.isOpen).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Header - Compact */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  🚚 Trucks Near You
                </span>
              </h1>
              <p className="text-slate-400 mt-1">
                {openTruckCount} trucks open now • Discover delicious street food
              </p>
            </div>

            {/* Auth buttons for non-logged-in users */}
            {status !== 'authenticated' && (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                    <User className="w-4 h-4 mr-2" />
                    Join Free
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Location denied banner */}
        {locationDenied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3"
          >
            <Navigation className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              Enable location for better results.
              <button
                onClick={getUserLocation}
                className="ml-2 underline hover:text-amber-100"
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
          className="space-y-4 mb-6"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search trucks by name or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-slate-700 text-white' : 'text-slate-400'}
              >
                <MapIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 items-center">
            {[
              { value: 'all', label: 'All Trucks', icon: Truck },
              { value: 'open', label: 'Open Now', icon: CheckCircle },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as FilterType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  filter === f.value
                    ? "bg-primary text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                )}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </button>
            ))}

            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                <span className="text-xs">✕</span>
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 bg-slate-700 rounded-xl" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[500px] rounded-xl overflow-hidden border border-slate-700">
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
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all hover:scale-[1.02] overflow-hidden cursor-pointer h-full group">
                    <div className="h-36 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <Truck className="w-12 h-12 text-slate-500" />
                      )}

                      {/* Status badge */}
                      {truck.isOpen !== undefined && (
                        <div className={cn(
                          "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold",
                          truck.isOpen ? 'bg-green-500/90 text-white' : 'bg-slate-600/90 text-slate-300'
                        )}>
                          {truck.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                            {truck.name}
                          </h3>
                          <p className="text-sm text-slate-400">{truck.cuisine}</p>
                        </div>
                        {truck.rating && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{truck.rating}</span>
                          </div>
                        )}
                      </div>

                      {truck.address && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{truck.address}</span>
                        </p>
                      )}

                      {truck.isOpen && truck.locationUpdatedAt && (
                        <p className="text-xs text-slate-500 mb-3">
                          📍 Updated {getRelativeTime(truck.locationUpdatedAt)}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-700/30">
                        <span className="text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1">
                          View Menu & Check In
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-16 text-center">
              <Truck className="w-20 h-20 mx-auto mb-4 text-slate-500" />
              <h3 className="text-2xl font-semibold mb-2">
                {filter === 'open' ? 'No trucks open right now' : 'No trucks found'}
              </h3>
              <p className="text-slate-400 mb-4">
                {searchTerm ? 'Try a different search' : 'Check back soon!'}
              </p>
              {filter === 'open' && (
                <Button onClick={() => setFilter('all')} variant="outline" className="border-slate-600 bg-slate-700/50 text-slate-300">
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
            className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Own a food truck?</h3>
                  <p className="text-sm text-slate-400">List your truck and reach hungry customers</p>
                </div>
              </div>
              <Link href="/owner/signup">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                  Register Your Truck
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
