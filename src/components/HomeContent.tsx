'use client';

import { getSafeImageUrl } from '@/lib/image-proxy';
import EnquiryFormModal from '@/components/EnquiryFormModal';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconSearch, IconTruck, IconArrowRight, IconCheckCircle,
  IconStar, IconMapPin, IconChefHat, IconSparkles
} from '@/components/ui/branded-icons';
import { cn, scoreSearchMatch } from '@/lib/utils';

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
  contactEmail?: string;
  websiteUrl?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  phone?: string;
  ctaPhoneNumber?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
}

// Event type chips for the event hiring block
const EVENT_TYPES = [
  { label: 'Wedding', emoji: '💒' },
  { label: 'Corporate', emoji: '🏢' },
  { label: 'Party', emoji: '🎉' },
  { label: 'School', emoji: '🎓' },
  { label: 'Festival', emoji: '🎪' },
  { label: 'Market', emoji: '🛒' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Browse',
    description: 'Find trucks by cuisine or search by name. Real menus, real trucks.',
    emoji: '🔍',
  },
  {
    step: '2',
    title: 'Enquire',
    description: 'Hit "Get a Quote" — no account needed, no commitment.',
    emoji: '📋',
  },
  {
    step: '3',
    title: 'Connect',
    description: 'The truck gets your enquiry and responds within 24 hours.',
    emoji: '📱',
  },
];

const PATHWAYS = [
  {
    title: 'Find trucks fast',
    description: 'Search the directory, scan cuisines, and get to the right truck without friction.',
    cta: 'Browse trucks',
    icon: IconMapPin,
    accent: 'For hungry customers',
    action: 'browse' as const,
  },
  {
    title: 'Hire for an event',
    description: 'Move from “we need catering” to a stronger shortlist for weddings, markets, and corporate events.',
    cta: 'Plan an event',
    icon: IconChefHat,
    accent: 'For planners',
    href: '/hire-food-truck',
  },
  {
    title: 'List your truck',
    description: 'Show up where people are deciding, update your menu, and turn discovery into enquiries.',
    cta: 'List your truck',
    icon: IconTruck,
    accent: 'For owners',
    href: '/owner/signup',
  },
];

const OWNER_BENEFITS = [
  'Show up in front of local customers at the moment they are deciding.',
  'Manage menus, photos, and live locations from one cleaner owner workspace.',
  'Turn event interest and everyday discovery into more enquiries.',
];

const DIRECTORY_SURFACES = [
  {
    href: '/map',
    title: 'Live map',
    description: 'Best when someone wants what is open right now and nearby.',
    icon: IconMapPin,
    accent: 'Right now',
  },
  {
    href: '/featured',
    title: 'Featured trucks',
    description: 'Best when someone wants a stronger shortlist instead of a blank-slate search.',
    icon: IconSparkles,
    accent: 'Curated',
  },
  {
    href: '/food-trucks',
    title: 'Browse by location',
    description: 'Best when someone wants to explore suburbs, beaches, and cuisine pages with more intent.',
    icon: IconChefHat,
    accent: 'Deep browse',
  },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top rated' },
  { value: 'az', label: 'A-Z' },
] as const;

type SortMode = (typeof SORT_OPTIONS)[number]['value'];

const INITIAL_DISPLAY = 12;
const LOAD_MORE_STEP = 12;

export default function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const truckGridRef = useRef<HTMLDivElement>(null);

  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [enquiryTruck, setEnquiryTruck] = useState<{ id: string; name: string } | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY);

  // Redirect logged-in owners to their dashboard (admins can browse the public site)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role;
      if (role === 'owner') {
        router.replace('/owner/dashboard');
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchTrucks();
  }, []);

  useEffect(() => {
    setVisibleCount(INITIAL_DISPLAY);
  }, [searchTerm, cuisineFilter, sortMode]);

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

  // Build unique cuisine list with counts
  const cuisineCounts = trucks.reduce((acc, t) => {
    acc[t.cuisine] = (acc[t.cuisine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const cuisineList = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const totalOpenCount = trucks.filter((truck) => truck.isOpen).length;
  const featuredCount = trucks.filter((truck) => truck.isFeatured).length;
  const topCuisineHighlights = cuisineList.slice(0, 3);

  // Filter trucks
  const scoredTrucks = trucks
    .filter(truck => {
      if (cuisineFilter) return truck.cuisine === cuisineFilter;
      return true;
    })
    .map((truck) => ({
      truck,
      searchScore: scoreSearchMatch(searchTerm, [
        { value: truck.name, weight: 5 },
        { value: truck.cuisine, weight: 4 },
        { value: truck.address, weight: 3 },
        { value: truck.description, weight: 2 },
      ]),
    }))
    .filter(({ searchScore }) => searchScore >= 0);

  // Sort: verified first, then has image, then alphabetical
  const sortedTrucks = [...scoredTrucks].sort((a, b) => {
    if (searchTerm.trim() && b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;

    if (sortMode === 'rating') {
      const ratingDiff = (b.truck.rating ?? 0) - (a.truck.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
    }

    if (sortMode === 'az') {
      return a.truck.name.localeCompare(b.truck.name);
    }

    if (a.truck.isFeatured && !b.truck.isFeatured) return -1;
    if (!a.truck.isFeatured && b.truck.isFeatured) return 1;
    if (a.truck.isOpen && !b.truck.isOpen) return -1;
    if (!a.truck.isOpen && b.truck.isOpen) return 1;
    if (a.truck.isVerified && !b.truck.isVerified) return -1;
    if (!a.truck.isVerified && b.truck.isVerified) return 1;
    if (a.truck.imageUrl && !b.truck.imageUrl) return -1;
    if (!a.truck.imageUrl && b.truck.imageUrl) return 1;
    return a.truck.name.localeCompare(b.truck.name);
  }).map(({ truck }) => truck);

  const displayedTrucks = sortedTrucks.slice(0, visibleCount);
  const remainingCount = Math.max(sortedTrucks.length - displayedTrucks.length, 0);

  const scrollToGrid = () => {
    truckGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="ambient-shell min-h-screen">

      {/* ═══════════════════════════════════════════════════════════
          SECTION A — HERO (compact)
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 pb-6 pt-8 sm:pb-8 sm:pt-12">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="container relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mx-auto max-w-3xl text-balance font-display text-4xl font-bold leading-[1.1] text-slate-950 sm:text-5xl lg:text-6xl">
              Every food truck in Adelaide.{' '}
              <span className="brand-gradient-text">One place.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-balance text-lg leading-7 text-slate-600">
              Find trucks fast, hire for events, or list your truck and get discovered across Adelaide and South Australia.
            </p>

            {/* Inline search bar */}
            <div className="mx-auto mt-6 max-w-lg">
              <div className="relative">
                <label htmlFor="hero-search" className="sr-only">
                  Search food trucks by name, cuisine, or suburb
                </label>
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="hero-search"
                  placeholder="Search by truck, cuisine, or suburb..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-full border-2 border-orange-200 bg-white py-6 pl-12 pr-4 text-slate-800 shadow-soft placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={scrollToGrid}
                className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-8 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500 w-full sm:w-auto"
              >
                <IconTruck className="h-5 w-5" />
                Find Trucks Now
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-orange-200 bg-white/88 px-8 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50 w-full sm:w-auto"
              >
                <Link href="/hire-food-truck">
                  Hire for an Event
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/owner/signup" className="text-sm font-semibold text-orange-700 hover:text-orange-500">
                Own a food truck? List it free →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-4">
        <div className="section-frame p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                Choose your path
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">
                The fastest route should be obvious.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-right sm:text-base">
              Customers, event planners, and truck owners should all know exactly where to go next from the moment they land.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {PATHWAYS.map((path) => {
              const card = (
                <div className="group h-full rounded-[28px] border border-orange-100 bg-white/92 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                  <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600 shadow-sm">
                    <path.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                    {path.accent}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                    {path.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {path.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                    {path.cta}
                    <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );

              if (path.action === 'browse') {
                return (
                  <button
                    key={path.title}
                    type="button"
                    onClick={scrollToGrid}
                    className="text-left"
                  >
                    {card}
                  </button>
                );
              }

              return (
                <Link key={path.title} href={path.href || '/'}>
                  {card}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-4">
        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="section-frame p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                  Directory at scale
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">
                  A bigger directory needs clearer browse lanes.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-right sm:text-base">
                With 100 trucks, the best experience is helping people pick the right browse mode fast instead of making them sift through everything at once.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {DIRECTORY_SURFACES.map((surface) => (
                <Link
                  key={surface.href}
                  href={surface.href}
                  className="group rounded-[28px] border border-orange-100 bg-white/92 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft"
                >
                  <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600 shadow-sm">
                    <surface.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                    {surface.accent}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                    {surface.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {surface.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                    Open this view
                    <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[28px] border border-orange-100 bg-orange-50/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Directory size</p>
              <p className="mt-3 font-display text-4xl font-bold text-slate-950">{trucks.length}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Visible trucks customers can browse right now across Adelaide and South Australia.</p>
            </div>
            <div className="rounded-[28px] border border-orange-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Open now</p>
              <p className="mt-3 font-display text-4xl font-bold text-slate-950">{totalOpenCount}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use the map when live discovery matters more than broad browsing.</p>
            </div>
            <div className="rounded-[28px] border border-orange-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Top cuisines</p>
              <p className="mt-3 text-base font-semibold text-slate-950">
                {topCuisineHighlights.map((item) => item.name).join(' · ') || 'Growing fast'}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {featuredCount > 0 ? `${featuredCount} featured trucks currently help anchor the premium path.` : 'Use cuisine chips to collapse the list into a faster shortlist.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION B — CUISINE CHIPS BAR
          ═══════════════════════════════════════════════════════════ */}
      <div ref={truckGridRef} className="container mx-auto px-4 pt-2 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            type="button"
            onClick={() => setCuisineFilter(null)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border",
              !cuisineFilter
                ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                : "bg-white text-slate-600 border-orange-200 hover:border-orange-400 hover:text-orange-700"
            )}
          >
            All
            <span className={cn(
              "text-xs rounded-full px-1.5 py-0.5",
              !cuisineFilter ? "bg-white/20 text-white/80" : "bg-orange-100 text-orange-600"
            )}>{trucks.length}</span>
          </button>

          {cuisineList.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setCuisineFilter(cuisineFilter === c.name ? null : c.name)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border",
                cuisineFilter === c.name
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                  : "bg-white text-slate-600 border-orange-200 hover:border-orange-400 hover:text-orange-700"
              )}
            >
              {c.name}
              <span className={cn(
                "text-xs rounded-full px-1.5 py-0.5",
                cuisineFilter === c.name
                  ? "bg-white/20 text-white/80"
                  : "bg-orange-100 text-orange-600"
              )}>{c.count}</span>
            </button>
          ))}

          {(searchTerm || cuisineFilter || sortMode !== 'recommended') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCuisineFilter(null);
                setSortMode('recommended');
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 whitespace-nowrap hover:bg-slate-200 transition-colors"
            >
              ✕ Reset
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION C — TRUCK GRID (the product)
          ═══════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mb-6 rounded-[28px] border border-orange-100 bg-white/92 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                Browse the directory
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-base">
                {sortedTrucks.length} truck{sortedTrucks.length !== 1 ? 's' : ''} matched
                {cuisineFilter ? ` in ${cuisineFilter}` : ''}
                {searchTerm ? ` for “${searchTerm}”` : ''}
                .
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Showing {displayedTrucks.length} of {sortedTrucks.length}. Use sort and cuisine filters to keep the list manageable.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortMode(option.value)}
                  aria-pressed={sortMode === option.value}
                  className={cn(
                    'inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                    sortMode === option.value
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'border border-orange-200 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-700'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 bg-orange-100 rounded-3xl" />
            ))}
          </div>
        ) : sortedTrucks.length > 0 ? (
          <>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.04 } }
              }}
            >
              {displayedTrucks.map((truck) => (
                <motion.div
                  key={truck.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Card className="group h-full overflow-hidden rounded-[28px] border border-orange-100 bg-white/96 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                    {/* Card image — links to profile */}
                    <Link href={`/trucks/${truck.id}`}>
                      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                        {truck.imageUrl ? (
                          <img
                            src={getSafeImageUrl(truck.imageUrl) || ''}
                            alt={truck.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-2">
                              {truck.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-orange-500 font-semibold text-sm">{truck.cuisine}</span>
                          </div>
                        )}

                        {/* Verified badge removed — profiles are manually seeded, not owner-verified */}
                      </div>
                    </Link>

                    <CardContent className="p-5">
                      <Link href={`/trucks/${truck.id}`}>
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors truncate pr-2">
                            {truck.name}
                          </h3>
                          {truck.rating ? (
                            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex-shrink-0">
                              <IconStar className="w-3.5 h-3.5 fill-current" />
                              <span className="text-xs font-bold">{truck.rating}</span>
                            </div>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{truck.cuisine}</p>
                      </Link>

                      {/* PRIMARY CTA — "Get a Quote" */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEnquiryTruck({ id: truck.id, name: truck.name });
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:from-orange-600 hover:to-amber-500 transition-all hover:shadow-lg"
                      >
                        Get a Quote
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {sortedTrucks.length > INITIAL_DISPLAY && (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {remainingCount > 0 ? (
                  <Button
                    onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, sortedTrucks.length))}
                    variant="outline"
                    size="lg"
                    className="rounded-full border-orange-200 px-8 py-6 font-semibold text-slate-700 hover:bg-orange-50"
                  >
                    Load {Math.min(LOAD_MORE_STEP, remainingCount)} More Trucks
                    <IconArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}

                {displayedTrucks.length > INITIAL_DISPLAY ? (
                  <Button
                    onClick={() => setVisibleCount(INITIAL_DISPLAY)}
                    variant="ghost"
                    size="lg"
                    className="rounded-full px-6 py-6 font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Show Fewer
                  </Button>
                ) : null}

                {remainingCount > 0 ? (
                  <Link
                    href="/food-trucks"
                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                  >
                    Browse All via Locations
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            )}
          </>
        ) : (
          <Card className="section-frame rounded-[28px] border-none shadow-none">
            <CardContent className="p-16 text-center">
              <div className="text-6xl mb-4">🚚</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                No trucks found
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm ? 'Try a different truck, cuisine, or suburb search' : 'Check back soon!'}
              </p>
              {(searchTerm || cuisineFilter || sortMode !== 'recommended') && (
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setCuisineFilter(null);
                    setSortMode('recommended');
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-8"
                >
                  Reset Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION D — EVENT HIRING BLOCK
            ═══════════════════════════════════════════════════════════ */}
        <section id="event-hire" className="mt-16 rounded-[32px] bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 p-8 sm:p-12 border border-orange-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
              <IconSparkles className="h-4 w-4 text-orange-500" />
              Event bookings
            </div>
            <h2 className="font-display text-3xl font-bold text-slate-950 sm:text-4xl">
              Hiring a food truck for your event?
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Start with a quick brief here, or open the dedicated hire page for a fuller event-booking flow.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {EVENT_TYPES.map((et) => (
                <button
                  key={et.label}
                  type="button"
                  onClick={() => {
                    setEnquiryTruck({ id: '', name: `Event: ${et.label}` });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-orange-400 hover:bg-orange-50 hover:shadow-md"
                >
                  <span>{et.emoji}</span>
                  {et.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setEnquiryTruck({ id: '', name: 'Event Enquiry' })}
                className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-8 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500 w-full sm:w-auto"
              >
                Start Free Event Brief
                <IconArrowRight className="h-5 w-5" />
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-orange-200 bg-white px-8 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50 w-full sm:w-auto"
              >
                <Link href="/hire-food-truck">
                  Explore Hire Options
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION E — HOW IT WORKS
            ═══════════════════════════════════════════════════════════ */}
        <section className="mt-16">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-slate-950 sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="rounded-[24px] border border-orange-100 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
                  {step.emoji}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={scrollToGrid}
              className="text-sm font-semibold text-orange-600 hover:text-orange-500"
            >
              Start Browsing ↑
            </button>
          </div>
        </section>

        <section className="surface-panel-dark mt-16 overflow-hidden p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                For food truck owners
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Make the owner path feel like a no-brainer.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                If someone lands here with a truck to grow, they should instantly see the value: more visibility, cleaner presentation, and faster event interest.
              </p>
              <div className="mt-6 space-y-3">
                {OWNER_BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                    <IconCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-yellow" />
                    <p className="text-sm leading-7 text-white/78 sm:text-base">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-glow backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Next step
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold text-white">
                List your truck and start showing up where people search.
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
                Keep the funnel simple: create your owner account, shape your truck profile, and get ready to appear in front of customers and event planners.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  asChild
                  size="lg"
                  className="cta-sheen rounded-full bg-white px-8 py-6 font-semibold text-slate-950 hover:bg-orange-50"
                >
                  <Link href="/owner/signup">
                    List Your Truck
                    <IconArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-transparent px-8 py-6 font-semibold text-white hover:bg-white/[0.08]"
                >
                  <Link href="/owner/login">
                    Owner Login
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION F — TRUST BAR
            ═══════════════════════════════════════════════════════════ */}
        <section className="mt-16 rounded-[24px] bg-slate-50 px-6 py-5 border border-slate-200">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold text-slate-500">
            <span>{trucks.length} Trucks</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>{cuisineList.length} Cuisines</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Adelaide & SA</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>Free to Use</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span>No Account Needed</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            SECTION G — FOOTER CTA
            ═══════════════════════════════════════════════════════════ */}
        <section className="mt-16 mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">
            Ready to use the platform your way?
          </h2>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button
              size="lg"
              onClick={scrollToGrid}
              className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-8 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500 w-full sm:w-auto"
            >
              Find Trucks
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-orange-200 bg-white px-8 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50 w-full sm:w-auto"
            >
              <Link href="/hire-food-truck">
                Hire a Truck
                <IconArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-orange-200 bg-white px-8 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50 w-full sm:w-auto"
            >
              <Link href="/owner/signup">
                List Your Truck
                <IconArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* Enquiry Modal */}
      <EnquiryFormModal
        open={!!enquiryTruck}
        onOpenChange={(open) => { if (!open) setEnquiryTruck(null); }}
        truckId={enquiryTruck?.id || ''}
        truckName={enquiryTruck?.name || ''}
      />
    </div>
  );
}
