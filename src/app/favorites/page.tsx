'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconHeart, IconMapPin, IconStar, IconNavigation, IconClock, IconChevronRight, IconLoader2,
    IconHeartOff, IconExternalLink
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteTruck {
    id: string;
    name: string;
    cuisine: string;
    imageUrl?: string | null;
    isOpen?: boolean;
    address?: string | null;
    rating?: number | null;
    lat?: number | null;
    lng?: number | null;
}

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [favorites, setFavorites] = useState<FavoriteTruck[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?redirect=/favorites');
            return;
        }

        if (status === 'authenticated') {
            fetchFavorites();
        }
    }, [status, router]);

    const fetchFavorites = async () => {
        try {
            const res = await fetch('/api/user/favorites');
            if (res.ok) {
                const data = await res.json();
                setFavorites(data.trucks || []);
            }
        } catch {
            // Handle error silently
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (truckId: string) => {
        try {
            await fetch(`/api/user/favorites/${truckId}`, { method: 'DELETE' });
            setFavorites(prev => prev.filter(t => t.id !== truckId));
        } catch {
            // Handle error
        }
    };

    const openDirections = (truck: FavoriteTruck) => {
        if (truck.lat && truck.lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${truck.lat},${truck.lng}`, '_blank');
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Sort: Open first, then by name
    const sortedFavorites = [...favorites].sort((a, b) => {
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <IconHeart className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Favorites</h1>
                    </div>
                    <p className="text-slate-400">
                        {favorites.length} truck{favorites.length !== 1 ? 's' : ''} saved
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-2xl px-4">
                {sortedFavorites.length === 0 ? (
                    // Empty state
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <IconHeartOff className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
                        <p className="text-slate-400 mb-6">
                            Start exploring and save trucks you love
                        </p>
                        <Link href="/map">
                            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                                <IconMapPin className="mr-2 h-4 w-4" />
                                Explore Trucks
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    // Favorites list
                    <div className="space-y-3">
                        {sortedFavorites.map((truck, i) => (
                            <motion.div
                                key={truck.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all"
                            >
                                <Link href={`/trucks/${truck.id}`} className="flex items-center p-4">
                                    {/* Image */}
                                    <div className="w-16 h-16 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
                                        {truck.imageUrl ? (
                                            <img src={truck.imageUrl} alt={truck.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🚚</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 ml-4 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold truncate">{truck.name}</h3>
                                            <span className={cn(
                                                "px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0",
                                                truck.isOpen
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-slate-700 text-slate-400"
                                            )}>
                                                {truck.isOpen ? 'Open' : 'Closed'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 truncate">{truck.cuisine}</p>
                                        {truck.address && (
                                            <p className="text-xs text-slate-500 truncate mt-1">
                                                <IconMapPin className="inline w-3 h-3 mr-1" />
                                                {truck.address}
                                            </p>
                                        )}
                                    </div>

                                    <IconChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                </Link>

                                {/* Quick actions */}
                                <div className="flex border-t border-slate-700/50">
                                    <button
                                        onClick={() => openDirections(truck)}
                                        className="flex-1 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <IconNavigation className="w-4 h-4" />
                                        Directions
                                    </button>
                                    <div className="w-px bg-slate-700/50" />
                                    <button
                                        onClick={() => removeFavorite(truck.id)}
                                        className="flex-1 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <IconHeart className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
