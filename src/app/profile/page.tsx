'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconUser,
  IconMail,
  IconStar,
  IconHeart,
  IconGift,
  IconSettings,
  IconLogOut,
  IconChevronRight,
  IconLoader2,
  IconCamera,
  IconEdit2,
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    favorites: 0,
    checkIns: 0,
    rewards: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/profile');
      return;
    }

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Use defaults
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="ambient-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <IconLoader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-orange-500" />
          <p className="text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const user = session?.user;

  const statCards = [
    { icon: IconHeart, label: 'Favorites', href: '/favorites', value: stats.favorites, color: 'text-rose-500' },
    { icon: IconStar, label: 'Check-ins', href: '/loyalty', value: stats.checkIns, color: 'text-amber-500' },
    { icon: IconGift, label: 'Rewards', href: '/loyalty', value: stats.rewards, color: 'text-orange-500' },
  ];

  return (
    <div className="ambient-shell min-h-screen px-4 py-8 pb-24">
      <div className="container mx-auto max-w-3xl space-y-6">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="surface-panel p-6 sm:p-8">
          <div className="eyebrow-chip">
            <IconUser className="h-4 w-4 text-orange-500" />
            Your account
          </div>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-500 to-amber-400 shadow-glow">
                {user?.image ? (
                  <img src={user.image} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
                ) : (
                  <IconUser className="h-10 w-10 text-white" />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 rounded-full border border-orange-200 bg-white p-2 shadow-md transition-colors hover:bg-orange-50">
                <IconCamera className="h-4 w-4 text-orange-600" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="font-display text-4xl font-bold text-slate-950">{user?.name || 'Food Lover'}</h1>
              <p className="mt-2 flex items-center gap-2 text-slate-500">
                <IconMail className="h-4 w-4 text-orange-500" />
                {user?.email}
              </p>
              <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Customer
              </span>
            </div>
          </div>
        </motion.section>

        <section className="grid grid-cols-3 gap-3">
          {statCards.map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="section-frame h-full border-orange-100 bg-white/92 transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                <CardContent className="p-5 text-center">
                  <item.icon className={`mx-auto mb-3 h-5 w-5 ${item.color}`} />
                  <div className="font-display text-3xl font-bold text-slate-950">{item.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>

        <Card className="surface-panel overflow-hidden border-none shadow-none">
          <div className="divide-y divide-orange-100">
            {[
              { icon: IconEdit2, label: 'Edit Profile', href: '/profile/edit', color: 'text-orange-500' },
              { icon: IconHeart, label: 'Preferences', href: '/onboarding', color: 'text-rose-500' },
              { icon: IconSettings, label: 'Settings', href: '/settings', color: 'text-slate-600' },
            ].map((item) => (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center justify-between p-5 transition-colors hover:bg-orange-50/80">
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <IconChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="h-12 w-full rounded-2xl border-red-200 bg-white text-red-500 hover:border-red-300 hover:bg-red-50"
        >
          <IconLogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>

        <div className="text-center text-sm text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/privacy" className="hover:text-orange-600">Privacy</Link>
            <Link href="/terms" className="hover:text-orange-600">Terms</Link>
            <Link href="/help" className="hover:text-orange-600">Help</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
