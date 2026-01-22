'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MapPin, Radio, Power, Loader2, Navigation,
    AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TruckStatus = 'offline' | 'open' | 'sold_out' | 'closing_soon';

const statusOptions: { value: TruckStatus; label: string; color: string }[] = [
    { value: 'offline', label: 'Offline', color: 'bg-slate-600' },
    { value: 'open', label: 'Open', color: 'bg-green-500' },
    { value: 'sold_out', label: 'Sold Out', color: 'bg-red-500' },
    { value: 'closing_soon', label: 'Closing Soon', color: 'bg-yellow-500' },
];

export default function OwnerLivePage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [truckStatus, setTruckStatus] = useState<TruckStatus>('offline');
    const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?redirect=/owner/live');
            return;
        }

        if (authStatus === 'authenticated') {
            fetchCurrentStatus();
        }
    }, [authStatus, router]);

    const fetchCurrentStatus = async () => {
        try {
            const res = await fetch('/api/trucks/my');
            if (res.ok) {
                const data = await res.json();
                setTruckStatus(data.isOpen ? 'open' : 'offline');
                if (data.lat && data.lng) {
                    setLocation({ lat: data.lat, lng: data.lng, address: data.address });
                }
            }
        } catch {
            // Ignore
        }
    };

    const useCurrentLocation = async () => {
        setIsLoadingLocation(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                // Try to get address from coords
                try {
                    const res = await fetch(
                        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
                    );
                    const data = await res.json();
                    if (data.results?.[0]) {
                        setLocation(prev => prev ? { ...prev, address: data.results[0].formatted_address } : null);
                    }
                } catch {
                    // Address lookup failed, but we have coords
                }

                setIsLoadingLocation(false);
            },
            () => {
                setError('Unable to get your location. Please enable location services.');
                setIsLoadingLocation(false);
            }
        );
    };

    const updateStatus = async (newStatus: TruckStatus) => {
        setIsUpdating(true);
        setError('');
        setSuccess('');

        try {
            const isOpen = newStatus === 'open' || newStatus === 'closing_soon';

            const body: Record<string, unknown> = { isOpen, status: newStatus };
            if (location && isOpen) {
                body.lat = location.lat;
                body.lng = location.lng;
                body.address = location.address;
            }

            const res = await fetch('/api/trucks/my', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to update');

            setTruckStatus(newStatus);
            setSuccess(newStatus === 'open' ? 'You are now live!' : `Status updated to ${newStatus}`);
        } catch {
            setError('Failed to update status. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            truckStatus === 'open' ? "bg-green-500" : "bg-slate-700"
                        )}>
                            <Radio className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Go Live</h1>
                            <p className="text-slate-400">Control your truck's status and location</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 space-y-6">
                {/* Current Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/50"
                >
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <Power className="w-5 h-5" />
                        Current Status
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => updateStatus(option.value)}
                                disabled={isUpdating}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all text-left",
                                    truckStatus === option.value
                                        ? "border-primary bg-primary/10"
                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={cn("w-3 h-3 rounded-full", option.color)} />
                                    <span className="font-medium">{option.label}</span>
                                </div>
                                {truckStatus === option.value && (
                                    <span className="text-xs text-primary">Active</span>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Location */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/50"
                >
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Your Location
                    </h2>

                    {location ? (
                        <div className="p-4 rounded-xl bg-slate-700/50 mb-4">
                            <p className="text-sm text-slate-300">
                                {location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Customers will see this location on the map
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-slate-700/50 mb-4 text-center">
                            <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">No location set</p>
                        </div>
                    )}

                    <Button
                        onClick={useCurrentLocation}
                        disabled={isLoadingLocation}
                        variant="outline"
                        className="w-full border-slate-600 hover:bg-slate-700"
                    >
                        {isLoadingLocation ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Navigation className="w-4 h-4 mr-2" />
                        )}
                        Use My Current Location
                    </Button>
                </motion.div>

                {/* Status Messages */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-300">{success}</p>
                    </motion.div>
                )}

                {/* Tips */}
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <h3 className="text-sm font-semibold mb-2 text-slate-300">Tips</h3>
                    <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Update your location when you move to a new spot</li>
                        <li>• Set to "Closing Soon" 30 mins before you pack up</li>
                        <li>• Your followers get notified when you go live!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
