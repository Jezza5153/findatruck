'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TruckMap } from '@/components/truck-map';
import {
  MapPin, Star, Search, Truck, List, Map as MapIcon,
  Heart, Navigation, CheckCircle, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  distance?: string;
  locationUpdatedAt?: string;  // ISO timestamp
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

type FilterType = 'all' | 'open' | 'favorites';

export default function MapPage() {
  const { data: session } = useSession();
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filter, setFilter] = useState<FilterType>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    fetchTrucks();
    fetchFavorites();
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

  const fetchFavorites = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/user/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(new Set(data.trucks?.map((t: TruckData) => t.id) || []));
      }
    } catch {
      // Ignore
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
        (error) => {
          // Location access denied or error - use fallback
          console.log('Geolocation denied/failed:', error.message);
          setLocationDenied(true);
          setUserLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      // Geolocation not supported
      setLocationDenied(true);
      setUserLocation(DEFAULT_LOCATION);
    }
  };

  const toggleFavorite = async (truckId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) return;

    try {
      if (favorites.has(truckId)) {
        await fetch(`/api/user/favorites/${truckId}`, { method: 'DELETE' });
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(truckId);
          return next;
        });
      } else {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truckId }),
        });
        setFavorites(prev => new Set(prev).add(truckId));
      }
    } catch {
      // Handle error
    }
  };

  const openDirections = (truck: TruckData, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (truck.lat && truck.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${truck.lat},${truck.lng}`, '_blank');
    } else if (truck.address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(truck.address)}`, '_blank');
    }
  };

  const filteredTrucks = trucks
    .filter(truck => {
      if (filter === 'open') return truck.isOpen;
      if (filter === 'favorites') return favorites.has(truck.id);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-400" />
            Find Food Trucks
          </h1>
          <p className="text-slate-400">
            {sortedTrucks.filter(t => t.isOpen).length} trucks open now
          </p>
        </motion.div>

        {/* Location denied banner */}
        {locationDenied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3"
          >
            <Navigation className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              Location access denied. Showing trucks near Amsterdam.
              <button
                onClick={getUserLocation}
                className="ml-2 underline hover:text-amber-100"
              >
                Try again
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
                placeholder="Search by name or cuisine..."
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
              { value: 'favorites', label: 'Favorites', icon: Heart },
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

            {/* Reset Filters - visible when any filter is active */}
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                <span className="text-xs">✕</span>
                Reset filters
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
          <div className="h-[600px] rounded-xl overflow-hidden border border-slate-700">
            <TruckMap
              trucks={sortedTrucks}
              center={userLocation || undefined}
              onTruckSelect={(truck) => console.log('Selected:', truck.name)}
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

                      {/* Favorite button */}
                      {session?.user && (
                        <button
                          onClick={(e) => toggleFavorite(truck.id, e)}
                          className={cn(
                            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            favorites.has(truck.id)
                              ? "bg-pink-500 text-white"
                              : "bg-slate-900/70 text-slate-300 hover:bg-slate-900/90"
                          )}
                        >
                          <Heart className={cn(
                            "w-4 h-4",
                            favorites.has(truck.id) && "fill-current"
                          )} />
                        </button>
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

                      {/* Last updated - important for open trucks */}
                      {truck.isOpen && truck.locationUpdatedAt && (
                        <p className="text-xs text-slate-500 mb-3">
                          📍 Updated {getRelativeTime(truck.locationUpdatedAt)}
                        </p>
                      )}

                      {/* Quick actions */}
                      <div className="flex gap-2 pt-2 border-t border-slate-700/30">
                        <button
                          onClick={(e) => openDirections(truck, e)}
                          className="flex-1 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <Navigation className="w-3 h-3" />
                          Directions
                        </button>
                        <Link
                          href={`/trucks/${truck.id}`}
                          className="flex-1 py-2 text-xs text-primary hover:text-primary/80 bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Check In
                        </Link>
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
              {filter === 'favorites' ? (
                <>
                  <Heart className="w-20 h-20 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-2xl font-semibold mb-2">No favorites yet</h3>
                  <p className="text-slate-400 mb-4">
                    Tap the heart icon on trucks you love
                  </p>
                  <Button onClick={() => setFilter('all')} variant="outline" className="border-slate-600">
                    View All Trucks
                  </Button>
                </>
              ) : filter === 'open' ? (
                <>
                  <Truck className="w-20 h-20 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-2xl font-semibold mb-2">No trucks open</h3>
                  <p className="text-slate-400 mb-4">
                    Check back later or view all trucks
                  </p>
                  <Button onClick={() => setFilter('all')} variant="outline" className="border-slate-600">
                    View All Trucks
                  </Button>
                </>
              ) : (
                <>
                  <Search className="w-20 h-20 mx-auto mb-4 text-slate-500" />
                  <h3 className="text-2xl font-semibold mb-2">No trucks found</h3>
                  <p className="text-slate-400">
                    {searchTerm ? 'Try a different search term' : 'No food trucks available yet'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
