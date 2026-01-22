'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconGift, IconStar, IconTrophy, IconChevronRight, IconLoader2, IconSparkles
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoyaltyCardData {
    id: string;
    truckId: string;
    truckName: string;
    truckImage?: string | null;
    stamps: number;
    stampsRequired: number;
    rewardsEarned: number;
    rewardsRedeemed: number;
    lastCheckIn?: string | null;
}

export default function LoyaltyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cards, setCards] = useState<LoyaltyCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?redirect=/loyalty');
            return;
        }

        if (status === 'authenticated') {
            fetchLoyaltyCards();
        }
    }, [status, router]);

    const fetchLoyaltyCards = async () => {
        try {
            const res = await fetch('/api/user/loyalty');
            if (res.ok) {
                const data = await res.json();
                setCards(data.cards || []);
            }
        } catch {
            // Handle error silently
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <IconLoader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const totalRewards = cards.reduce((sum, card) => sum + (card.rewardsEarned - card.rewardsRedeemed), 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                            <IconGift className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Loyalty</h1>
                    </div>
                    <p className="text-slate-400">
                        {totalRewards > 0 ? `${totalRewards} reward${totalRewards !== 1 ? 's' : ''} available!` : 'Check in to earn stamps'}
                    </p>
                </div>
            </div>

            {/* Stats Banner */}
            {cards.length > 0 && (
                <div className="container mx-auto max-w-2xl px-4 mb-6">
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total Cards', value: cards.length, icon: IconStar },
                            { label: 'Total Stamps', value: cards.reduce((s, c) => s + c.stamps, 0), icon: IconSparkles },
                            { label: 'Rewards Ready', value: totalRewards, icon: IconTrophy },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/30">
                                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="container mx-auto max-w-2xl px-4">
                {cards.length === 0 ? (
                    // Empty state
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <IconGift className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No loyalty cards yet</h2>
                        <p className="text-slate-400 mb-6">
                            Check in at food trucks to start earning stamps
                        </p>
                        <Link href="/map">
                            <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                                Find Trucks
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    // Loyalty cards
                    <div className="space-y-4">
                        {cards.map((card, i) => {
                            const progress = (card.stamps / card.stampsRequired) * 100;
                            const availableRewards = card.rewardsEarned - card.rewardsRedeemed;

                            return (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link href={`/trucks/${card.truckId}`}>
                                        <div className="bg-slate-800/80 rounded-xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all">
                                            {/* Card Header */}
                                            <div className="p-4 flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-lg bg-slate-700 flex-shrink-0 overflow-hidden">
                                                    {card.truckImage ? (
                                                        <img src={card.truckImage} alt={card.truckName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">🚚</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{card.truckName}</h3>
                                                    <p className="text-sm text-slate-400">
                                                        {card.stamps} / {card.stampsRequired} stamps
                                                    </p>
                                                </div>
                                                {availableRewards > 0 && (
                                                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                                        <IconGift className="w-3.5 h-3.5" />
                                                        {availableRewards}
                                                    </div>
                                                )}
                                                <IconChevronRight className="w-5 h-5 text-slate-500" />
                                            </div>

                                            {/* Stamp Progress */}
                                            <div className="px-4 pb-4">
                                                <div className="flex gap-1.5">
                                                    {Array.from({ length: card.stampsRequired }).map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "flex-1 h-2 rounded-full transition-colors",
                                                                idx < card.stamps ? "bg-primary" : "bg-slate-700"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2 text-center">
                                                    {card.stampsRequired - card.stamps} more stamp{card.stampsRequired - card.stamps !== 1 ? 's' : ''} until next reward
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* How it works */}
                <div className="mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <IconTrophy className="w-5 h-5 text-yellow-400" />
                        How to earn rewards
                    </h3>
                    <ol className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                            <span>Visit a food truck and check in when you're nearby</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                            <span>Earn a stamp for each check-in (max once per day per truck)</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                            <span>Collect 10 stamps to unlock a free reward!</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
