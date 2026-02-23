import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata: Metadata = {
    title: 'Food Trucks for Events in Adelaide — Festivals, Markets & Private Parties',
    description: 'Book food trucks for your event in Adelaide and South Australia. Perfect for festivals, markets, community events, and private parties. Find available vendors and get quotes.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck/events' },
};

export default function EventFoodTrucksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/hire-food-truck" className="hover:text-orange-600">Hire a Food Truck</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">Events</span>
                </nav>

                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
                    Food Trucks for Events in Adelaide
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Planning a festival, market, or community event in Adelaide? Food trucks are the
                    perfect solution — no kitchen build-out, no permanent infrastructure, just delicious
                    food served fresh. We connect event organisers with Adelaide&apos;s best food truck vendors.
                </p>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Popular SA Events with Food Trucks</h2>
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
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Event Types We Cater</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Festivals', 'Night Markets', 'School Fetes', 'Sports Events', 'Private Parties', 'Birthday Celebrations', 'Charity Events', 'Community Days', 'Grand Openings', 'Christmas Parties'].map((t) => (
                            <span key={t} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">🎪 {t}</span>
                        ))}
                    </div>
                </div>

                <EnquiryForm eventType="festival" />
            </div>
        </div>
    );
}
