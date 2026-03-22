'use client';

import React, { useState } from 'react';
import EnquiryFormModal from '@/components/EnquiryFormModal';

interface EnquiryButtonProps {
  truckId: string;
  truckName: string;
  /** Optional: the truck's email to show as label */
  contactEmail?: string;
  /** Visual variant: 'card' for inline card style, 'cta' for prominent button */
  variant?: 'card' | 'cta';
}

/**
 * Client-side enquiry button — opens the EnquiryFormModal.
 * Replaces mailto links. Can be used inside server components.
 */
export default function EnquiryButton({
  truckId,
  truckName,
  contactEmail,
  variant = 'card',
}: EnquiryButtonProps) {
  const [open, setOpen] = useState(false);

  if (variant === 'cta') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500 transition-all"
        >
          ✉ Send Enquiry
          <span className="ml-1">→</span>
        </button>
        <EnquiryFormModal
          open={open}
          onOpenChange={setOpen}
          truckId={truckId}
          truckName={truckName}
        />
      </>
    );
  }

  // Card variant — matches the existing contact card design
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50 p-4 text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-all group text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-200 text-orange-700 text-lg font-bold">
          ✉
        </div>
        <div>
          <div className="font-bold">Send Enquiry</div>
          <div className="text-sm text-orange-600/70">
            {contactEmail ? `Via foodtrucknext2me.com` : 'Get in touch directly'}
          </div>
        </div>
        <span className="ml-auto text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
      </button>
      <EnquiryFormModal
        open={open}
        onOpenChange={setOpen}
        truckId={truckId}
        truckName={truckName}
      />
    </>
  );
}
