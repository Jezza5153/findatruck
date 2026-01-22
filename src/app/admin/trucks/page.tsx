'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconTruck, IconSearch, IconFilter, IconCheckCircle, IconXCircle, IconAlertTriangle,
    IconMoreVertical, IconEye, IconBan, IconLoader2, IconExternalLink
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
import Link from 'next/link';

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

type FilterType = 'all' | 'verified' | 'pending' | 'flagged';

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
            setTrucks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch {
            // Handle error
        }
    };

    const filteredTrucks = trucks
        .filter(t => {
            if (filter === 'verified') return t.isVerified;
            if (filter === 'pending') return !t.isVerified;
            return true;
        })
        .filter(t =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.cuisine.toLowerCase().includes(search.toLowerCase())
        );

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <IconTruck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Trucks</h1>
                            <p className="text-slate-400">{trucks.length} registered</p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search trucks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700"
                            />
                        </div>
                        <div className="flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            {(['all', 'verified', 'pending'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                                        filter === f ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4">
                <div className="space-y-2">
                    {filteredTrucks.map((truck, i) => (
                        <motion.div
                            key={truck.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/30"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                                    🚚
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{truck.name}</span>
                                        {truck.isVerified ? (
                                            <IconCheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        ) : (
                                            <IconAlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                        )}
                                        {truck.isFeatured && (
                                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-yellow-500/20 text-yellow-400">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 truncate">{truck.cuisine}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "px-2 py-0.5 text-xs rounded-full",
                                    truck.isOpen ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
                                )}>
                                    {truck.isOpen ? 'Live' : 'Offline'}
                                </span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <IconMoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/trucks/${truck.id}`} className="flex items-center gap-2">
                                                <IconEye className="w-4 h-4" />
                                                View Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => updateTruck(truck.id, { isVerified: !truck.isVerified })}
                                            className="flex items-center gap-2"
                                        >
                                            <IconCheckCircle className="w-4 h-4" />
                                            {truck.isVerified ? 'Unverify' : 'Verify'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => updateTruck(truck.id, { isFeatured: !truck.isFeatured })}
                                            className="flex items-center gap-2"
                                        >
                                            <span>⭐</span>
                                            {truck.isFeatured ? 'Remove Featured' : 'Make Featured'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400 flex items-center gap-2">
                                            <IconBan className="w-4 h-4" />
                                            Suspend Truck
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </motion.div>
                    ))}

                    {filteredTrucks.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <IconTruck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>No trucks found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
