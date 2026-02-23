'use client';

import React, { useState } from 'react';

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
            const res = await fetch('/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
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
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Enquiry Sent!</h3>
                <p className="text-green-700">
                    Thanks for your interest! We&apos;ll match you with available food trucks and get back to you within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-8 shadow-md space-y-5">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Get a Free Quote</h2>
            <p className="text-slate-500 text-sm mb-4">
                Tell us about your event and we&apos;ll connect you with the best food trucks in Adelaide.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800"
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800"
                        placeholder="jane@example.com"
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800"
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800 bg-white"
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

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 mb-1">Event Date *</label>
                    <input
                        id="eventDate"
                        type="date"
                        required
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800"
                    />
                </div>
                <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-slate-700 mb-1">Expected Guests *</label>
                    <select
                        id="guestCount"
                        required
                        value={form.guestCount}
                        onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800 bg-white"
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

            <div>
                <label htmlFor="venue" className="block text-sm font-medium text-slate-700 mb-1">Venue / Location</label>
                <input
                    id="venue"
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-400 focus:ring-orange-400 focus:outline-none text-slate-800 resize-none"
                    placeholder="Any cuisine preferences, dietary requirements, budget, or other details..."
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-full shadow-xl shadow-orange-500/20 transition-all disabled:opacity-50 text-lg"
            >
                {submitting ? 'Sending...' : '📧 Send Enquiry — It\'s Free'}
            </button>
        </form>
    );
}
