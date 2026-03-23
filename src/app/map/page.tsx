'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TruckMap } from '@/components/truck-map';
import {
  IconArrowRight,
  IconCheckCircle,
  IconClock,
  IconHeart,
  IconList,
  IconMap as IconMapIcon,
  IconMapPin,
  IconNavigation,
  IconSearch,
  IconSparkles,
  IconStar,
  IconTruck,
  IconUsers,
} from '@/components/ui/branded-icons';
import { cn } from '@/lib/utils';
import { toJsonLd } from '@/lib/json-ld';

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

const DEFAULT_LOCATION = { lat: -34.9285, lng: 138.6007 };

const FAQ_ITEMS = [
  {
    question: 'How do I find food trucks near me on the map?',
    answer:
      'Allow location access when prompted and the live map will centre around your area. If location is unavailable, the map falls back to Adelaide so you can still browse trucks across South Australia.',
  },
  {
    question: 'Can I use the map without an account?',
    answer:
      'Yes. Customers can search, switch between map and list views, and explore truck profiles without creating an account.',
  },
  {
    question: 'Should I use the map or the hire page?',
    answer:
      'Use the map when you want to discover trucks that are out serving now. Use the hire page when you are planning an event and want a stronger booking path.',
  },
];

const QUICK_LINKS = [
  { href: '/featured', label: 'Featured picks' },
  { href: '/food-trucks', label: 'All locations & cuisines' },
  { href: '/hire-food-truck', label: 'Hire for an event' },
];

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
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
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
        setFavorites(new Set(data.trucks?.map((truck: TruckData) => truck.id) || []));
      }
    } catch {
      // Ignore favorites fetch failures on the public map.
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
      return;
    }

    setLocationDenied(true);
    setUserLocation(DEFAULT_LOCATION);
  };

  const toggleFavorite = async (truckId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!session?.user) return;

    try {
      if (favorites.has(truckId)) {
        await fetch(`/api/user/favorites/${truckId}`, { method: 'DELETE' });
        setFavorites((prev) => {
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
        setFavorites((prev) => new Set(prev).add(truckId));
      }
    } catch {
      // Ignore here to keep the public map resilient.
    }
  };

  const openDirections = (truck: TruckData, event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (truck.lat && truck.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${truck.lat},${truck.lng}`, '_blank');
    } else if (truck.address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(truck.address)}`, '_blank');
    }
  };

  const filteredTrucks = trucks
    .filter((truck) => {
      if (filter === 'open') return truck.isOpen;
      if (filter === 'favorites') return favorites.has(truck.id);
      return true;
    })
    .filter(
      (truck) =>
        truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1;
    if (!a.isOpen && b.isOpen) return 1;
    return 0;
  });

  const totalOpenCount = trucks.filter((truck) => truck.isOpen).length;
  const cuisineCount = new Set(trucks.map((truck) => truck.cuisine)).size;
  const activeFilterLabel =
    filter === 'favorites' ? 'favorites' : filter === 'open' ? 'open trucks' : 'all trucks';

  const emptyState =
    filter === 'favorites'
      ? {
          icon: IconHeart,
          title: 'No favorites yet',
          description: 'Save trucks you want to revisit and they will show up here for quicker return browsing.',
          actionLabel: 'View All Trucks',
          onAction: () => setFilter('all'),
        }
      : filter === 'open'
        ? {
            icon: IconTruck,
            title: 'No trucks open right now',
            description: 'Try again later or switch back to the full list to keep browsing truck profiles and locations.',
            actionLabel: 'View All Trucks',
            onAction: () => setFilter('all'),
          }
        : {
            icon: IconSearch,
            title: 'No trucks matched that search',
            description: searchTerm
              ? 'Try a different truck name or cuisine keyword.'
              : 'No food trucks are available to show here yet.',
            actionLabel: searchTerm ? 'Reset Search' : 'Explore Featured Trucks',
            onAction: searchTerm ? () => setSearchTerm('') : undefined,
          };

  const EmptyIcon = emptyState.icon;

  return (
    <div className="ambient-shell min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: 'Food Truck Map in Adelaide and South Australia',
                url: 'https://foodtrucknext2me.com/map',
                description: 'Live map for browsing food trucks in Adelaide and across South Australia.',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQ_ITEMS.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://foodtrucknext2me.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Food Truck Map',
                    item: 'https://foodtrucknext2me.com/map',
                  },
                ],
              },
            ]),
          }}
        />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel overflow-hidden p-6 sm:p-8"
        >
          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Real-time discovery
              </div>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                The map should make finding the right truck feel immediate, not messy.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                See what is open, search by cuisine, switch between map and list views, and keep moving without losing context.
                This is the live discovery engine for customers who want fast confidence.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/featured"
                  className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  See Featured Picks
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/hire-food-truck"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Hire for an Event
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-slate-600">
                <span className="rounded-full border border-orange-200 bg-white px-4 py-2">Open trucks rise to the top</span>
                <span className="rounded-full border border-orange-200 bg-white px-4 py-2">Search by name or cuisine</span>
                <span className="rounded-full border border-orange-200 bg-white px-4 py-2">No account needed to browse</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Open now</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">{totalOpenCount}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Live trucks currently marked as serving on the platform.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Coverage</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Adelaide</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Built for Adelaide discovery with broader South Australia coverage.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Cuisines</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">{cuisineCount}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Enough variety to turn the map into a real discovery habit.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex whitespace-nowrap rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {locationDenied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-frame mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-orange-100 p-2 text-orange-600">
                <IconNavigation className="h-5 w-5" />
              </div>
              <p className="text-sm leading-7 text-slate-600">
                Location access is off, so the map is showing trucks near Adelaide CBD by default. You can still search and browse normally.
              </p>
            </div>
            <button
              type="button"
              onClick={getUserLocation}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50"
            >
              Try location again
            </button>
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="section-frame mb-6 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Search and switch views</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Browse the live map your way.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Keep the interaction lightweight: search fast, filter by what matters, and flip between spatial browsing and a cleaner truck list.
              </p>
            </div>

            <div className="rounded-[24px] border border-orange-100 bg-white/92 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Current view</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {sortedTrucks.length} result{sortedTrucks.length !== 1 ? 's' : ''} across {activeFilterLabel}
                {searchTerm ? ` matching “${searchTerm}”` : ''}.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="relative">
              <label htmlFor="map-truck-search" className="sr-only">
                Search food trucks by name or cuisine
              </label>
              <IconSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                id="map-truck-search"
                placeholder="Search truck names or cuisines"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-12 rounded-2xl border-2 border-orange-200 bg-white pl-11 text-slate-800 placeholder:text-slate-400 focus:border-orange-400"
              />
            </div>

            <div className="inline-flex rounded-[24px] border-2 border-orange-200 bg-white p-1.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="Show truck list"
                aria-pressed={viewMode === 'list'}
                className={cn(
                  'rounded-[18px] px-4 py-2 text-sm font-semibold',
                  viewMode === 'list'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'text-slate-600 hover:text-orange-600'
                )}
              >
                <IconList className="mr-2 h-4 w-4" />
                List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setViewMode('map')}
                aria-label="Show truck map"
                aria-pressed={viewMode === 'map'}
                className={cn(
                  'rounded-[18px] px-4 py-2 text-sm font-semibold',
                  viewMode === 'map'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'text-slate-600 hover:text-orange-600'
                )}
              >
                <IconMapIcon className="mr-2 h-4 w-4" />
                Map
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[
              { value: 'all', label: 'All Trucks', icon: IconTruck },
              { value: 'open', label: 'Open Now', icon: IconCheckCircle },
              ...(session?.user ? [{ value: 'favorites', label: 'Favorites', icon: IconHeart }] : []),
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value as FilterType)}
                aria-pressed={filter === option.value}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                  filter === option.value
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'border border-orange-200 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-600'
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}

            {(searchTerm || filter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                Reset filters
              </button>
            )}
          </div>
        </motion.section>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Skeleton key={index} className="h-72 rounded-3xl bg-orange-100" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <section className="section-frame overflow-hidden p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Map view</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">See trucks in place before you commit to the click.</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-right">
                Open trucks still rise first in the underlying list, so the map and the list stay aligned while you browse.
              </p>
            </div>

            <div className="h-[560px] overflow-hidden rounded-[28px] border border-orange-200 bg-white shadow-soft">
              <TruckMap trucks={sortedTrucks} center={userLocation || undefined} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Link
                href="/featured"
                className="rounded-[24px] border border-orange-100 bg-white/95 px-5 py-5 transition-colors hover:bg-orange-50"
              >
                <p className="text-sm font-semibold text-orange-700">Curated picks</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-950">Need a stronger shortlist?</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Start from featured trucks if you want quality signals before you explore further.</p>
              </Link>
              <Link
                href="/hire-food-truck"
                className="rounded-[24px] border border-orange-100 bg-white/95 px-5 py-5 transition-colors hover:bg-orange-50"
              >
                <p className="text-sm font-semibold text-orange-700">Event bookings</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-950">Planning instead of browsing?</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Move into the hire funnel when you need trucks for an event, not just lunch discovery.</p>
              </Link>
              <Link
                href="/food-trucks"
                className="rounded-[24px] border border-orange-100 bg-white/95 px-5 py-5 transition-colors hover:bg-orange-50"
              >
                <p className="text-sm font-semibold text-orange-700">Browse all pages</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-950">Need more than live map results?</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Jump into suburb and cuisine landing pages when you want a broader browse than open-now discovery.</p>
              </Link>
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 px-5 py-5 md:col-span-3">
                <p className="text-sm font-semibold text-orange-700">Discovery tip</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-950">Search by cuisine first.</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Cuisine searches often narrow the map faster than suburb-based guessing.</p>
              </div>
            </div>
          </section>
        ) : sortedTrucks.length > 0 ? (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {sortedTrucks.map((truck) => (
              <motion.div
                key={truck.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Card className="group h-full overflow-hidden rounded-[30px] border border-orange-100 bg-white/96 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                  <Link href={`/trucks/${truck.id}`} className="block">
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-500 to-amber-400 text-3xl font-bold text-white shadow-lg">
                            {truck.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-orange-600">{truck.cuisine}</span>
                        </div>
                      )}

                      <div
                        className={cn(
                          'absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg',
                          truck.isOpen ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-700 backdrop-blur-sm'
                        )}
                      >
                        {truck.isOpen ? 'Open Now' : truck.cuisine}
                      </div>

                      {session?.user && (
                        <button
                          type="button"
                          onClick={(event) => toggleFavorite(truck.id, event)}
                          aria-label={
                            favorites.has(truck.id)
                              ? `Remove ${truck.name} from favorites`
                              : `Add ${truck.name} to favorites`
                          }
                          aria-pressed={favorites.has(truck.id)}
                          className={cn(
                            'absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all',
                            favorites.has(truck.id)
                              ? 'bg-pink-500 text-white'
                              : 'bg-white text-slate-400 hover:text-pink-500'
                          )}
                        >
                          <IconHeart className={cn('h-5 w-5', favorites.has(truck.id) && 'fill-current')} />
                        </button>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/trucks/${truck.id}`} className="block">
                          <h3 className="truncate font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                            {truck.name}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-500">{truck.cuisine}</p>
                        </Link>
                      </div>
                      {truck.rating && truck.rating > 0 ? (
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                          <IconStar className="h-4 w-4 fill-current" />
                          {truck.rating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>

                    {truck.description ? (
                      <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">{truck.description}</p>
                    ) : (
                      <p className="mt-4 text-sm leading-7 text-slate-500">
                        Open the truck profile for location detail, menu context, reviews, and the latest public info.
                      </p>
                    )}

                    <div className="mt-4 space-y-2">
                      {truck.address ? (
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                          <IconMapPin className="h-4 w-4 flex-shrink-0 text-orange-500" />
                          <span className="truncate">{truck.address}</span>
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        {truck.isOpen && truck.locationUpdatedAt ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5">
                            <IconClock className="h-4 w-4 text-orange-500" />
                            Updated {getRelativeTime(truck.locationUpdatedAt)}
                          </span>
                        ) : null}
                        {truck.distance ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">
                            <IconNavigation className="h-4 w-4 text-slate-500" />
                            {truck.distance}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-orange-100 pt-4">
                      <button
                        type="button"
                        onClick={(event) => openDirections(truck, event)}
                        className="flex-1 rounded-xl bg-orange-50 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-100 hover:text-orange-700"
                      >
                        <span className="inline-flex items-center gap-2">
                          <IconNavigation className="h-4 w-4" />
                          Directions
                        </span>
                      </button>
                      <Link
                        href={`/trucks/${truck.id}`}
                        className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow-md transition-colors hover:bg-orange-600"
                      >
                        <span className="inline-flex items-center gap-2">
                          View Profile
                          <IconArrowRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="section-frame rounded-[28px] border-none shadow-none">
            <CardContent className="p-12 text-center sm:p-16">
              <div className="mx-auto mb-4 inline-flex rounded-[28px] bg-orange-100 p-4 text-orange-600">
                <EmptyIcon className="h-10 w-10" />
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-950">{emptyState.title}</h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">{emptyState.description}</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {emptyState.onAction ? (
                  <Button
                    onClick={emptyState.onAction}
                    className="rounded-full bg-orange-500 px-6 text-white hover:bg-orange-600"
                  >
                    {emptyState.actionLabel}
                  </Button>
                ) : (
                  <Link
                    href="/featured"
                    className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                  >
                    {emptyState.actionLabel}
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href="/hire-food-truck"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Hire for an Event
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Use the platform better</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">The map is for live discovery. The rest of the site should keep momentum going.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Food Truck Next 2 Me works best when each public page has a clear role. The live map helps people find trucks
                that are serving now, the featured page gives a more curated first impression, and the hire page supports event
                planners who need a better booking path.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <Link
                  href="/featured"
                  className="rounded-[24px] border border-orange-100 bg-white/95 px-5 py-5 transition-colors hover:bg-orange-50"
                >
                  <p className="text-sm font-semibold text-orange-700">Featured trucks</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-950">Start from stronger signals</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Best for visitors who want curated picks instead of starting from the full list.</p>
                </Link>
                <Link
                  href="/hire-food-truck"
                  className="rounded-[24px] border border-orange-100 bg-white/95 px-5 py-5 transition-colors hover:bg-orange-50"
                >
                  <p className="text-sm font-semibold text-orange-700">Hire a food truck</p>
                  <p className="mt-1 font-display text-2xl font-bold text-slate-950">Move into event planning</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Better for weddings, corporate catering, and organised event enquiries.</p>
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Quick answers</p>
              <div className="mt-4 space-y-4">
                {FAQ_ITEMS.map((item) => (
                  <details key={item.question} className="rounded-[24px] border border-orange-100 bg-white/95 p-5">
                    <summary className="cursor-pointer list-none font-semibold text-slate-900">{item.question}</summary>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
              <div className="mt-4 rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-sm font-semibold text-orange-700">Customer journey</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Browse the map to discover what is nearby, open truck profiles to build trust, and use favorites when you want quicker return visits.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                  <IconUsers className="h-4 w-4" />
                  Designed for repeat discovery, not one-off clicks
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
