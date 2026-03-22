'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconArrowRight, IconCheckCircle } from '@/components/ui/branded-icons';

interface EnquiryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  truckId: string;
  truckName: string;
}

const EVENT_TYPES = [
  { value: 'wedding', label: '💒 Wedding' },
  { value: 'corporate', label: '🏢 Corporate' },
  { value: 'market', label: '🏪 Market' },
  { value: 'festival', label: '🎪 Festival' },
  { value: 'private', label: '🏠 Private Party' },
  { value: 'school', label: '🏫 School Event' },
  { value: 'other', label: '📋 Other / Just Enquiring' },
];

export default function EnquiryFormModal({
  open,
  onOpenChange,
  truckId,
  truckName,
}: EnquiryFormModalProps) {
  const isEventMode = !truckId || truckId === '';
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('other');
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setStep('form');
    setName('');
    setEmail('');
    setPhone('');
    setEventType('other');
    setEventDate('');
    setGuestCount('');
    setMessage('');
    setErrorMessage('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Delay reset so animation completes
      setTimeout(resetForm, 300);
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckId: isEventMode ? undefined : truckId,
          customerName: name,
          customerEmail: email,
          customerPhone: phone || undefined,
          eventType: isEventMode ? (eventType === 'other' ? 'other' : eventType) : eventType,
          eventDate: eventDate || undefined,
          guestCount: guestCount || undefined,
          message,
          source: isEventMode ? 'event-homepage' : 'profile',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('success');
      } else {
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        setStep('error');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
      setStep('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-[28px] border-orange-100 bg-white p-0 sm:max-w-xl">
        {/* Header */}
        <div className="border-b border-orange-100 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-orange-700 w-fit">
              Enquiry via foodtrucknext2me.com
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-slate-950">
              {step === 'success'
                ? 'Enquiry Sent!'
                : isEventMode
                  ? 'Find Trucks for Your Event'
                  : `Get a Quote from ${truckName}`}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {step === 'success'
                ? isEventMode
                  ? 'Your event enquiry has been sent to matching trucks. Expect responses within 24 hours.'
                  : `${truckName} will receive your enquiry and get back to you directly.`
                : isEventMode
                  ? 'Tell us about your event and we\'ll connect you with the right food trucks.'
                  : 'Fill in your details and we\'ll pass your enquiry directly to the truck owner.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Success State */}
        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <IconCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-slate-950">You're all set!</p>
              <p className="mt-2 text-sm text-slate-500">
                {isEventMode
                  ? <>Your event enquiry has been sent to matching trucks. Expect responses at <strong>{email}</strong> within 24 hours.</>
                  : <>Your enquiry has been sent to <strong>{truckName}</strong>. They'll reply to <strong>{email}</strong> directly.</>}
              </p>
            </div>
            <Button
              onClick={() => handleClose(false)}
              className="mt-2 rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        )}

        {/* Error State */}
        {step === 'error' && (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-slate-950">Couldn't send</p>
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            </div>
            <Button
              onClick={() => setStep('form')}
              className="mt-2 rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-800"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {/* Name + Email */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="enq-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Your name *
                </label>
                <Input
                  id="enq-name"
                  required
                  minLength={2}
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-xl border-orange-100 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              <div>
                <label htmlFor="enq-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email *
                </label>
                <Input
                  id="enq-email"
                  type="email"
                  required
                  placeholder="jane@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="rounded-xl border-orange-100 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label htmlFor="enq-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Phone <span className="text-slate-400">(optional)</span>
              </label>
              <Input
                id="enq-phone"
                type="tel"
                placeholder="04XX XXX XXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="rounded-xl border-orange-100 focus:border-orange-400 focus:ring-orange-400"
              />
            </div>

            {/* Event Type Chips */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                What's the occasion?
              </label>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(et => (
                  <button
                    key={et.value}
                    type="button"
                    onClick={() => setEventType(et.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                      eventType === et.value
                        ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                        : 'border-orange-100 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50'
                    }`}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Guest Count */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="enq-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Event date <span className="text-slate-400">(optional)</span>
                </label>
                <Input
                  id="enq-date"
                  type="date"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="rounded-xl border-orange-100 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
              <div>
                <label htmlFor="enq-guests" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Guests <span className="text-slate-400">(approx)</span>
                </label>
                <Input
                  id="enq-guests"
                  type="number"
                  min={1}
                  max={5000}
                  placeholder="e.g. 80"
                  value={guestCount}
                  onChange={e => setGuestCount(e.target.value)}
                  className="rounded-xl border-orange-100 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="enq-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your message *
              </label>
              <textarea
                id="enq-message"
                required
                minLength={10}
                rows={3}
                placeholder={isEventMode ? 'Tell us about your event — date, location, cuisine preferences, budget...' : `Hi ${truckName}, I'd love to enquire about booking you for...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 border-t border-orange-50 pt-4">
              <p className="text-xs text-slate-400">
                {isEventMode ? 'Your details will be shared with matching trucks — we don\'t spam.' : `Your details go directly to ${truckName} — we don't spam.`}
              </p>
              <Button
                type="submit"
                disabled={submitting}
                className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500 disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Enquiry'}
                {!submitting && <IconArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
