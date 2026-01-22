'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconUser, IconMail, IconStar, IconHeart, IconGift, IconSettings, IconLogOut,
    IconChevronRight, IconLoader2, IconCamera, IconEdit2
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
            <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <div className="text-center">
                    <IconLoader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    const user = session?.user;

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
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
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center overflow-hidden shadow-lg">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name || 'Profile'} className="w-full h-full object-cover" />
                                ) : (
                                    <IconUser className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center hover:bg-orange-50 transition-colors shadow-md">
                                <IconCamera className="w-4 h-4 text-orange-600" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-slate-800">{user?.name || 'Food Lover'} 🌮</h1>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                                <IconMail className="w-3.5 h-3.5 text-orange-400" />
                                {user?.email}
                            </p>
                            <span className="inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-600">
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
                        <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-2xl transition-all hover:shadow-lg">
                            <CardContent className="p-4 text-center">
                                <IconHeart className="w-5 h-5 text-pink-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-800">{stats.favorites}</div>
                                <div className="text-xs text-slate-500 font-medium">Favorites</div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/loyalty">
                        <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-2xl transition-all hover:shadow-lg">
                            <CardContent className="p-4 text-center">
                                <IconStar className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-800">{stats.checkIns}</div>
                                <div className="text-xs text-slate-500 font-medium">Check-ins</div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/loyalty">
                        <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-2xl transition-all hover:shadow-lg">
                            <CardContent className="p-4 text-center">
                                <IconGift className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-800">{stats.rewards}</div>
                                <div className="text-xs text-slate-500 font-medium">Rewards</div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Menu */}
            <div className="container mx-auto max-w-2xl px-4">
                <Card className="bg-white border-2 border-orange-100 rounded-3xl overflow-hidden">
                    <div className="divide-y divide-orange-100">
                        {[
                            { icon: IconEdit2, label: 'Edit Profile', href: '/profile/edit', color: 'text-orange-500' },
                            { icon: IconHeart, label: 'Preferences', href: '/onboarding', color: 'text-pink-500' },
                            { icon: IconSettings, label: 'Settings', href: '/settings', color: 'text-slate-500' },
                        ].map((item) => (
                            <Link key={item.label} href={item.href}>
                                <div className="flex items-center justify-between p-4 hover:bg-orange-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                        <span className="font-medium text-slate-700">{item.label}</span>
                                    </div>
                                    <IconChevronRight className="w-5 h-5 text-slate-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>

                {/* Sign Out */}
                <div className="mt-6">
                    <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-2xl h-12 font-bold"
                    >
                        <IconLogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>

                {/* Footer links */}
                <div className="mt-8 text-center text-sm text-slate-400 space-x-4">
                    <Link href="/privacy" className="hover:text-orange-600">Privacy</Link>
                    <Link href="/terms" className="hover:text-orange-600">Terms</Link>
                    <Link href="/help" className="hover:text-orange-600">Help</Link>
                </div>
            </div>
        </div>
    );
}
