'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconCalendar, IconClock, IconMapPin, IconUser, IconCheckCircle, IconXCircle,
    IconLoader2, IconMessageSquare, IconMoreVertical, IconCalendarDays
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek } from 'date-fns';

interface Booking {
    id: string;
    userId: string;
    userName?: string;
    userEmail: string;
    eventName: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
    status: 'pending' | 'confirmed' | 'declined' | 'completed';
    createdAt: string;
}

type FilterType = 'upcoming' | 'pending' | 'all';

export default function OwnerBookingsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('upcoming');

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?redirect=/owner/bookings');
            return;
        }

        if (authStatus === 'authenticated') {
            fetchBookings();
        }
    }, [authStatus, router]);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/trucks/my/bookings');
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch {
            // Use sample data for demo
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const updateBookingStatus = async (id: string, status: string) => {
        try {
            await fetch(`/api/trucks/my/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            setBookings(prev =>
                prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b)
            );
        } catch {
            // Handle error
        }
    };

    const filteredBookings = bookings
        .filter(b => {
            if (filter === 'pending') return b.status === 'pending';
            if (filter === 'upcoming') return ['pending', 'confirmed'].includes(b.status) && new Date(b.date) >= new Date();
            return true;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const formatBookingDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isThisWeek(date)) return format(date, 'EEEE');
        return format(date, 'MMM d, yyyy');
    };

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            pendingCount > 0 ? "bg-yellow-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"
                        )}>
                            <IconCalendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Bookings</h1>
                            {pendingCount > 0 && (
                                <p className="text-yellow-400 text-sm">{pendingCount} pending request{pendingCount !== 1 ? 's' : ''}</p>
                            )}
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[
                            { value: 'upcoming', label: 'Upcoming' },
                            { value: 'pending', label: `Pending (${pendingCount})` },
                            { value: 'all', label: 'All' },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value as FilterType)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                    filter === f.value
                                        ? "bg-slate-700 text-white"
                                        : "bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4">
                {filteredBookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <IconCalendarDays className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">
                            {filter === 'pending' ? 'No pending requests' : 'No bookings yet'}
                        </h2>
                        <p className="text-slate-400">
                            Booking requests from customers will appear here
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking, i) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={cn(
                                    "p-4 rounded-xl border transition-all",
                                    booking.status === 'pending'
                                        ? "bg-yellow-500/5 border-yellow-500/20"
                                        : booking.status === 'confirmed'
                                            ? "bg-green-500/5 border-green-500/20"
                                            : booking.status === 'declined'
                                                ? "bg-red-500/5 border-red-500/20 opacity-60"
                                                : "bg-slate-800/50 border-slate-700/30"
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold">{booking.eventName}</h3>
                                        <p className="text-sm text-slate-400 flex items-center gap-1">
                                            <IconUser className="w-3 h-3" />
                                            {booking.userName || booking.userEmail}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "px-2 py-0.5 text-xs rounded capitalize",
                                            booking.status === 'pending' && "bg-yellow-500/20 text-yellow-400",
                                            booking.status === 'confirmed' && "bg-green-500/20 text-green-400",
                                            booking.status === 'declined' && "bg-red-500/20 text-red-400",
                                            booking.status === 'completed' && "bg-slate-700 text-slate-400"
                                        )}>
                                            {booking.status}
                                        </span>

                                        {booking.status === 'pending' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <IconMoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                                    <DropdownMenuItem
                                                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                                        className="text-green-400"
                                                    >
                                                        <IconCheckCircle className="w-4 h-4 mr-2" />
                                                        Confirm
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => updateBookingStatus(booking.id, 'declined')}
                                                        className="text-red-400"
                                                    >
                                                        <IconXCircle className="w-4 h-4 mr-2" />
                                                        Decline
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <IconCalendar className="w-4 h-4 text-blue-400" />
                                        <span>{formatBookingDate(booking.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <IconClock className="w-4 h-4 text-purple-400" />
                                        <span>{booking.startTime} - {booking.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300 col-span-2">
                                        <IconMapPin className="w-4 h-4 text-green-400" />
                                        <span>{booking.location}</span>
                                    </div>
                                </div>

                                {booking.notes && (
                                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                                        <p className="text-sm text-slate-400 flex items-start gap-2">
                                            <IconMessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {booking.notes}
                                        </p>
                                    </div>
                                )}

                                {/* Quick actions for pending */}
                                {booking.status === 'pending' && (
                                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/30">
                                        <Button
                                            size="sm"
                                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                            className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                                        >
                                            <IconCheckCircle className="w-4 h-4 mr-1" />
                                            Confirm
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateBookingStatus(booking.id, 'declined')}
                                            variant="outline"
                                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                        >
                                            <IconXCircle className="w-4 h-4 mr-1" />
                                            Decline
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
