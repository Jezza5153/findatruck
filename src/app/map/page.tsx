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
  IconMapPin, IconStar, IconSearch, IconTruck, IconList, IconMap as IconMapIcon,
  IconHeart, IconNavigation, IconCheckCircle, IconArrowRight
} from '@/components/ui/branded-icons';
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
  locationUpdatedAt?: string;
}

const DEFAULT_LOCATION = { lat: 52.3676, lng: 4.9041 };

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
          console.log('Geolocation denied/failed:', error.message);
          setLocationDenied(true);
          setUserLocation(DEFAULT_LOCATION);
        }
      );
    } else {
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

  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <IconMapPin className="w-6 h-6 text-white" />
            </div>
            Find Food Trucks
          </h1>
          <p className="text-slate-600">
            🚚 {sortedTrucks.filter(t => t.isOpen).length} trucks open now
          </p>
        </motion.div>

        {/* Location denied banner */}
        {locationDenied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-2xl flex items-center gap-3"
          >
            <IconNavigation className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Location access denied. Showing trucks near Amsterdam.
              <button
                onClick={getUserLocation}
                className="ml-2 underline hover:text-amber-900 font-medium"
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
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-white border-2 border-orange-200 text-slate-800 placeholder:text-slate-400 rounded-2xl h-12 focus:border-orange-400"
              />
            </div>
            <div className="flex gap-1 bg-white rounded-2xl p-1 border-2 border-orange-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-xl",
                  viewMode === 'list' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-500 hover:text-orange-600'
                )}
              >
                <IconList className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('map')}
                className={cn(
                  "rounded-xl",
                  viewMode === 'map' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'text-slate-500 hover:text-orange-600'
                )}
              >
                <IconMapIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 items-center">
            {[
              { value: 'all', label: 'All Trucks', icon: IconTruck, emoji: '🚚' },
              { value: 'open', label: 'Open Now', icon: IconCheckCircle, emoji: '✅' },
              { value: 'favorites', label: 'Favorites', icon: IconHeart, emoji: '❤️' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as FilterType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                  filter === f.value
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                    : "bg-white text-slate-600 hover:text-orange-600 border-2 border-orange-200 hover:border-orange-400"
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
                className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold bg-red-100 text-red-600 border-2 border-red-200 hover:bg-red-200 transition-colors whitespace-nowrap"
              >
                <span>✕</span>
                Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 bg-orange-100 rounded-3xl" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[600px] rounded-3xl overflow-hidden border-2 border-orange-200 shadow-lg">
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
                  <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden cursor-pointer h-full group rounded-3xl shadow-md">
                    <div className="h-36 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl mb-1">🚚</div>
                          <span className="text-orange-400 font-medium text-sm">Food Truck</span>
                        </div>
                      )}

                      {truck.isOpen !== undefined && (
                        <div className={cn(
                          "absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
                          truck.isOpen ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'
                        )}>
                          {truck.isOpen ? '🟢 Open Now' : 'Closed'}
                        </div>
                      )}

                      {session?.user && (
                        <button
                          onClick={(e) => toggleFavorite(truck.id, e)}
                          className={cn(
                            "absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg",
                            favorites.has(truck.id)
                              ? "bg-pink-500 text-white"
                              : "bg-white text-slate-400 hover:text-pink-500"
                          )}
                        >
                          <IconHeart className={cn(
                            "w-5 h-5",
                            favorites.has(truck.id) && "fill-current"
                          )} />
                        </button>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
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
                        <p className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                          <IconMapPin className="w-4 h-4 text-orange-400" />
                          <span className="truncate">{truck.address}</span>
                        </p>
                      )}

                      {truck.isOpen && truck.locationUpdatedAt && (
                        <p className="text-xs text-slate-400 mb-3">
                          📍 Updated {getRelativeTime(truck.locationUpdatedAt)}
                        </p>
                      )}

                      <div className="flex gap-2 pt-3 border-t border-orange-100">
                        <button
                          onClick={(e) => openDirections(truck, e)}
                          className="flex-1 py-2.5 text-sm text-slate-600 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <IconNavigation className="w-4 h-4" />
                          Directions
                        </button>
                        <Link
                          href={`/trucks/${truck.id}`}
                          className="flex-1 py-2.5 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors flex items-center justify-center gap-2 font-bold shadow-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconCheckCircle className="w-4 h-4" />
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
          <Card className="bg-white border-2 border-orange-100 rounded-3xl shadow-lg">
            <CardContent className="p-16 text-center">
              {filter === 'favorites' ? (
                <>
                  <div className="text-6xl mb-4">❤️</div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">No favorites yet</h3>
                  <p className="text-slate-500 mb-4">
                    Tap the heart icon on trucks you love
                  </p>
                  <Button onClick={() => setFilter('all')} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                    View All Trucks
                  </Button>
                </>
              ) : filter === 'open' ? (
                <>
                  <div className="text-6xl mb-4">🚚</div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">No trucks open</h3>
                  <p className="text-slate-500 mb-4">
                    Check back later or view all trucks
                  </p>
                  <Button onClick={() => setFilter('all')} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                    View All Trucks
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">No trucks found</h3>
                  <p className="text-slate-500">
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
