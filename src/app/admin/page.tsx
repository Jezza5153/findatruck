'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconLayoutDashboard,
  IconTruck,
  IconMessageSquare,
  IconUsers,
  IconCreditCard,
  IconTrendingUp,
  IconChevronRight,
  IconLoader2,
} from '@/components/ui/branded-icons';

interface AdminStats {
  trucksLive: number;
  totalTrucks: number;
  totalUsers: number;
  pendingReviews: number;
  activeSubscriptions: number;
  signupsToday: number;
  totalEnquiries: number;
  newEnquiries: number;
}

export default function AdminDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    trucksLive: 0,
    totalTrucks: 0,
    totalUsers: 0,
    pendingReviews: 0,
    activeSubscriptions: 0,
    signupsToday: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.replace('/login?redirect=/admin');
      return;
    }

    if (authStatus === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.replace('/');
        return;
      }
      fetchStats();
    }
  }, [authStatus, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-orange-300" />
      </div>
    );
  }

  const quickLinks = [
    {
      href: '/admin/enquiries',
      label: 'Enquiries',
      icon: IconMessageSquare,
      count: stats.totalEnquiries,
      highlight: stats.newEnquiries > 0,
    },
    {
      href: '/admin/trucks',
      label: 'Manage Trucks',
      icon: IconTruck,
      count: stats.totalTrucks,
    },
    {
      href: '/admin/reviews',
      label: 'Review Queue',
      icon: IconMessageSquare,
      count: stats.pendingReviews,
      highlight: stats.pendingReviews > 0,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: IconUsers,
      count: stats.totalUsers,
    },
    {
      href: '/admin/billing',
      label: 'Billing',
      icon: IconCreditCard,
      count: stats.activeSubscriptions,
    },
  ];

  const statCards = [
    { label: 'Trucks Live Now', value: stats.trucksLive, icon: IconTruck, color: 'text-emerald-300' },
    { label: 'Total Trucks', value: stats.totalTrucks, icon: IconTruck, color: 'text-sky-300' },
    { label: 'Total Users', value: stats.totalUsers, icon: IconUsers, color: 'text-violet-300' },
    { label: 'Signups Today', value: stats.signupsToday, icon: IconTrendingUp, color: 'text-amber-300' },
  ];

  return (
    <div className="pb-24 pt-8 text-white">
      <div className="container mx-auto max-w-6xl space-y-6 px-4">
        <section className="role-panel-dark-strong p-6 sm:p-8">
          <div className="role-pill-dark mb-5">
            <IconTrendingUp className="h-4 w-4 text-orange-300" />
            Admin overview
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/20">
                  <IconLayoutDashboard className="h-5 w-5 text-slate-950" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Admin Dashboard</h1>
                  <p className="text-sm text-white/60 sm:text-base">Platform health, moderation, and operations in one place.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">New enquiries</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{stats.newEnquiries}</p>
              </div>
              <div className="role-stat-dark p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">Pending reviews</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{stats.pendingReviews}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="role-stat-dark p-5"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-white/6 p-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="font-display text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-2 text-sm text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </section>

        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200/70">Quick Access</h2>
            <span className="text-sm text-white/45">Core admin workflows</span>
          </div>
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={link.href}>
                <div className="role-panel-dark flex items-center justify-between p-4 transition-all hover:border-orange-300/20 hover:bg-white/[0.08]">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${link.highlight ? 'bg-red-500/15' : 'bg-white/8'}`}>
                      <link.icon className={`h-5 w-5 ${link.highlight ? 'text-red-300' : 'text-orange-200'}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-white">{link.label}</span>
                      {link.highlight ? (
                        <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-200">
                          Action Needed
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-bold text-white">{link.count}</span>
                    <IconChevronRight className="h-5 w-5 text-white/35" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        <section className="role-panel-dark p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200/70">Platform Activity</h2>
          <div className="rounded-[24px] border border-white/8 bg-black/15 px-6 py-10 text-center text-white/45">
            <IconLayoutDashboard className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">Activity feed coming soon</p>
          </div>
        </section>
      </div>
    </div>
  );
}
