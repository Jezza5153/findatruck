'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  IconArrowLeft, IconLoader2, IconMessageSquare, IconMail,
  IconCalendar, IconUsers as IconGuests, IconCheckCircle,
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
  wedding: '💒 Wedding',
  corporate: '🏢 Corporate',
  market: '🏪 Market',
  festival: '🎪 Festival',
  private: '🏠 Private',
  school: '🏫 School',
  other: '📋 Other',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400',
  read: 'bg-yellow-500/20 text-yellow-400',
  replied: 'bg-green-500/20 text-green-400',
  closed: 'bg-slate-500/20 text-slate-400',
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
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
        // Update stats
        fetchEnquiries();
      }
    } catch {
      // Silently fail
    }
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <IconLoader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  const filtered = filter === 'all' ? enquiries : enquiries.filter(e => e.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      {/* Header */}
      <div className="pt-8 pb-6 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4">
            <IconArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <IconMessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Enquiries</h1>
              <p className="text-slate-400">{stats.total} total · {stats.new} new</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
              className={`p-3 rounded-xl border text-left transition-all ${
                filter === stat.key
                  ? 'border-orange-500/50 bg-orange-500/10'
                  : 'border-slate-700/30 bg-slate-800/50 hover:border-slate-600/50'
              }`}
            >
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-slate-400">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Enquiry List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <IconMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No enquiries {filter !== 'all' ? `with status "${filter}"` : 'yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((enquiry, i) => (
              <motion.div
                key={enquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-slate-700/30 bg-slate-800/50 overflow-hidden"
              >
                {/* Row header — click to expand */}
                <button
                  onClick={() => setExpandedId(expandedId === enquiry.id ? null : enquiry.id)}
                  className="w-full p-4 text-left hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{enquiry.customerName}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${STATUS_COLORS[enquiry.status] || STATUS_COLORS.new}`}>
                          {enquiry.status}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-700 text-slate-300">
                          {EVENT_LABELS[enquiry.eventType] || enquiry.eventType}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                        <span>{enquiry.truckName || 'Event enquiry (no truck)'}</span>
                        <span>·</span>
                        <span>{new Date(enquiry.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedId === enquiry.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-700/30 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <IconMail className="w-4 h-4 text-slate-500" />
                        <a href={`mailto:${enquiry.customerEmail}`} className="text-orange-400 hover:underline">{enquiry.customerEmail}</a>
                      </div>
                      {enquiry.customerPhone && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">📱</span>
                          <a href={`tel:${enquiry.customerPhone}`} className="text-orange-400 hover:underline">{enquiry.customerPhone}</a>
                        </div>
                      )}
                      {enquiry.eventDate && (
                        <div className="flex items-center gap-2">
                          <IconCalendar className="w-4 h-4 text-slate-500" />
                          <span>{new Date(enquiry.eventDate).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      )}
                      {enquiry.guestCount && (
                        <div className="flex items-center gap-2">
                          <IconGuests className="w-4 h-4 text-slate-500" />
                          <span>{enquiry.guestCount} guests</span>
                        </div>
                      )}
                    </div>

                    {enquiry.message && (
                      <div className="rounded-lg bg-slate-700/30 p-3 text-sm text-slate-300">
                        {enquiry.message}
                      </div>
                    )}

                    <div className="text-xs text-slate-500">
                      Source: {enquiry.source} · ID: {enquiry.id.slice(0, 8)}
                    </div>

                    {/* Status actions */}
                    <div className="flex gap-2 pt-1">
                      {['new', 'read', 'replied', 'closed'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(enquiry.id, s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            enquiry.status === s
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {s === 'replied' && <IconCheckCircle className="w-3 h-3 inline mr-1" />}
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
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
