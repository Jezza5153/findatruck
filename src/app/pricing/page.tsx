'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    IconCheck, IconX, IconStar, IconZap, IconCrown, IconArrowRight, IconSparkles
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const plans = [
    {
        id: 'free',
        name: 'Free',
        description: 'Get started with the essentials',
        price: 0,
        period: 'forever',
        icon: IconZap,
        color: 'from-slate-500 to-slate-600',
        features: [
            { text: 'Basic truck profile', included: true },
            { text: 'Menu management', included: true },
            { text: 'Location updates', included: true },
            { text: 'Customer reviews', included: true },
            { text: 'Basic analytics', included: true },
            { text: 'Featured listing', included: false },
            { text: 'Priority support', included: false },
            { text: 'Promo boosts', included: false },
            { text: 'Advanced analytics', included: false },
        ],
        cta: 'Get Started Free',
        popular: false,
    },
    {
        id: 'plus',
        name: 'Plus',
        description: 'Boost your visibility and reach',
        price: 19,
        period: '/month',
        icon: IconStar,
        color: 'from-yellow-500 to-orange-500',
        features: [
            { text: 'Everything in Free', included: true },
            { text: 'Featured map listing', included: true },
            { text: 'Verified badge', included: true },
            { text: 'Special promotions', included: true },
            { text: 'Detailed analytics', included: true },
            { text: 'Priority in search', included: true },
            { text: 'Email support', included: true },
            { text: 'Unlimited promo boosts', included: false },
            { text: 'Dedicated account manager', included: false },
        ],
        cta: 'Upgrade to Plus',
        popular: true,
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Maximum exposure for serious operators',
        price: 49,
        period: '/month',
        icon: IconCrown,
        color: 'from-purple-500 to-violet-600',
        features: [
            { text: 'Everything in Plus', included: true },
            { text: 'Top featured placement', included: true },
            { text: 'Unlimited promo boosts', included: true },
            { text: 'Advanced analytics & reports', included: true },
            { text: 'Multi-location support', included: true },
            { text: 'Priority customer support', included: true },
            { text: 'Custom branding options', included: true },
            { text: 'API access', included: true },
            { text: 'Dedicated account manager', included: true },
        ],
        cta: 'Go Pro',
        popular: false,
    },
];

const comparisonFeatures = [
    { name: 'Truck Profile', free: true, plus: true, pro: true },
    { name: 'Menu Management', free: true, plus: true, pro: true },
    { name: 'GPS Location Updates', free: true, plus: true, pro: true },
    { name: 'Customer Reviews', free: true, plus: true, pro: true },
    { name: 'Basic Analytics', free: true, plus: true, pro: true },
    { name: 'Featured Map Listing', free: false, plus: true, pro: true },
    { name: 'Verified Badge', free: false, plus: true, pro: true },
    { name: 'Create Specials/Promos', free: false, plus: true, pro: true },
    { name: 'Priority Search Ranking', free: false, plus: true, pro: true },
    { name: 'Detailed Analytics', free: false, plus: true, pro: true },
    { name: 'Unlimited Promo Boosts', free: false, plus: false, pro: true },
    { name: 'Multi-location Support', free: false, plus: false, pro: true },
    { name: 'Priority Support', free: false, plus: false, pro: true },
    { name: 'API Access', free: false, plus: false, pro: true },
];

export default function PricingPage() {
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header */}
            <section className="relative z-10 pt-20 pb-12">
                <motion.div
                    className="container mx-auto px-4 text-center"
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 border border-white/10">
                        <IconSparkles className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-slate-300">Customers always free</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Simple, Transparent
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                            Pricing
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg text-slate-400 max-w-2xl mx-auto">
                        <strong className="text-white">Customers:</strong> Always 100% free. Discover trucks, check-in, earn rewards.
                        <br />
                        <strong className="text-white">Truck Owners:</strong> Choose the plan that fits your business.
                    </motion.p>
                </motion.div>
            </section>

            {/* Pricing Cards */}
            <section className="relative z-10 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "relative rounded-2xl border transition-all",
                                    plan.popular
                                        ? "bg-gradient-to-b from-slate-800 to-slate-900 border-yellow-500/50 shadow-xl shadow-yellow-500/10 scale-105 md:scale-110 z-10"
                                        : "bg-slate-800/80 border-slate-700/50 hover:border-slate-600/50"
                                )}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="p-6 pt-8">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                            plan.color
                                        )}>
                                            <plan.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <p className="text-xs text-slate-400">{plan.description}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <span className="text-4xl font-extrabold">
                                            {plan.price === 0 ? 'Free' : `$${plan.price}`}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-slate-400 ml-1">{plan.period}</span>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <Link href={plan.price === 0 ? '/owner/signup' : '/login?redirect=/owner/billing'}>
                                        <Button
                                            className={cn(
                                                "w-full py-5 rounded-xl font-semibold transition-all",
                                                plan.popular
                                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg"
                                                    : "bg-slate-700 hover:bg-slate-600 text-white"
                                            )}
                                        >
                                            {plan.cta}
                                            <IconArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {/* Features */}
                                    <ul className="mt-6 space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature.text} className="flex items-center gap-3 text-sm">
                                                {feature.included ? (
                                                    <IconCheck className="h-4 w-4 text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <IconX className="h-4 w-4 text-slate-600 flex-shrink-0" />
                                                )}
                                                <span className={feature.included ? 'text-slate-300' : 'text-slate-500'}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="relative z-10 py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Compare Plans</h2>
                        <p className="text-slate-400">All the details, at a glance</p>
                    </motion.div>

                    <motion.div
                        className="max-w-4xl mx-auto overflow-x-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-4 px-4 font-medium text-slate-300">Feature</th>
                                    <th className="text-center py-4 px-4 font-medium text-slate-300">Free</th>
                                    <th className="text-center py-4 px-4 font-medium text-yellow-400">Plus</th>
                                    <th className="text-center py-4 px-4 font-medium text-purple-400">Pro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures.map((feature) => (
                                    <tr key={feature.name} className="border-b border-slate-800">
                                        <td className="py-3 px-4 text-slate-300">{feature.name}</td>
                                        <td className="py-3 px-4 text-center">
                                            {feature.free ? (
                                                <IconCheck className="h-4 w-4 text-green-400 mx-auto" />
                                            ) : (
                                                <IconX className="h-4 w-4 text-slate-600 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {feature.plus ? (
                                                <IconCheck className="h-4 w-4 text-green-400 mx-auto" />
                                            ) : (
                                                <IconX className="h-4 w-4 text-slate-600 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {feature.pro ? (
                                                <IconCheck className="h-4 w-4 text-green-400 mx-auto" />
                                            ) : (
                                                <IconX className="h-4 w-4 text-slate-600 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </section>

            {/* Customer reminder */}
            <section className="relative z-10 py-16 bg-slate-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="max-w-2xl mx-auto text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-green-500/20 border border-green-500/30">
                            <IconCheck className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-green-300 font-medium">100% Free for Customers</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Looking for Food Trucks?</h2>
                        <p className="text-slate-400 mb-6">
                            Finding and enjoying food trucks is completely free. Create an account to save favorites, earn loyalty rewards, and get notified about specials.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/map">
                                <Button size="lg" className="px-8 py-6 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                                    Find Trucks Now
                                    <IconArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="lg" variant="outline" className="px-8 py-6 rounded-xl border-slate-600 hover:bg-white/10">
                                    Create Free Account
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
