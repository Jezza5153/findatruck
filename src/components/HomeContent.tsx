'use client';

import { getSafeImageUrl } from '@/lib/image-proxy';
import EnquiryFormModal from '@/components/EnquiryFormModal';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconSearch, IconTruck, IconArrowRight, IconCheckCircle,
  IconStar, IconMapPin
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

export default function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const truckGridRef = useRef<HTMLDivElement>(null);

  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null);
  const [enquiryTruck, setEnquiryTruck] = useState<{ id: string; name: string } | null>(null);
  const [showAllTrucks, setShowAllTrucks] = useState(false);

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

  // Build unique cuisine list with counts
  const cuisineCounts = trucks.reduce((acc, t) => {
    acc[t.cuisine] = (acc[t.cuisine] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const cuisineList = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Filter trucks
  const filteredTrucks = trucks
    .filter(truck => {
      if (cuisineFilter) return truck.cuisine === cuisineFilter;
      return true;
    })
    .filter(truck =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Sort: verified first, then has image, then alphabetical
  const sortedTrucks = [...filteredTrucks].sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1;
    if (!a.isVerified && b.isVerified) return 1;
    if (a.imageUrl && !b.imageUrl) return -1;
    if (!a.imageUrl && b.imageUrl) return 1;
    return a.name.localeCompare(b.name);
  });

  // Limit display on initial load
  const INITIAL_DISPLAY = typeof window !== 'undefined' && window.innerWidth < 768 ? 6 : 12;
  const displayedTrucks = showAllTrucks ? sortedTrucks : sortedTrucks.slice(0, INITIAL_DISPLAY);

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
              Browse {trucks.length || '50+'} trucks by cuisine. Enquire in 60 seconds. No account needed.
            </p>

            {/* Inline search bar */}
            <div className="mx-auto mt-6 max-w-lg">
              <div className="relative">
                <label htmlFor="hero-search" className="sr-only">
                  Search food trucks by name or cuisine
                </label>
                <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="hero-search"
                  placeholder="Search trucks by name or cuisine..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    scrollToGrid();
                  }}
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
                Browse All Trucks
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-orange-200 bg-white/88 px-8 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50 w-full sm:w-auto"
              >
                <Link href="#event-hire">
                  Hire for an Event
                  <IconArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
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

          {(searchTerm || cuisineFilter) && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setCuisineFilter(null); }}
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
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {sortedTrucks.length} truck{sortedTrucks.length !== 1 ? 's' : ''}
            {cuisineFilter ? ` · ${cuisineFilter}` : ''}
            {searchTerm ? ` · "${searchTerm}"` : ''}
          </p>
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

            {/* Show More / Show All */}
            {!showAllTrucks && sortedTrucks.length > INITIAL_DISPLAY && (
              <div className="mt-8 text-center">
                <Button
                  onClick={() => setShowAllTrucks(true)}
                  variant="outline"
                  size="lg"
                  className="rounded-full border-orange-200 px-8 py-6 font-semibold text-slate-700 hover:bg-orange-50"
                >
                  Show All {sortedTrucks.length} Trucks
                  <IconArrowRight className="h-4 w-4" />
                </Button>
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
                {searchTerm ? 'Try a different search' : 'Check back soon!'}
              </p>
              {(searchTerm || cuisineFilter) && (
                <Button
                  onClick={() => { setSearchTerm(''); setCuisineFilter(null); }}
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
            <h2 className="font-display text-3xl font-bold text-slate-950 sm:text-4xl">
              Hiring a food truck for your event?
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Tell us what you need and we'll reach out to the best trucks on your behalf.
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

            <div className="mt-8">
              <Button
                size="lg"
                onClick={() => setEnquiryTruck({ id: '', name: 'Event Enquiry' })}
                className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-8 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
              >
                Send Event Enquiry
                <IconArrowRight className="h-5 w-5" />
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
            Ready to find your food truck?
          </h2>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={scrollToGrid}
              className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 px-8 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500 w-full sm:w-auto"
            >
              Browse All Trucks
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-orange-200 bg-white px-8 py-6 text-base font-semibold text-slate-800 shadow-sm hover:bg-orange-50 w-full sm:w-auto"
            >
              <Link href="#event-hire">
                Hire for an Event
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
