'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconHeart, IconMapPin, IconStar, IconNavigation, IconChevronRight, IconLoader2
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
            <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <IconLoader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading favorites...</p>
                </div>
            </div>
        );
    }

    const sortedFavorites = [...favorites].sort((a, b) => {
        if (a.isOpen && !b.isOpen) return -1;
        if (!a.isOpen && b.isOpen) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                            <IconHeart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">My Favorites ❤️</h1>
                            <p className="text-slate-500">
                                {favorites.length} truck{favorites.length !== 1 ? 's' : ''} saved
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-2xl px-4">
                {sortedFavorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="bg-white border-2 border-orange-100 rounded-3xl shadow-lg">
                            <CardContent className="text-center py-16">
                                <div className="text-6xl mb-4">💔</div>
                                <h2 className="text-xl font-bold text-slate-700 mb-2">No favorites yet</h2>
                                <p className="text-slate-500 mb-6">
                                    Start exploring and save trucks you love!
                                </p>
                                <Link href="/map">
                                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full px-6">
                                        <IconMapPin className="mr-2 h-4 w-4" />
                                        Explore Trucks
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {sortedFavorites.map((truck, i) => (
                            <motion.div
                                key={truck.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-3xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                                    <Link href={`/trucks/${truck.id}`} className="flex items-center p-4">
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex-shrink-0 overflow-hidden">
                                            {truck.imageUrl ? (
                                                <img src={truck.imageUrl} alt={truck.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">🚚</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 ml-4 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-800 truncate">{truck.name}</h3>
                                                <span className={cn(
                                                    "px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0",
                                                    truck.isOpen
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {truck.isOpen ? '🟢 Open' : 'Closed'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium truncate">{truck.cuisine}</p>
                                            {truck.address && (
                                                <p className="text-xs text-slate-400 truncate mt-1 flex items-center gap-1">
                                                    <IconMapPin className="w-3 h-3 text-orange-400" />
                                                    {truck.address}
                                                </p>
                                            )}
                                        </div>

                                        <IconChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    </Link>

                                    {/* Quick actions */}
                                    <div className="flex border-t border-orange-100">
                                        <button
                                            onClick={() => openDirections(truck)}
                                            className="flex-1 py-3 text-sm text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <IconNavigation className="w-4 h-4" />
                                            Directions
                                        </button>
                                        <div className="w-px bg-orange-100" />
                                        <button
                                            onClick={() => removeFavorite(truck.id)}
                                            className="flex-1 py-3 text-sm text-slate-600 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <IconHeart className="w-4 h-4" />
                                            Remove
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
