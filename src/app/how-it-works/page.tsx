'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    IconArrowRight,
    IconBell,
    IconGift,
    IconHeart,
    IconMapPin,
    IconSmartphone,
    IconSparkles,
    IconTrophy,
} from '@/components/ui/branded-icons';
import { Button } from '@/components/ui/button';
import { toJsonLd } from '@/lib/json-ld';

const fadeInUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

const steps = [
    {
        icon: IconMapPin,
        title: 'Discover',
        description: 'Open the live map, see what is serving now, and cut straight through the usual “where should we eat?” indecision.',
        bullets: ['Real-time truck visibility', 'Better local search by suburb or cuisine', 'Open/closed status that is easy to scan'],
    },
    {
        icon: IconHeart,
        title: 'Follow',
        description: 'Keep favourite trucks close so you can spot them faster when they pop up in the city, by the beach, or at your weekend event.',
        bullets: ['Save favourites', 'Reduce missed visits', 'Stay attached to trucks you already trust'],
    },
    {
        icon: IconSmartphone,
        title: 'Check In',
        description: 'Give customers a simple way to engage in-person and keep the experience connected to the moment they actually visit.',
        bullets: ['Fast check-in flow', 'Designed for phone-first use', 'Built to support repeat behaviour'],
    },
    {
        icon: IconGift,
        title: 'Earn Rewards',
        description: 'Turn occasional visits into a habit with loyalty-friendly mechanics that make returning feel rewarding instead of random.',
        bullets: ['Reward repeat visits', 'Create better retention loops', 'Give people a reason to come back soon'],
    }
];

const benefits = [
    {
        icon: IconBell,
        title: 'Never Miss the Good Ones',
        description: 'The experience is built to make favourites easier to find again when timing and location actually matter.',
    },
    {
        icon: IconSparkles,
        title: 'Less Friction, More Appetite',
        description: 'The product is designed to move people from curiosity to action without burying them in noise.',
    },
    {
        icon: IconTrophy,
        title: 'Better for Loyal Customers',
        description: 'Check-ins, repeat visits, and stronger discovery all make the platform more worth returning to.',
    },
];

const FAQ_ITEMS = [
    {
        question: 'How do I use Food Truck Next 2 Me to find food trucks near me?',
        answer: 'Start with the live map or the location pages, then move into truck profiles when you want more detail on cuisine, availability, or the next step.',
    },
    {
        question: 'Is the platform only for customers?',
        answer: 'No. It is also built for event planners who want to hire food trucks and for owners who want better visibility across Adelaide and South Australia.',
    },
    {
        question: 'Should I use the map, events pages, or hire flow?',
        answer: 'Use the map for real-time discovery, event pages for festival and event-specific browsing, and the hire flow when you need food truck catering for your own event.',
    },
];

export default function HowItWorksPage() {
    return (
        <div className="ambient-shell min-h-screen px-4 py-10">
            <div className="container mx-auto max-w-6xl">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: toJsonLd([
                            {
                                '@context': 'https://schema.org',
                                '@type': 'HowTo',
                                name: 'How to use Food Truck Next 2 Me',
                                description: 'How customers discover food trucks and return to the platform through Food Truck Next 2 Me.',
                                step: steps.map((step, index) => ({
                                    '@type': 'HowToStep',
                                    position: index + 1,
                                    name: step.title,
                                    text: step.description,
                                })),
                            },
                            {
                                '@context': 'https://schema.org',
                                '@type': 'FAQPage',
                                mainEntity: FAQ_ITEMS.map((item) => ({
                                    '@type': 'Question',
                                    name: item.question,
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: item.answer,
                                    },
                                })),
                            },
                            {
                                '@context': 'https://schema.org',
                                '@type': 'BreadcrumbList',
                                itemListElement: [
                                    {
                                        '@type': 'ListItem',
                                        position: 1,
                                        name: 'Home',
                                        item: 'https://foodtrucknext2me.com',
                                    },
                                    {
                                        '@type': 'ListItem',
                                        position: 2,
                                        name: 'How It Works',
                                        item: 'https://foodtrucknext2me.com/how-it-works',
                                    },
                                ],
                            },
                        ]),
                    }}
                />

                <section className="surface-panel overflow-hidden p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="eyebrow-chip">
                                <IconTrophy className="h-4 w-4 text-orange-500" />
                                From discovery to loyalty
                            </div>
                            <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                                How Food Truck Next 2 Me turns cravings into repeat visits.
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                                The platform is built to help customers discover better food trucks faster, and help trucks stay visible long enough to build real loyalty instead of one-off luck.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="cta-sheen rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-7 py-6 text-base font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                                >
                                    <Link href="/map">
                                        Find Trucks Near Me
                                        <IconArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="rounded-full border-orange-200 bg-white px-7 py-6 text-base font-semibold text-slate-800 hover:bg-orange-50"
                                >
                                    <Link href="/signup">
                                        Create Free Account
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            className="grid gap-3 sm:grid-cols-3"
                        >
                            <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Step 01</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Discover</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Start with real-time context, not random guesses.</p>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Step 02</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Follow</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Keep favourites close so good trucks stay top-of-mind.</p>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Step 03-04</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Return</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Check in, earn rewards, and make visits habitual.</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            {...fadeInUp}
                            transition={{ ...fadeInUp.transition, delay: index * 0.05 }}
                            className="rounded-[28px] border border-orange-100 bg-white/92 p-6 shadow-sm"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className="font-display text-3xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                            </div>
                            <h2 className="font-display text-2xl font-bold text-slate-950">{step.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                            <ul className="mt-5 space-y-2">
                                {step.bullets.map((bullet) => (
                                    <li key={bullet} className="flex items-start gap-2 text-sm text-slate-600">
                                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </section>

                <section className="surface-panel mt-8 p-8 sm:p-10">
                    <motion.div {...fadeInUp} className="mb-8 max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Why people stick around</p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">The product works best when it feels useful before it feels promotional.</h2>
                    </motion.div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={benefit.title}
                                {...fadeInUp}
                                transition={{ ...fadeInUp.transition, delay: index * 0.06 }}
                                className="rounded-[28px] border border-orange-100 bg-orange-50/55 p-6"
                            >
                                <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
                                    <benefit.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-slate-950">{benefit.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="section-frame mt-8 p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Choose the right path</p>
                            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Different visitors need different first clicks.</h2>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                The map is best when someone is hungry now. The events pages are better when search starts from a festival or public event.
                                The hire flow is best when the goal is catering, and the owner flow is best when a truck wants to get found more often.
                            </p>
                        </div>
                        <div className="rounded-[28px] border border-orange-100 bg-white p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best next click</p>
                            <div className="mt-4 space-y-3">
                                <Link href="/map" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-100">
                                    Find trucks near me
                                    <IconArrowRight className="h-4 w-4 text-orange-600" />
                                </Link>
                                <Link href="/events" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                    Browse Adelaide events
                                    <IconArrowRight className="h-4 w-4 text-orange-600" />
                                </Link>
                                <Link href="/hire-food-truck" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                    Hire a food truck
                                    <IconArrowRight className="h-4 w-4 text-orange-600" />
                                </Link>
                                <Link href="/owner/signup" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                    List your truck
                                    <IconArrowRight className="h-4 w-4 text-orange-600" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-3">
                    {FAQ_ITEMS.map((item) => (
                        <details key={item.question} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
                            <summary className="cursor-pointer font-display text-xl font-bold text-slate-900">
                                {item.question}
                            </summary>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                        </details>
                    ))}
                </section>
            </div>
        </div>
    );
}
