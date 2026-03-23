'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconMapPin,
  IconStar,
  IconHeart,
  IconBell,
  IconChevronRight,
  IconTruck,
  IconArrowRight,
} from '@/components/ui/branded-icons';

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  isOpen?: boolean;
  address?: string;
}

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTrucks() {
      try {
        const res = await fetch('/api/trucks?featured=true');
        const data = await res.json();
        if (data.success) {
          setTrucks(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching trucks:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchTrucks();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="ambient-shell min-h-screen px-4 py-8">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-16 w-full rounded-[28px] bg-orange-100" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-32 rounded-[24px] bg-orange-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: IconMapPin, label: 'Find Trucks', href: '/map', description: 'Open live discovery', color: 'from-orange-500 to-amber-400' },
    { icon: IconStar, label: 'Featured', href: '/featured', description: 'Curated picks worth planning around', color: 'from-amber-500 to-orange-400' },
    { icon: IconHeart, label: 'Favorites', href: '/favorites', description: 'Revisit saved trucks fast', color: 'from-rose-500 to-orange-400' },
    { icon: IconBell, label: 'Notifications', href: '/customer/notifications', description: 'Stay close to updates that matter', color: 'from-slate-900 to-slate-700' },
  ];

  return (
    <div className="ambient-shell min-h-screen px-4 py-8">
      <div className="container mx-auto max-w-6xl space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel overflow-hidden p-6 sm:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconStar className="h-4 w-4 text-orange-500" />
                Customer dashboard
              </div>
              <h1 className="mt-5 font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Jump into what&apos;s open, revisit favorites, and move from browsing to curbside faster.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/map"
                  className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  Open Live Map
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/featured"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Explore Featured
                </Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best next move</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Live Map</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">See what is nearby before the queue builds.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Shortlist</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">{trucks.length}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Featured trucks ready to browse from your dashboard.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Mood</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Fast</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Designed for quicker decisions, not wandering clicks.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Link href={action.href} className="group block h-full">
                <Card className="section-frame h-full border-orange-100 bg-white/92 p-1 transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                  <CardContent className="p-5">
                    <div className={`inline-flex rounded-2xl bg-gradient-to-br ${action.color} p-3 text-white shadow-lg`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-5 font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                      {action.label}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{action.description}</p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                      Open
                      <IconChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Featured now</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Strong picks for your next stop</h2>
            </div>
            <Link href="/featured">
              <Button variant="ghost" className="text-slate-600 hover:bg-orange-50 hover:text-orange-700">
                View all
                <IconChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-64 rounded-[28px] bg-orange-100" />
              ))}
            </div>
          ) : trucks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trucks.map((truck) => (
                <Link key={truck.id} href={`/trucks/${truck.id}`} className="group block">
                  <Card className="overflow-hidden rounded-[28px] border border-orange-100 bg-white/96 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                      <IconTruck className="h-12 w-12 text-orange-400" />
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                            {truck.name}
                          </h3>
                          <p className="text-sm text-slate-500">{truck.cuisine}</p>
                        </div>
                        {truck.rating ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                            <IconStar className="h-4 w-4 fill-current" />
                            {truck.rating}
                          </div>
                        ) : null}
                      </div>
                      {truck.address ? (
                        <p className="flex items-center gap-1.5 text-sm text-slate-500">
                          <IconMapPin className="h-4 w-4 text-orange-500" />
                          <span className="truncate">{truck.address}</span>
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="section-frame rounded-[28px] border-none shadow-none">
              <CardContent className="p-12 text-center">
                <IconTruck className="mx-auto mb-4 h-16 w-16 text-orange-300" />
                <h3 className="text-xl font-semibold text-slate-900">No featured trucks yet</h3>
                <p className="mt-2 text-slate-500">Check back soon or jump straight into the live map.</p>
                <Link href="/map" className="mt-6 inline-flex items-center rounded-full bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
                  Explore the Map
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </div>
    </div>
  );
}
