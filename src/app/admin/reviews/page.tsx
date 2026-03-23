'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconMessageSquare,
  IconSearch,
  IconStar,
  IconCheckCircle,
  IconXCircle,
  IconMoreVertical,
  IconTrash2,
  IconFlag,
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
import { formatDistanceToNow } from 'date-fns';

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
      setReviews((prev) =>
        prev.map((review) => (review.id === id ? { ...review, moderationState: moderationState as ReviewData['moderationState'] } : review))
      );
    } catch {
      // Handle error
    }
  };

  const deleteReview = async (id: string) => {
    try {
      await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews((prev) => prev.filter((review) => review.id !== id));
    } catch {
      // Handle error
    }
  };

  const filteredReviews = reviews
    .filter((review) => filter === 'all' || review.moderationState === filter)
    .filter(
      (review) =>
        review.truckName.toLowerCase().includes(search.toLowerCase()) ||
        review.text?.toLowerCase().includes(search.toLowerCase()) ||
        review.userEmail.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: reviews.length,
    pending: reviews.filter((review) => review.moderationState === 'pending').length,
    approved: reviews.filter((review) => review.moderationState === 'approved').length,
    rejected: reviews.filter((review) => review.moderationState === 'rejected').length,
    flagged: reviews.filter((review) => review.moderationState === 'flagged').length,
  };

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
            <IconMessageSquare className="h-4 w-4 text-orange-300" />
            Moderation queue
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl',
                    counts.pending > 0 ? 'bg-gradient-to-br from-red-500 to-amber-400' : 'bg-gradient-to-br from-emerald-500 to-teal-400'
                  )}
                >
                  <IconMessageSquare className="h-5 w-5 text-slate-950" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Review Moderation</h1>
                  <p className="text-white/60">
                    {counts.pending > 0 ? `${counts.pending} review${counts.pending !== 1 ? 's' : ''} waiting for moderation.` : 'All caught up.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Pending</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{counts.pending}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Approved</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{counts.approved}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35" />
              <Input
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="role-input-dark h-12 rounded-full pl-10"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {(['pending', 'all', 'approved', 'rejected', 'flagged'] as FilterType[]).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setFilter(filterKey)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors capitalize',
                  filter === filterKey
                    ? 'border-orange-400/35 bg-orange-400/15 text-orange-100'
                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white',
                  filterKey === 'pending' && counts.pending > 0 && filter !== filterKey && 'border-red-300/20'
                )}
              >
                {filterKey} ({counts[filterKey]})
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {filteredReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                'role-panel-dark p-5 transition-all',
                review.moderationState === 'pending'
                  ? 'border-amber-300/20 bg-amber-400/[0.06]'
                  : review.moderationState === 'flagged'
                    ? 'border-red-300/20 bg-red-400/[0.06]'
                    : 'hover:bg-white/[0.07]'
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-sm">
                    {review.userName?.[0]?.toUpperCase() || review.userEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{review.userName || review.userEmail.split('@')[0]}</p>
                    <Link href={`/trucks/${review.truckId}`} className="text-sm text-orange-200 hover:underline">
                      {review.truckName}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
                      review.moderationState === 'approved' && 'bg-emerald-400/15 text-emerald-200',
                      review.moderationState === 'pending' && 'bg-amber-400/15 text-amber-200',
                      review.moderationState === 'rejected' && 'bg-red-400/15 text-red-200',
                      review.moderationState === 'flagged' && 'bg-orange-400/15 text-orange-200'
                    )}
                  >
                    {review.moderationState}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0 text-white/60 hover:bg-white/10 hover:text-white">
                        <IconMoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-white/10 bg-[#151923] text-white">
                      <DropdownMenuItem onClick={() => updateReview(review.id, 'approved')} className="flex items-center gap-2 text-green-300">
                        <IconCheckCircle className="h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateReview(review.id, 'rejected')} className="flex items-center gap-2 text-red-300">
                        <IconXCircle className="h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateReview(review.id, 'flagged')} className="flex items-center gap-2 text-orange-300">
                        <IconFlag className="h-4 w-4" />
                        Flag for Review
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteReview(review.id)} className="flex items-center gap-2 text-red-300">
                        <IconTrash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <IconStar
                    key={idx}
                    className={cn('h-4 w-4', idx < review.rating ? 'fill-amber-300 text-amber-300' : 'text-white/18')}
                  />
                ))}
                <span className="ml-2 text-sm text-white/45">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </span>
              </div>

              {review.text ? <p className="text-sm text-white/75">{review.text}</p> : null}

              {review.moderationState === 'pending' ? (
                <div className="role-soft-divider mt-4 flex gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    onClick={() => updateReview(review.id, 'approved')}
                    className="flex-1 border-0 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/25"
                  >
                    <IconCheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateReview(review.id, 'rejected')}
                    variant="outline"
                    className="flex-1 border-red-300/20 text-red-200 hover:bg-red-400/10"
                  >
                    <IconXCircle className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              ) : null}
            </motion.div>
          ))}

          {filteredReviews.length === 0 ? (
            <div className="role-panel-dark py-12 text-center text-white/45">
              {filter === 'pending' ? (
                <>
                  <IconCheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-300/70" />
                  <p>All reviews have been moderated.</p>
                </>
              ) : (
                <>
                  <IconMessageSquare className="mx-auto mb-3 h-10 w-10 opacity-50" />
                  <p>No reviews found</p>
                </>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
