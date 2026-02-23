'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
    IconHeart, IconShare2, IconNavigation, IconCheckCircle, IconLoader2, IconX
} from '@/components/ui/branded-icons';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TruckInteractiveProps {
    truckId: string;
    truckName: string;
    isOpen: boolean;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
}

export default function TruckInteractive({ truckId, truckName, isOpen, lat, lng, address }: TruckInteractiveProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkInStatus, setCheckInStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [checkInMessage, setCheckInMessage] = useState('');
    const [checkInResult, setCheckInResult] = useState<{ stampsEarned?: number; rewardUnlocked?: boolean } | null>(null);

    const toggleFavorite = async () => {
        if (!session?.user) {
            router.push('/login?redirect=' + encodeURIComponent(`/trucks/${truckId}`));
            return;
        }
        try {
            if (isFavorite) {
                await fetch(`/api/user/favorites/${truckId}`, { method: 'DELETE' });
            } else {
                await fetch('/api/user/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ truckId }),
                });
            }
            setIsFavorite(!isFavorite);
        } catch { /* ignore */ }
    };

    const openDirections = () => {
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        } else if (address) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
        }
    };

    const handleShare = async () => {
        const url = `https://www.foodtrucknext2me.com/trucks/${truckId}`;
        if (navigator.share) {
            await navigator.share({ title: truckName, url });
        } else {
            await navigator.clipboard.writeText(url);
        }
    };

    const handleCheckIn = useCallback(async () => {
        if (!session?.user) {
            router.push('/login?redirect=' + encodeURIComponent(`/trucks/${truckId}`));
            return;
        }
        setCheckInStatus('checking');
        setCheckInMessage('Getting your location...');
        if (!navigator.geolocation) {
            setCheckInStatus('error');
            setCheckInMessage('Geolocation is not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setCheckInMessage('Verifying location...');
                try {
                    const res = await fetch('/api/check-in', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ truckId, lat: position.coords.latitude, lng: position.coords.longitude }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setCheckInStatus('success');
                        setCheckInMessage('Checked in successfully!');
                        setCheckInResult(data.loyalty);
                    } else {
                        setCheckInStatus('error');
                        setCheckInMessage(data.error || 'Check-in failed');
                    }
                } catch {
                    setCheckInStatus('error');
                    setCheckInMessage('Failed to check in. Please try again.');
                }
            },
            () => {
                setCheckInStatus('error');
                setCheckInMessage('Unable to get your location');
            }
        );
    }, [session, truckId, router]);

    return (
        <div className="flex flex-col gap-4">
            {/* Action buttons */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    className={cn(
                        "border-orange-200 rounded-xl",
                        isFavorite ? 'bg-pink-100 border-pink-300 text-pink-500' : 'text-slate-400 hover:text-orange-500 hover:border-orange-300'
                    )}
                >
                    <IconHeart className={cn("w-5 h-5", isFavorite && 'fill-current')} />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={openDirections}
                    className="border-orange-200 text-slate-400 hover:text-orange-500 hover:border-orange-300 rounded-xl"
                >
                    <IconNavigation className="w-5 h-5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="border-orange-200 text-slate-400 hover:text-orange-500 hover:border-orange-300 rounded-xl"
                >
                    <IconShare2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Check-in */}
            {isOpen && (
                <AnimatePresence mode="wait">
                    {checkInStatus === 'idle' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Button onClick={handleCheckIn} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400">
                                <IconCheckCircle className="w-5 h-5 mr-2" />
                                Check In & Earn Stamp
                            </Button>
                        </motion.div>
                    )}
                    {checkInStatus === 'checking' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-slate-500">
                            <IconLoader2 className="w-5 h-5 animate-spin" />
                            {checkInMessage}
                        </motion.div>
                    )}
                    {checkInStatus === 'success' && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-green-50 border border-green-200">
                            <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                                <IconCheckCircle className="w-5 h-5" />
                                {checkInMessage}
                            </div>
                            {checkInResult && (
                                <p className="text-sm text-green-700">
                                    +{checkInResult.stampsEarned} stamp earned!
                                    {checkInResult.rewardUnlocked && <span className="text-yellow-600 font-semibold ml-2">🎉 Reward unlocked!</span>}
                                </p>
                            )}
                        </motion.div>
                    )}
                    {checkInStatus === 'error' && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-600">
                                <IconX className="w-5 h-5" />
                                {checkInMessage}
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setCheckInStatus('idle')} className="text-slate-500 hover:text-slate-800">
                                Try Again
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
