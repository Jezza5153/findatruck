'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconArrowLeft,
  IconLoader2,
  IconMessageSquare,
  IconMail,
  IconCalendar,
  IconUsers as IconGuests,
  IconCheckCircle,
} from '@/components/ui/branded-icons';

interface Enquiry {
  id: string;
  truckId: string | null;
  truckName: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  eventType: string;
  eventDate: string | null;
  guestCount: number | null;
  message: string;
  status: string;
  source: string;
  createdAt: string;
}

interface EnquiryStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  closed: number;
}

const EVENT_LABELS: Record<string, string> = {
  wedding: 'Wedding',
  corporate: 'Corporate',
  market: 'Market',
  festival: 'Festival',
  private: 'Private',
  school: 'School',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-sky-400/15 text-sky-200',
  read: 'bg-amber-400/15 text-amber-200',
  replied: 'bg-emerald-400/15 text-emerald-200',
  closed: 'bg-white/8 text-white/55',
};

export default function AdminEnquiriesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<EnquiryStats>({ total: 0, new: 0, read: 0, replied: 0, closed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login?redirect=/admin/enquiries');
      return;
    }
    if (authStatus === 'authenticated') {
      if ((session?.user as any)?.role !== 'admin') {
        router.replace('/');
        return;
      }
      fetchEnquiries();
    }
  }, [authStatus, session, router]);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/admin/enquiries');
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.data);
        setStats(data.stats);
      }
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
        fetchEnquiries();
      }
    } catch {
      // Silently fail
    }
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-orange-300" />
      </div>
    );
  }

  const filtered = filter === 'all' ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <div className="pb-24 pt-8 text-white">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <section className="role-panel-dark-strong p-6 sm:p-8">
          <Link href="/admin" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white">
            <IconArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="role-pill-dark mb-4">
                <IconMessageSquare className="h-4 w-4 text-orange-300" />
                Lead inbox
              </div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Enquiries</h1>
              <p className="mt-2 text-white/60">{stats.total} total enquiries with {stats.new} waiting for a first response.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">New</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{stats.new}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Replied</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{stats.replied}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: 'Total', value: stats.total, key: 'all' },
            { label: 'New', value: stats.new, key: 'new' },
            { label: 'Read', value: stats.read, key: 'read' },
            { label: 'Replied', value: stats.replied, key: 'replied' },
            { label: 'Closed', value: stats.closed, key: 'closed' },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`role-stat-dark p-4 text-left transition-all ${
                filter === stat.key ? 'border-orange-400/35 bg-orange-400/12' : 'hover:border-white/20 hover:bg-white/[0.08]'
              }`}
            >
              <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{stat.label}</div>
            </button>
          ))}
        </section>

        {filtered.length === 0 ? (
          <section className="role-panel-dark py-16 text-center text-white/45">
            <IconMessageSquare className="mx-auto mb-3 h-12 w-12 opacity-40" />
            <p>No enquiries {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
          </section>
        ) : (
          <section className="space-y-3">
            {filtered.map((enquiry, i) => (
              <motion.div
                key={enquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="role-panel-dark overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === enquiry.id ? null : enquiry.id)}
                  className="w-full p-4 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-white">{enquiry.customerName}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[enquiry.status] || STATUS_COLORS.new}`}>
                          {enquiry.status}
                        </span>
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/70">
                          {EVENT_LABELS[enquiry.eventType] || enquiry.eventType}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/50">
                        <span>{enquiry.truckName || 'Event enquiry (no truck)'}</span>
                        <span>·</span>
                        <span>
                          {new Date(enquiry.createdAt).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {expandedId === enquiry.id ? (
                  <div className="role-soft-divider space-y-3 border-t px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <IconMail className="h-4 w-4 text-white/40" />
                        <a href={`mailto:${enquiry.customerEmail}`} className="text-orange-200 hover:underline">
                          {enquiry.customerEmail}
                        </a>
                      </div>
                      {enquiry.customerPhone ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white/40">Phone</span>
                          <a href={`tel:${enquiry.customerPhone}`} className="text-orange-200 hover:underline">
                            {enquiry.customerPhone}
                          </a>
                        </div>
                      ) : null}
                      {enquiry.eventDate ? (
                        <div className="flex items-center gap-2">
                          <IconCalendar className="h-4 w-4 text-white/40" />
                          <span>
                            {new Date(enquiry.eventDate).toLocaleDateString('en-AU', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : null}
                      {enquiry.guestCount ? (
                        <div className="flex items-center gap-2">
                          <IconGuests className="h-4 w-4 text-white/40" />
                          <span>{enquiry.guestCount} guests</span>
                        </div>
                      ) : null}
                    </div>

                    {enquiry.message ? (
                      <div className="rounded-[22px] border border-white/8 bg-black/15 p-4 text-sm text-white/75">
                        {enquiry.message}
                      </div>
                    ) : null}

                    <div className="text-xs text-white/40">
                      Source: {enquiry.source} · ID: {enquiry.id.slice(0, 8)}
                    </div>

                    <div className="flex gap-2 pt-1">
                      {['new', 'read', 'replied', 'closed'].map((statusKey) => (
                        <button
                          key={statusKey}
                          onClick={() => updateStatus(enquiry.id, statusKey)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            enquiry.status === statusKey
                              ? 'bg-orange-500 text-slate-950'
                              : 'bg-white/8 text-white/65 hover:bg-white/12'
                          }`}
                        >
                          {statusKey === 'replied' ? <IconCheckCircle className="mr-1 inline h-3 w-3" /> : null}
                          {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </motion.div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
