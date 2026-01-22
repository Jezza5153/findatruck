'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IconMapPin, IconCheckCircle, IconClock, IconXCircle, IconLoader2 } from '@/components/ui/branded-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CheckInButtonProps {
    truckId: string;
    truckName: string;
    isOpen: boolean;
    truckLat?: number;
    truckLng?: number;
    locationUpdatedAt?: string;
    onSuccess?: (stamps: number) => void;
}

type EligibilityState =
    | 'eligible'
    | 'too_far'
    | 'truck_closed'
    | 'location_stale'
    | 'cooldown'
    | 'no_location'
    | 'checking';

export function CheckInButton({
    truckId,
    truckName,
    isOpen,
    truckLat,
    truckLng,
    locationUpdatedAt,
    onSuccess,
}: CheckInButtonProps) {
    const [state, setState] = useState<EligibilityState>('checking');
    const [distance, setDistance] = useState<number | null>(null);
    const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Check eligibility on mount
    useEffect(() => {
        checkEligibility();
    }, [truckId, isOpen, truckLat, truckLng]);

    const checkEligibility = async () => {
        setState('checking');

        // Check truck is open
        if (!isOpen) {
            setState('truck_closed');
            return;
        }

        // Check location is recent (within 30 minutes)
        if (locationUpdatedAt) {
            const updatedAt = new Date(locationUpdatedAt);
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            if (updatedAt < thirtyMinutesAgo) {
                setState('location_stale');
                return;
            }
        }

        // Get user location
        if (!navigator.geolocation) {
            setState('no_location');
            return;
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                });
            });

            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            setUserLocation({ lat: userLat, lng: userLng });

            // Calculate distance
            if (truckLat && truckLng) {
                const dist = calculateDistance(userLat, userLng, truckLat, truckLng);
                setDistance(dist);

                // Must be within 100 meters
                if (dist > 100) {
                    setState('too_far');
                    return;
                }
            }

            // Check cooldown via API
            const res = await fetch(`/api/check-in/eligibility?truckId=${truckId}`);
            const data = await res.json();

            if (data.cooldown) {
                setCooldownEnd(new Date(data.cooldownUntil));
                setState('cooldown');
                return;
            }

            setState('eligible');
        } catch (error) {
            setState('no_location');
        }
    };

    const handleCheckIn = async () => {
        if (state !== 'eligible' || !userLocation) return;

        setLoading(true);
        try {
            const res = await fetch('/api/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    truckId,
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                }),
            });

            const data = await res.json();

            if (data.success) {
                // Show success animation
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);

                // Notify parent
                onSuccess?.(data.stamps);

                // Set cooldown
                setCooldownEnd(new Date(Date.now() + 4 * 60 * 60 * 1000));
                setState('cooldown');
            } else if (data.code === 'COOLDOWN') {
                setCooldownEnd(new Date(data.cooldownUntil));
                setState('cooldown');
            } else {
                // Re-check eligibility
                await checkEligibility();
            }
        } catch (error) {
            console.error('Check-in failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format cooldown time
    const formatCooldown = (end: Date): string => {
        const diff = end.getTime() - Date.now();
        if (diff <= 0) return 'Ready!';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Render based on state
    const renderButton = () => {
        switch (state) {
            case 'checking':
                return (
                    <Button disabled className="w-full">
                        <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking eligibility...
                    </Button>
                );

            case 'eligible':
                return (
                    <Button
                        onClick={handleCheckIn}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500"
                    >
                        {loading ? (
                            <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <IconCheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Check In & Earn Stamp
                    </Button>
                );

            case 'too_far':
                return (
                    <div className="space-y-2">
                        <Button disabled className="w-full bg-slate-700">
                            <IconMapPin className="w-4 h-4 mr-2" />
                            Too Far Away
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            You're {distance?.toFixed(0)}m away. Get within 100m to check in.
                        </p>
                    </div>
                );

            case 'truck_closed':
                return (
                    <div className="space-y-2">
                        <Button disabled className="w-full bg-slate-700">
                            <IconXCircle className="w-4 h-4 mr-2" />
                            Truck is Closed
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            Check back when {truckName} is open!
                        </p>
                    </div>
                );

            case 'location_stale':
                return (
                    <div className="space-y-2">
                        <Button disabled className="w-full bg-slate-700">
                            <IconClock className="w-4 h-4 mr-2" />
                            Location Outdated
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            The truck needs to update their location first.
                        </p>
                    </div>
                );

            case 'cooldown':
                return (
                    <div className="space-y-2">
                        <Button disabled className="w-full bg-slate-700">
                            <IconClock className="w-4 h-4 mr-2" />
                            Come Back Soon
                        </Button>
                        <p className="text-xs text-center text-amber-400">
                            ⏰ Ready in {cooldownEnd ? formatCooldown(cooldownEnd) : '...'}
                        </p>
                    </div>
                );

            case 'no_location':
                return (
                    <div className="space-y-2">
                        <Button onClick={checkEligibility} variant="outline" className="w-full">
                            <IconMapPin className="w-4 h-4 mr-2" />
                            Enable Location
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            Location access needed to check in.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="relative">
            {renderButton()}

            {/* Success Animation Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-lg"
                    >
                        <div className="text-center text-white">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                            >
                                <IconCheckCircle className="w-8 h-8 mx-auto mb-1" />
                            </motion.div>
                            <span className="font-semibold">Stamp Earned! 🎉</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Haversine distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default CheckInButton;
