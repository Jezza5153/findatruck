'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconUser, IconMail, IconMapPin, IconStar, IconHeart, IconGift, IconSettings, IconLogOut,
    IconChevronRight, IconLoader2, IconCamera, Edit2
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const user = session?.user;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Profile Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center overflow-hidden">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                                ) : (
                                    <IconUser className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center hover:bg-slate-600 transition-colors">
                                <IconCamera className="w-4 h-4 text-slate-300" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-xl font-bold">{user?.name || 'Food Lover'}</h1>
                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                <IconMail className="w-3.5 h-3.5" />
                                {user?.email}
                            </p>
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                                Customer
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats */}
            <div className="container mx-auto max-w-2xl px-4 mb-6">
                <div className="grid grid-cols-3 gap-3">
                    <Link href="/favorites">
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                            <IconHeart className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.favorites}</div>
                            <div className="text-xs text-slate-400">Favorites</div>
                        </div>
                    </Link>
                    <Link href="/loyalty">
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                            <IconStar className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.checkIns}</div>
                            <div className="text-xs text-slate-400">Check-ins</div>
                        </div>
                    </Link>
                    <Link href="/loyalty">
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                            <IconGift className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold">{stats.rewards}</div>
                            <div className="text-xs text-slate-400">Rewards</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Menu */}
            <div className="container mx-auto max-w-2xl px-4">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/30 divide-y divide-slate-700/30">
                    {[
                        { icon: IconEdit2, label: 'Edit Profile', href: '/profile/edit' },
                        { icon: IconHeart, label: 'Preferences', href: '/onboarding' },
                        { icon: IconSettings, label: 'Settings', href: '/settings' },
                    ].map((item) => (
                        <Link key={item.label} href={item.href}>
                            <div className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5 text-slate-400" />
                                    <span>{item.label}</span>
                                </div>
                                <IconChevronRight className="w-5 h-5 text-slate-500" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Sign Out */}
                <div className="mt-6">
                    <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                        <IconLogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>

                {/* Footer links */}
                <div className="mt-8 text-center text-sm text-slate-500 space-x-4">
                    <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
                    <Link href="/terms" className="hover:text-slate-400">Terms</Link>
                    <Link href="/help" className="hover:text-slate-400">Help</Link>
                </div>
            </div>
        </div>
    );
}
