'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconMessageSquare, IconSearch, IconFilter, IconStar, IconCheckCircle, IconXCircle,
    IconMoreVertical, IconEye, IconTrash2, IconFlag, IconLoader2, IconAlertTriangle
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
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ReviewData {
    id: string;
    truckId: string;
    truckName: string;
    userId: string;
    userName?: string;
    userEmail: string;
    rating: number;
    text?: string | null;
    moderationState: 'pending' | 'approved' | 'rejected' | 'flagged';
    createdAt: string;
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';

export default function AdminReviewsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterType>('pending');

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?redirect=/admin/reviews');
            return;
        }

        if (authStatus === 'authenticated') {
            if (session?.user?.role !== 'admin') {
                router.replace('/');
                return;
            }
            fetchReviews();
        }
    }, [authStatus, session, router]);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
            }
        } catch {
            // Ignore
        } finally {
            setIsLoading(false);
        }
    };

    const updateReview = async (id: string, moderationState: string) => {
        try {
            await fetch(`/api/admin/reviews/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moderationState }),
            });
            setReviews(prev =>
                prev.map(r => r.id === id ? { ...r, moderationState: moderationState as ReviewData['moderationState'] } : r)
            );
        } catch {
            // Handle error
        }
    };

    const deleteReview = async (id: string) => {
        try {
            await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch {
            // Handle error
        }
    };

    const filteredReviews = reviews
        .filter(r => filter === 'all' || r.moderationState === filter)
        .filter(r =>
            r.truckName.toLowerCase().includes(search.toLowerCase()) ||
            r.text?.toLowerCase().includes(search.toLowerCase()) ||
            r.userEmail.toLowerCase().includes(search.toLowerCase())
        );

    const counts = {
        all: reviews.length,
        pending: reviews.filter(r => r.moderationState === 'pending').length,
        approved: reviews.filter(r => r.moderationState === 'approved').length,
        rejected: reviews.filter(r => r.moderationState === 'rejected').length,
        flagged: reviews.filter(r => r.moderationState === 'flagged').length,
    };

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
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            counts.pending > 0 ? "bg-red-500" : "bg-gradient-to-br from-green-500 to-emerald-500"
                        )}>
                            <IconMessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Review Moderation</h1>
                            <p className="text-slate-400">
                                {counts.pending > 0 ? (
                                    <span className="text-red-400">{counts.pending} pending review{counts.pending !== 1 ? 's' : ''}</span>
                                ) : (
                                    'All caught up!'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search reviews..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700"
                            />
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {(['pending', 'all', 'approved', 'rejected', 'flagged'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-lg border whitespace-nowrap transition-colors capitalize",
                                    filter === f
                                        ? "bg-slate-700 border-slate-600 text-white"
                                        : "bg-transparent border-slate-700 text-slate-400 hover:text-white",
                                    f === 'pending' && counts.pending > 0 && "border-red-500/50"
                                )}
                            >
                                {f} ({counts[f]})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4">
                <div className="space-y-3">
                    {filteredReviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className={cn(
                                "p-4 rounded-xl border transition-all",
                                review.moderationState === 'pending'
                                    ? "bg-yellow-500/5 border-yellow-500/20"
                                    : review.moderationState === 'flagged'
                                        ? "bg-red-500/5 border-red-500/20"
                                        : "bg-slate-800/50 border-slate-700/30"
                            )}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                                        {review.userName?.[0]?.toUpperCase() || review.userEmail[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{review.userName || review.userEmail.split('@')[0]}</p>
                                        <Link href={`/trucks/${review.truckId}`} className="text-sm text-primary hover:underline">
                                            {review.truckName}
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 text-xs rounded capitalize",
                                        review.moderationState === 'approved' && "bg-green-500/20 text-green-400",
                                        review.moderationState === 'pending' && "bg-yellow-500/20 text-yellow-400",
                                        review.moderationState === 'rejected' && "bg-red-500/20 text-red-400",
                                        review.moderationState === 'flagged' && "bg-orange-500/20 text-orange-400"
                                    )}>
                                        {review.moderationState}
                                    </span>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <IconMoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                            <DropdownMenuItem
                                                onClick={() => updateReview(review.id, 'approved')}
                                                className="flex items-center gap-2 text-green-400"
                                            >
                                                <IconCheckCircle className="w-4 h-4" />
                                                Approve
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => updateReview(review.id, 'rejected')}
                                                className="flex items-center gap-2 text-red-400"
                                            >
                                                <IconXCircle className="w-4 h-4" />
                                                Reject
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => updateReview(review.id, 'flagged')}
                                                className="flex items-center gap-2 text-orange-400"
                                            >
                                                <IconFlag className="w-4 h-4" />
                                                Flag for Review
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => deleteReview(review.id)}
                                                className="flex items-center gap-2 text-red-400"
                                            >
                                                <IconTrash2 className="w-4 h-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <IconStar
                                        key={idx}
                                        className={cn(
                                            "w-4 h-4",
                                            idx < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                                        )}
                                    />
                                ))}
                                <span className="ml-2 text-sm text-slate-400">
                                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </span>
                            </div>

                            {/* Review text */}
                            {review.text && (
                                <p className="text-slate-300 text-sm">{review.text}</p>
                            )}

                            {/* Quick actions for pending */}
                            {review.moderationState === 'pending' && (
                                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-700/30">
                                    <Button
                                        size="sm"
                                        onClick={() => updateReview(review.id, 'approved')}
                                        className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0"
                                    >
                                        <IconCheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => updateReview(review.id, 'rejected')}
                                        variant="outline"
                                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                        <IconXCircle className="w-4 h-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {filteredReviews.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            {filter === 'pending' ? (
                                <>
                                    <IconCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                                    <p>All reviews have been moderated!</p>
                                </>
                            ) : (
                                <>
                                    <IconMessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No reviews found</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
