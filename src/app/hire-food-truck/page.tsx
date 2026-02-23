import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata: Metadata = {
    title: 'Hire a Food Truck in Adelaide — Catering for Events, Weddings & Corporate',
    description: 'Hire the best food trucks in Adelaide and South Australia for your event, wedding, or corporate function. Browse food truck caterers, get quotes, and book the perfect mobile kitchen.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck' },
    openGraph: {
        title: 'Hire a Food Truck in Adelaide',
        description: 'Find and book food truck catering for your next event in Adelaide and South Australia.',
    },
};

const CATEGORIES = [
    {
        slug: 'weddings',
        name: 'Wedding Food Trucks',
        emoji: '💒',
        description: 'Make your special day unforgettable with gourmet food truck catering. From wood-fired pizza to artisan desserts, our wedding food trucks bring a unique dining experience your guests will love.',
        keywords: ['wedding catering adelaide', 'wedding food truck SA', 'unique wedding catering'],
    },
    {
        slug: 'corporate',
        name: 'Corporate Catering',
        emoji: '🏢',
        description: 'Impress clients and reward employees with food truck catering for your next corporate event, team lunch, or office party. Easy ordering, flexible menus, and a memorable experience.',
        keywords: ['corporate food truck adelaide', 'office catering SA', 'team lunch food truck'],
    },
    {
        slug: 'events',
        name: 'Events & Festivals',
        emoji: '🎪',
        description: 'Planning a festival, market, or community event? Find food trucks available for booking across Adelaide. From Fork on the Road to private parties — we connect you with the best vendors.',
        keywords: ['food truck event adelaide', 'hire food truck festival', 'food truck booking SA'],
    },
];

export default function HireFoodTruckPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">Hire a Food Truck</span>
                </nav>

                <h1 className="text-4xl font-extrabold text-slate-800 mb-4 text-center">
                    Hire a Food Truck in Adelaide
                </h1>
                <p className="text-lg text-slate-600 mb-12 text-center max-w-3xl mx-auto">
                    Looking for food truck catering in Adelaide and South Australia? Whether it&apos;s a
                    wedding, corporate event, or festival — we connect you with the best mobile food
                    vendors in the state.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/hire-food-truck/${cat.slug}`}
                            className="bg-white rounded-3xl border-2 border-orange-100 hover:border-orange-300 p-8 shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] group"
                        >
                            <div className="text-5xl mb-4">{cat.emoji}</div>
                            <h2 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors mb-3">
                                {cat.name}
                            </h2>
                            <p className="text-slate-600 text-sm leading-relaxed">{cat.description}</p>
                        </Link>
                    ))}
                </div>

                {/* How it works */}
                <div className="bg-white rounded-3xl border-2 border-orange-100 p-8 shadow-md mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">How Food Truck Catering Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-3">1</div>
                            <h3 className="font-bold text-slate-800 mb-2">Browse & Choose</h3>
                            <p className="text-sm text-slate-600">Explore food trucks by cuisine, location, or event type. Read reviews and check menus.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-3">2</div>
                            <h3 className="font-bold text-slate-800 mb-2">Send an Enquiry</h3>
                            <p className="text-sm text-slate-600">Fill out the enquiry form with your event details. We&apos;ll connect you directly with matching food trucks.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-3">3</div>
                            <h3 className="font-bold text-slate-800 mb-2">Book & Enjoy</h3>
                            <p className="text-sm text-slate-600">Finalise details directly with the food truck owner. Sit back and let them deliver an amazing food experience.</p>
                        </div>
                    </div>
                </div>

                {/* Enquiry form */}
                <EnquiryForm eventType="other" />

                {/* SEO content */}
                <div className="mt-12 text-center text-sm text-slate-400">
                    <p>Food truck catering Adelaide · Food truck hire South Australia · Mobile kitchen catering · Event food trucks Adelaide</p>
                </div>
            </div>
        </div>
    );
}
