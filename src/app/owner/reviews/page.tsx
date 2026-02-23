'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconMessageSquare, IconStar, IconReply, IconLoader2, IconChevronDown, IconChevronUp,
    IconSend, IconAlertCircle
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ReviewData {
    id: string;
    userId: string;
    userName?: string;
    rating: number;
    text?: string | null;
    ownerReply?: string | null;
    ownerRepliedAt?: string | null;
    createdAt: string;
}

export default function OwnerReviewsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.replace('/login?redirect=/owner/reviews');
            return;
        }

        if (authStatus === 'authenticated') {
            fetchReviews();
        }
    }, [authStatus, router]);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/trucks/my/reviews');
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

    const submitReply = async (reviewId: string) => {
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            await fetch(`/api/trucks/my/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText }),
            });

            setReviews(prev => prev.map(r =>
                r.id === reviewId
                    ? { ...r, ownerReply: replyText, ownerRepliedAt: new Date().toISOString() }
                    : r
            ));
            setReplyingTo(null);
            setReplyText('');
        } catch {
            // Handle error
        } finally {
            setSubmitting(false);
        }
    };

    if (authStatus === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const averageRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => Math.round(r.rating) === rating).length,
        percent: reviews.length ? (reviews.filter(r => Math.round(r.rating) === rating).length / reviews.length) * 100 : 0,
    }));

    const unreplied = reviews.filter(r => !r.ownerReply).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <IconMessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Reviews</h1>
                            <p className="text-slate-400">{reviews.length} total reviews</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 space-y-6">
                {/* Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/50"
                >
                    <div className="flex items-start gap-6">
                        {/* Average rating */}
                        <div className="text-center">
                            <div className="text-4xl font-bold text-yellow-400">{averageRating}</div>
                            <div className="flex items-center gap-0.5 mt-1">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <IconStar
                                        key={idx}
                                        className={cn(
                                            "w-4 h-4",
                                            idx < Math.round(parseFloat(averageRating))
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-slate-600"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{reviews.length} reviews</p>
                        </div>

                        {/* Rating breakdown */}
                        <div className="flex-1 space-y-1.5">
                            {ratingCounts.map(({ rating, count, percent }) => (
                                <div key={rating} className="flex items-center gap-2 text-sm">
                                    <span className="w-3 text-slate-400">{rating}</span>
                                    <IconStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-6 text-right text-slate-500">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {unreplied > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-sm text-yellow-400">
                            <IconAlertCircle className="w-4 h-4" />
                            {unreplied} review{unreplied !== 1 ? 's' : ''} awaiting your reply
                        </div>
                    )}
                </motion.div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <IconMessageSquare className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No reviews yet</h2>
                        <p className="text-slate-400">
                            Reviews from customers will appear here
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={cn(
                                    "p-4 rounded-xl border transition-all",
                                    !review.ownerReply
                                        ? "bg-yellow-500/5 border-yellow-500/20"
                                        : "bg-slate-800/50 border-slate-700/30"
                                )}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                            {review.userName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{review.userName || 'Customer'}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <IconStar
                                                key={idx}
                                                className={cn(
                                                    "w-4 h-4",
                                                    idx < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Review text */}
                                {review.text && (
                                    <p className="text-slate-300 mb-3">{review.text}</p>
                                )}

                                {/* Owner reply */}
                                {review.ownerReply ? (
                                    <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconReply className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium text-primary">Your Reply</span>
                                            {review.ownerRepliedAt && (
                                                <span className="text-xs text-slate-500">
                                                    {formatDistanceToNow(new Date(review.ownerRepliedAt), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 text-sm">{review.ownerReply}</p>
                                    </div>
                                ) : (
                                    <>
                                        {replyingTo === review.id ? (
                                            <div className="mt-3 space-y-2">
                                                <Textarea
                                                    placeholder="Write your reply..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    className="bg-slate-700/50 border-slate-600 min-h-[80px]"
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => submitReply(review.id)}
                                                        disabled={submitting || !replyText.trim()}
                                                        className="bg-primary hover:bg-primary/90"
                                                    >
                                                        {submitting ? (
                                                            <IconLoader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <IconSend className="w-4 h-4 mr-1" />
                                                                Send Reply
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setReplyingTo(review.id)}
                                                className="mt-2 text-primary hover:text-primary/80"
                                            >
                                                <IconReply className="w-4 h-4 mr-1" />
                                                Reply to this review
                                            </Button>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
