'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IconLoader2 } from '@/components/ui/branded-icons';

/**
 * Billing page - Hidden for free launch
 * Redirects to owner dashboard
 * 
 * TODO: Restore full billing page when Stripe is enabled
 * Original file backed up in git history
 */
export default function OwnerBillingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard - billing hidden for free launch
    router.replace('/owner/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <IconLoader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-4" />
        <p className="text-slate-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
