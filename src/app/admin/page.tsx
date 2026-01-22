'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Truck, MessageSquare, Users, CreditCard,
    TrendingUp, ChevronRight, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
    trucksLive: number;
    totalTrucks: number;
    totalUsers: number;
    pendingReviews: number;
    activeSubscriptions: number;
    signupsToday: number;
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
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const quickLinks = [
        { href: '/admin/trucks', label: 'Manage Trucks', icon: Truck, count: stats.totalTrucks },
        { href: '/admin/reviews', label: 'Review Queue', icon: MessageSquare, count: stats.pendingReviews, highlight: stats.pendingReviews > 0 },
        { href: '/admin/users', label: 'Users', icon: Users, count: stats.totalUsers },
        { href: '/admin/billing', label: 'Billing', icon: CreditCard, count: stats.activeSubscriptions },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                            <p className="text-slate-400">Platform overview</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Trucks Live Now', value: stats.trucksLive, icon: Truck, color: 'text-green-400' },
                        { label: 'Total Trucks', value: stats.totalTrucks, icon: Truck, color: 'text-blue-400' },
                        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-400' },
                        { label: 'Signups Today', value: stats.signupsToday, icon: TrendingUp, color: 'text-yellow-400' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30"
                        >
                            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-slate-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Links */}
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-400">Quick Access</h2>
                    {quickLinks.map((link, i) => (
                        <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={link.href}>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.highlight ? 'bg-red-500/20' : 'bg-slate-700'}`}>
                                            <link.icon className={`w-5 h-5 ${link.highlight ? 'text-red-400' : 'text-slate-400'}`} />
                                        </div>
                                        <div>
                                            <span className="font-medium">{link.label}</span>
                                            {link.highlight && (
                                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                                                    Action Needed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">{link.count}</span>
                                        <ChevronRight className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity placeholder */}
                <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/30">
                    <h2 className="text-sm font-semibold text-slate-400 mb-4">Platform Activity</h2>
                    <div className="text-center py-8 text-slate-500">
                        <LayoutDashboard className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Activity feed coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
