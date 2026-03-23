'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { IconGift, IconAward, IconArrowRight, IconStar } from '@/components/ui/branded-icons';

export default function CustomerRewardsPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="ambient-shell flex min-h-screen items-center justify-center">
        <div className="text-slate-500">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="ambient-shell min-h-screen px-4 py-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="surface-panel p-6 sm:p-8">
          <div className="eyebrow-chip">
            <IconAward className="h-4 w-4 text-orange-500" />
            Loyalty and rewards
          </div>
          <h1 className="mt-5 flex items-center gap-3 font-display text-4xl font-bold text-slate-950">
            <IconAward className="h-8 w-8 text-amber-500" />
            Rewards
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            This space will turn check-ins and repeat visits into something customers actually want to track.
          </p>
        </motion.section>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="section-frame overflow-hidden rounded-[30px] border-none shadow-none">
            <CardContent className="p-10 text-center sm:p-14">
              <div className="mx-auto mb-5 inline-flex rounded-3xl bg-orange-100 p-4 text-orange-600">
                <IconGift className="h-10 w-10" />
              </div>
              <h2 className="font-display text-3xl font-bold text-slate-950">Rewards are coming soon</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
                We&apos;re shaping this into a stronger retention layer instead of a generic placeholder. Until then, keep discovering trucks and saving favorites.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/map" className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500">
                  Find Trucks
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/featured" className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 hover:bg-orange-50">
                  <IconStar className="h-4 w-4 text-orange-500" />
                  Browse Featured
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
