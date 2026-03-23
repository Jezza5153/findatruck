'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
    IconArrowRight,
    IconCalendarDays,
    IconCheckCircle,
    IconMail,
    IconSparkles,
    IconUsers,
} from '@/components/ui/branded-icons';

interface EnquiryFormProps {
    eventType?: string;
}

export default function EnquiryForm({ eventType = 'event' }: EnquiryFormProps) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        eventType: eventType,
        eventDate: '',
        guestCount: '',
        venue: '',
        message: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: form.name,
                    customerEmail: form.email,
                    customerPhone: form.phone || undefined,
                    eventType: form.eventType,
                    eventDate: form.eventDate || undefined,
                    guestCount: form.guestCount || undefined,
                    message: form.message
                        ? `${form.message}${form.venue ? `\n\nVenue: ${form.venue}` : ''}`
                        : form.venue
                            ? `Venue: ${form.venue}`
                            : '',
                    source: 'hire-page',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send enquiry');
            }

            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="section-frame p-8 text-center">
                <div className="mx-auto mb-4 inline-flex rounded-3xl bg-emerald-100 p-4 text-emerald-700">
                    <IconCheckCircle className="h-10 w-10" />
                </div>
                <h3 className="font-display text-3xl font-bold text-slate-950 mb-2">Enquiry Sent</h3>
                <p className="mx-auto max-w-xl text-base leading-7 text-slate-600">
                    Thanks for your interest. We&apos;ll match you with available food trucks and get back to you within 24 hours with the next best options.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href="/featured"
                        className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                    >
                        Explore Featured Trucks
                        <IconArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/map"
                        className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                    >
                        Open Live Map
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="surface-panel space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 border-b border-orange-100 pb-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <div>
                    <div className="eyebrow-chip">
                        <IconSparkles className="h-4 w-4 text-orange-500" />
                        Free quote request
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-bold text-slate-950">Get a sharper food truck shortlist</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        Share the essentials and we&apos;ll help connect your event with Adelaide food trucks that actually fit the guest count, vibe, and service style you need.
                    </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[210px] lg:grid-cols-1">
                    <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <IconCheckCircle className="mr-2 inline h-4 w-4 text-orange-500" />
                        No-cost enquiry
                    </div>
                    <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <IconCalendarDays className="mr-2 inline h-4 w-4 text-orange-500" />
                        Fast enquiry routing
                    </div>
                    <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <IconUsers className="mr-2 inline h-4 w-4 text-orange-500" />
                        Better event matching
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Contact details</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Tell us who should receive the shortlist and follow-up details.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                            placeholder="Jane Smith"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                            placeholder="jane@example.com"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Event details</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Give enough context so the first options feel relevant instead of generic.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                            placeholder="0412 345 678"
                        />
                    </div>
                    <div>
                        <label htmlFor="eventType" className="block text-sm font-medium text-slate-700 mb-1">Event Type *</label>
                        <select
                            id="eventType"
                            required
                            value={form.eventType}
                            onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                            className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                        >
                            <option value="wedding">Wedding</option>
                            <option value="corporate">Corporate / Office Event</option>
                            <option value="festival">Festival / Market</option>
                            <option value="private-party">Private Party / Birthday</option>
                            <option value="school-fete">School Fete</option>
                            <option value="other">Other Event</option>
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 mb-1">Event Date *</label>
                        <input
                            id="eventDate"
                            type="date"
                            required
                            value={form.eventDate}
                            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                            className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="guestCount" className="block text-sm font-medium text-slate-700 mb-1">Expected Guests *</label>
                        <select
                            id="guestCount"
                            required
                            value={form.guestCount}
                            onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                            className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                        >
                            <option value="">Select guest count</option>
                            <option value="20-50">20–50 guests</option>
                            <option value="50-100">50–100 guests</option>
                            <option value="100-200">100–200 guests</option>
                            <option value="200-500">200–500 guests</option>
                            <option value="500+">500+ guests</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Event brief</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Share location details, service expectations, or anything that will shape the match.</p>
                </div>
                <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-slate-700 mb-1">Venue / Location</label>
                    <input
                        id="venue"
                        type="text"
                        value={form.venue}
                        onChange={(e) => setForm({ ...form, venue: e.target.value })}
                        className="w-full rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                        placeholder="e.g. McLaren Vale winery, Glenelg foreshore"
                    />
                </div>

                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Tell us more about your event</label>
                    <textarea
                        id="message"
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full resize-none rounded-2xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-orange-400"
                        placeholder="Any cuisine preferences, dietary requirements, budget, or other details..."
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            <div className="flex flex-col gap-4 border-t border-orange-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm leading-6 text-slate-500">
                    <IconMail className="mr-2 inline h-4 w-4 text-orange-500" />
                    No cost to enquire. No payment required.
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="cta-sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-4 text-lg font-bold text-white shadow-glow transition-all hover:from-orange-600 hover:to-amber-500 disabled:opacity-50 sm:w-auto"
                >
                    {submitting ? 'Sending...' : 'Send Enquiry'}
                    {!submitting && <IconArrowRight className="h-5 w-5" />}
                </button>
            </div>
        </form>
    );
}
