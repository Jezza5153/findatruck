import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

export const metadata: Metadata = {
    title: 'Find Food Trucks by Location — Adelaide & South Australia',
    description: 'Browse food trucks by location across Adelaide and South Australia. Find street food in the CBD, Glenelg, Adelaide Hills, Barossa Valley, McLaren Vale, and more.',
    alternates: { canonical: 'https://foodtrucknext2me.com/food-trucks' },
};

const LOCATIONS = [
    { slug: 'adelaide-cbd', name: 'Adelaide CBD', emoji: '🏙️', tagline: 'City centre street food' },
    { slug: 'glenelg', name: 'Glenelg', emoji: '🏖️', tagline: 'Beachside food trucks' },
    { slug: 'henley-beach', name: 'Henley Beach', emoji: '🌅', tagline: 'Sunset eats by the shore' },
    { slug: 'adelaide-hills', name: 'Adelaide Hills', emoji: '⛰️', tagline: 'Gourmet food in the hills' },
    { slug: 'mclaren-vale', name: 'McLaren Vale', emoji: '🍷', tagline: 'Wine region street food' },
    { slug: 'barossa-valley', name: 'Barossa Valley', emoji: '🍇', tagline: 'Food trucks among vineyards' },
    { slug: 'port-adelaide', name: 'Port Adelaide', emoji: '⚓', tagline: 'Harbour precinct eats' },
    { slug: 'norwood', name: 'Norwood & Eastern Suburbs', emoji: '🌳', tagline: 'Eastern suburbs dining' },
];

const CUISINES = [
    { slug: 'mexican', name: 'Mexican', emoji: '🌮' },
    { slug: 'italian', name: 'Italian & Pizza', emoji: '🍕' },
    { slug: 'greek', name: 'Greek', emoji: '🥙' },
    { slug: 'asian', name: 'Asian', emoji: '🥢' },
    { slug: 'bbq', name: 'BBQ & Burgers', emoji: '🍔' },
    { slug: 'desserts', name: 'Desserts & Ice Cream', emoji: '🍦' },
    { slug: 'coffee', name: 'Coffee & Drinks', emoji: '☕' },
    { slug: 'vegan', name: 'Vegan & Plant-Based', emoji: '🥗' },
];

async function getTruckCount() {
    try {
        const [result] = await db
            .select({ value: count() })
            .from(trucks)
            .where(eq(trucks.isVisible, true));
        return result?.value || 0;
    } catch {
        return 0;
    }
}

export default async function FoodTrucksPage() {
    const truckCount = await getTruckCount();

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <h1 className="text-4xl font-extrabold text-slate-800 mb-3 text-center">
                    Find Food Trucks in Adelaide & South Australia
                </h1>
                <p className="text-lg text-slate-600 mb-2 text-center max-w-2xl mx-auto">
                    Browse food trucks by location or cuisine. Whether you&apos;re in the CBD or the wine regions,
                    we&apos;ll help you find your next favourite meal on wheels.
                </p>
                {truckCount > 0 && (
                    <p className="text-center text-orange-600 font-bold mb-12">
                        {truckCount} food truck{truckCount !== 1 ? 's' : ''} listed across South Australia
                    </p>
                )}

                <h2 className="text-2xl font-bold text-slate-800 mb-6">📍 By Location</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {LOCATIONS.map((loc) => (
                        <Link
                            key={loc.slug}
                            href={`/food-trucks/${loc.slug}`}
                            className="bg-white rounded-2xl border-2 border-orange-100 hover:border-orange-300 p-5 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
                        >
                            <div className="text-3xl mb-2">{loc.emoji}</div>
                            <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{loc.name}</h3>
                            <p className="text-sm text-slate-500">{loc.tagline}</p>
                        </Link>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-6">🍽️ By Cuisine</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {CUISINES.map((c) => (
                        <Link
                            key={c.slug}
                            href={`/food-trucks/cuisine/${c.slug}`}
                            className="bg-white rounded-2xl border-2 border-orange-100 hover:border-orange-300 p-5 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
                        >
                            <div className="text-3xl mb-2">{c.emoji}</div>
                            <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{c.name}</h3>
                            <p className="text-sm text-slate-500">Food trucks in Adelaide</p>
                        </Link>
                    ))}
                </div>

                <div className="text-center bg-white rounded-2xl border-2 border-orange-100 p-8 shadow-md">
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Can&apos;t find your area?</h2>
                    <p className="text-slate-600 mb-6">
                        Use our live map to find food trucks anywhere in South Australia, in real time.
                    </p>
                    <Link
                        href="/map"
                        className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-colors"
                    >
                        🗺️ Open Live Map
                    </Link>
                </div>
            </div>
        </div>
    );
}
