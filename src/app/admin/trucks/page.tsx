'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconTruck,
  IconSearch,
  IconCheckCircle,
  IconAlertTriangle,
  IconMoreVertical,
  IconEye,
  IconLoader2,
} from '@/components/ui/branded-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const SCOUT_EMAIL = 'scout@foodtrucknext2me.com';

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  ownerEmail?: string;
  isVerified: boolean;
  isOpen: boolean;
  isFeatured: boolean;
  subscriptionTier: string;
  createdAt: string;
}

type FilterType = 'all' | 'verified' | 'pending' | 'scouted';

export default function AdminTrucksPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login?redirect=/admin/trucks');
      return;
    }

    if (authStatus === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.replace('/');
        return;
      }
      fetchTrucks();
    }
  }, [authStatus, session, router]);

  const fetchTrucks = async () => {
    try {
      const res = await fetch('/api/admin/trucks');
      if (res.ok) {
        const data = await res.json();
        setTrucks(data.trucks || []);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const updateTruck = async (id: string, updates: Partial<TruckData>) => {
    try {
      await fetch(`/api/admin/trucks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      setTrucks((prev) => prev.map((truck) => (truck.id === id ? { ...truck, ...updates } : truck)));
    } catch {
      // Handle error
    }
  };

  const deleteTruck = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" permanently? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/trucks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrucks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      // Handle error
    }
  };

  const isScouted = (truck: TruckData) => truck.ownerEmail === SCOUT_EMAIL;

  const filteredTrucks = trucks
    .filter((truck) => {
      if (filter === 'verified') return truck.isVerified;
      if (filter === 'pending') return !truck.isVerified;
      if (filter === 'scouted') return isScouted(truck);
      return true;
    })
    .filter(
      (truck) =>
        truck.name.toLowerCase().includes(search.toLowerCase()) ||
        truck.cuisine.toLowerCase().includes(search.toLowerCase())
    );

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-orange-300" />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8 text-white">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <section className="role-panel-dark-strong p-6 sm:p-8">
          <div className="role-pill-dark mb-4">
            <IconTruck className="h-4 w-4 text-orange-300" />
            Truck directory control
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Trucks</h1>
              <p className="mt-2 text-white/60">{trucks.length} registered trucks across moderation, visibility, and featured status.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Verified</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{trucks.filter((truck) => truck.isVerified).length}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Live now</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{trucks.filter((truck) => truck.isOpen).length}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">Scouted</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{trucks.filter(isScouted).length}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <Input
                placeholder="Search trucks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="role-input-dark h-12 rounded-full pl-10"
              />
            </div>
            <div className="inline-flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {(['all', 'verified', 'pending', 'scouted'] as FilterType[]).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setFilter(filterKey)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors',
                    filter === filterKey ? 'bg-orange-500 text-slate-950' : 'text-white/60 hover:text-white'
                  )}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {filteredTrucks.map((truck, i) => (
            <motion.div
              key={truck.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="role-panel-dark flex items-center justify-between p-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/8 text-lg">
                  🚚
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">{truck.name}</span>
                    {truck.isVerified ? (
                      <IconCheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-300" />
                    ) : (
                      <IconAlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-300" />
                    )}
                    {truck.isFeatured ? (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                        Featured
                      </span>
                    ) : null}
                    {isScouted(truck) ? (
                      <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                        Scouted
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-sm text-white/55">{truck.cuisine}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
                    truck.isOpen ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/8 text-white/50'
                  )}
                >
                  {truck.isOpen ? 'Live' : 'Offline'}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0 text-white/60 hover:bg-white/10 hover:text-white">
                      <IconMoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-white/10 bg-[#151923] text-white">
                    <DropdownMenuItem asChild>
                      <Link href={`/trucks/${truck.id}`} className="flex items-center gap-2">
                        <IconEye className="h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateTruck(truck.id, { isVerified: !truck.isVerified })}
                      className="flex items-center gap-2"
                    >
                      <IconCheckCircle className="h-4 w-4" />
                      {truck.isVerified ? 'Unverify' : 'Verify'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateTruck(truck.id, { isFeatured: !truck.isFeatured })}
                      className="flex items-center gap-2"
                    >
                      <span>★</span>
                      {truck.isFeatured ? 'Remove Featured' : 'Make Featured'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteTruck(truck.id, truck.name)}
                      className="flex items-center gap-2 text-red-300 focus:text-red-200"
                    >
                      <span className="text-sm">🗑</span>
                      Delete Truck
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}

          {filteredTrucks.length === 0 ? (
            <div className="role-panel-dark py-12 text-center text-white/45">
              <IconTruck className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No trucks found</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
