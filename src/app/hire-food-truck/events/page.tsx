import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import { IconArrowRight, IconCalendarDays, IconSparkles, IconTruck, IconUsers } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
    title: 'Food Trucks for Events in Adelaide — Festivals, Markets & Private Parties',
    description: 'Book food trucks for your event in Adelaide and South Australia. Perfect for festivals, markets, community events, and private parties. Find available vendors and get quotes.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck/events' },
    openGraph: {
        title: 'Food Trucks for Events in Adelaide',
        description: 'Adelaide event food truck booking for festivals, markets, schools, community days, and private events.',
        url: 'https://foodtrucknext2me.com/hire-food-truck/events',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Food Trucks for Events in Adelaide',
        description: 'Plan Adelaide event food truck bookings with a stronger enquiry path and local event context.',
    },
};

const FAQ_ITEMS = [
    {
        question: 'What kinds of Adelaide events work well with food trucks?',
        answer: 'Food trucks are a strong fit for festivals, markets, community days, school events, sports events, charity events, and private parties where mobile service and flexible setup matter.',
    },
    {
        question: 'Can I use this page for public and private events?',
        answer: 'Yes. This events page works for both public-facing events and private event formats when the goal is food truck catering or vendor bookings.',
    },
    {
        question: 'What should I include in an event enquiry?',
        answer: 'Include your date, location, guest numbers, service window, event type, and any access or setup notes so the enquiry starts from the right operational fit.',
    },
];

export default function EventFoodTrucksPage() {
    return (
        <div className="ambient-shell min-h-screen px-4 py-10">
            <div className="container mx-auto max-w-5xl">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: toJsonLd([
                            {
                                '@context': 'https://schema.org',
                                '@type': 'Service',
                                name: 'Food truck event hire in Adelaide',
                                serviceType: 'Food truck event booking and catering',
                                provider: {
                                    '@type': 'Organization',
                                    name: 'Food Truck Next 2 Me',
                                    url: 'https://foodtrucknext2me.com',
                                },
                                areaServed: {
                                    '@type': 'State',
                                    name: 'South Australia',
                                },
                                url: 'https://foodtrucknext2me.com/hire-food-truck/events',
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
                                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://foodtrucknext2me.com' },
                                    { '@type': 'ListItem', position: 2, name: 'Hire a Food Truck', item: 'https://foodtrucknext2me.com/hire-food-truck' },
                                    { '@type': 'ListItem', position: 3, name: 'Events', item: 'https://foodtrucknext2me.com/hire-food-truck/events' },
                                ],
                            },
                        ]),
                    }}
                />
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/hire-food-truck" className="hover:text-orange-600">Hire a Food Truck</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">Events</span>
                </nav>

                <section className="surface-panel overflow-hidden p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                        <div>
                            <div className="eyebrow-chip">
                                <IconSparkles className="h-4 w-4 text-orange-500" />
                                Public and private event catering
                            </div>
                            <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                                Food trucks for events in Adelaide with a clearer route from brief to booking.
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                                Festivals, markets, community events, school events, and private parties all need different service setups.
                                This page helps event organisers start with the right kind of brief instead of a vague enquiry.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="#enquiry"
                                    className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                                >
                                    Start Event Enquiry
                                    <IconArrowRight className="h-4 w-4" />
                                </a>
                                <Link
                                    href="/events"
                                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                                >
                                    Browse Events & Festivals
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Crowd flow</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Useful when events need mobile service, variety, and faster setup.</p>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Adelaide context</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Festival-ready</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Built around the kinds of Adelaide and SA event searches people already make.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-8 bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="font-display text-2xl font-bold text-slate-950 mb-4">Popular SA Events with Food Trucks</h2>
                    <div className="space-y-3">
                        {[
                            { name: 'Fork on the Road', desc: 'South Australia\'s premier food truck festival series — multiple events across Adelaide and regional SA.' },
                            { name: 'Royal Adelaide Show', desc: 'SA\'s biggest annual event with hundreds of food vendors and massive foot traffic.' },
                            { name: 'Adelaide Fringe', desc: 'World\'s second-largest arts festival with food hubs across the city.' },
                            { name: 'Gluttony', desc: 'Adelaide\'s famous festival food hub in Rymill Park — a prime location for food truck vendors.' },
                            { name: 'WOMADelaide', desc: 'World music festival in Botanic Park with curated food vendor line-ups.' },
                            { name: 'Adelaide Motorsport Festival', desc: 'Annual motorsport event with dedicated food truck opportunities.' },
                        ].map((event) => (
                            <div key={event.name} className="p-4 bg-orange-50 rounded-2xl">
                                <h3 className="font-bold text-slate-800">{event.name}</h3>
                                <p className="text-sm text-slate-600">{event.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="font-display text-2xl font-bold text-slate-950 mb-4">Event Types We Cater</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Festivals', 'Night Markets', 'School Fetes', 'Sports Events', 'Private Parties', 'Birthday Celebrations', 'Charity Events', 'Community Days', 'Grand Openings', 'Christmas Parties'].map((t) => (
                            <span key={t} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">🎪 {t}</span>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {[
                        { icon: IconTruck, title: 'Operational fit', text: 'Food trucks work well when event organisers need flexible setup, movement, and less infrastructure.' },
                        { icon: IconUsers, title: 'Crowd experience', text: 'They can improve atmosphere and give guests more visible choice than static catering setups.' },
                        { icon: IconCalendarDays, title: 'Planning value', text: 'A stronger enquiry starts from date, service window, expected turnout, and access notes.' },
                    ].map((item) => (
                        <div key={item.title} className="rounded-[28px] border border-orange-100 bg-white/95 p-6 shadow-sm">
                            <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-5 font-display text-2xl font-bold text-slate-950">{item.title}</h3>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div id="enquiry">
                    <EnquiryForm eventType="festival" />
                </div>

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

                <section className="surface-panel mt-8 p-8 sm:p-10">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Need inspiration first?</p>
                            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Use the rest of the platform to build confidence before booking.</h2>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Browse Adelaide event pages, explore featured trucks, or head into the directory if you want more context before sending your event brief.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link href="/events" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800">
                                Events & festivals
                            </Link>
                            <Link href="/food-trucks" className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                Browse trucks
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
