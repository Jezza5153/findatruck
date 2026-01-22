'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    IconMapPin, IconHeart, IconGift, IconStar, IconArrowRight, IconSmartphone, IconBell, IconTrophy
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.15 } }
};

const steps = [
    {
        icon: IconMapPin,
        title: 'Discover',
        description: 'Find food trucks near you with our live map. See real-time locations, open hours, and what\'s on the menu today.',
        color: 'from-blue-500 to-cyan-500',
        details: ['Real-time GPS tracking', 'Filter by cuisine & distance', 'See what\'s cooking now']
    },
    {
        icon: IconHeart,
        title: 'Follow',
        description: 'Save your favorite trucks and never miss when they\'re nearby. Get notified when they go live.',
        color: 'from-pink-500 to-rose-500',
        details: ['Build your favorites list', 'Get proximity alerts', 'Track their schedule']
    },
    {
        icon: IconSmartphone,
        title: 'Check-in',
        description: 'When you visit a truck, tap to check-in. It\'s quick, easy, and earns you loyalty stamps.',
        color: 'from-orange-500 to-amber-500',
        details: ['One-tap check-in', 'Location verified', 'Instant stamp earned']
    },
    {
        icon: IconGift,
        title: 'Earn Rewards',
        description: 'Collect stamps with every visit. Hit the threshold and unlock exclusive rewards and discounts.',
        color: 'from-purple-500 to-violet-500',
        details: ['Collect loyalty stamps', 'Unlock free items', 'Exclusive member perks']
    }
];

export default function HowItWorksPage() {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header */}
            <section className="relative z-10 pt-20 pb-16">
                <motion.div
                    className="container mx-auto px-4 text-center"
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 border border-white/10">
                        <IconTrophy className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-300">Start earning rewards today</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            How It Works
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
                        From discovery to rewards in four simple steps. Join thousands of food lovers enjoying exclusive perks.
                    </motion.p>
                </motion.div>
            </section>

            {/* Steps Grid */}
            <section className="relative z-10 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group"
                            >
                                {/* Step number connector */}
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-slate-600 to-transparent z-0" />
                                )}

                                <div className="relative h-full p-6 rounded-2xl bg-slate-800/80 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                                    {/* Step number */}
                                    <div className="absolute -top-3 -left-3">
                                        <span className={cn(
                                            "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white shadow-lg",
                                            `bg-gradient-to-r ${step.color}`
                                        )}>
                                            {i + 1}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <div className={cn(
                                        "w-14 h-14 mb-4 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                        step.color
                                    )}>
                                        <step.icon className="w-7 h-7 text-white" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{step.description}</p>

                                    <ul className="space-y-2">
                                        {step.details.map((detail) => (
                                            <li key={detail} className="flex items-center gap-2 text-sm text-slate-300">
                                                <div className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-r", step.color)} />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 py-16 bg-slate-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Join FindATruck?</h2>
                        <p className="text-slate-400 max-w-lg mx-auto">
                            The best way to discover, follow, and get rewarded by your favorite food trucks
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: IconBell, title: 'Never Miss Out', desc: 'Get alerts when favorites are nearby or posting specials' },
                            { icon: IconStar, title: 'Exclusive Deals', desc: 'Members-only discounts and early access to new items' },
                            { icon: IconGift, title: 'Free Rewards', desc: 'Earn stamps and unlock free food just by visiting' }
                        ].map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center p-6 rounded-xl bg-slate-800/50 border border-slate-700/30"
                            >
                                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <benefit.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-slate-400">{benefit.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTAs */}
            <section className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="max-w-3xl mx-auto text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to Get Started?</h2>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <Link href="/map">
                                <Button
                                    size="lg"
                                    className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 shadow-xl transition-all hover:scale-105"
                                >
                                    <IconMapPin className="mr-2 h-5 w-5" />
                                    Find Trucks Near Me
                                    <IconArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-6 text-lg rounded-xl border-slate-600 hover:bg-white/10"
                                >
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>

                        <div className="pt-8 border-t border-slate-700/50">
                            <p className="text-slate-400 mb-4">Own a food truck?</p>
                            <Link href="/signup?role=owner" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                                List your truck and grow your business
                                <IconArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
