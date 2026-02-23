import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Corporate Food Truck Catering Adelaide — Office Lunches & Team Events',
    description: 'Book food truck catering for your corporate event in Adelaide. Perfect for team lunches, client functions, conferences, and office parties across South Australia.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck/corporate' },
};

export default function CorporateFoodTrucksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/hire-food-truck" className="hover:text-orange-600">Hire a Food Truck</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">Corporate</span>
                </nav>

                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
                    Corporate Food Truck Catering in Adelaide
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Skip the boring sandwich platter. Food truck catering brings energy, variety, and a
                    memorable experience to your corporate events. Whether it&apos;s a team lunch, end-of-year
                    party, client event, or conference — Adelaide&apos;s food trucks deliver.
                </p>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Perfect For</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: '🍽️', title: 'Team Lunches', text: 'Weekly or monthly team lunch from a rotating roster of food trucks.' },
                            { icon: '🎄', title: 'End of Year Parties', text: 'Give your team something to look forward to — food trucks bring the party.' },
                            { icon: '🤝', title: 'Client Functions', text: 'Impress clients with a unique, premium dining experience.' },
                            { icon: '🎤', title: 'Conferences & Seminars', text: 'Feed large groups efficiently with multiple trucks and cuisine options.' },
                            { icon: '🏗️', title: 'Construction Sites', text: 'Hot meals delivered to remote or hard-to-reach worksites.' },
                            { icon: '🎯', title: 'Product Launches', text: 'Create buzz with gourmet food alongside your next big reveal.' },
                        ].map((item) => (
                            <div key={item.title} className="p-4 bg-orange-50 rounded-2xl">
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                                <p className="text-sm text-slate-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-3xl p-8 shadow-2xl shadow-orange-500/20 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">Get a Corporate Quote</h2>
                    <p className="text-white/90 mb-6">Tell us about your event — guest count, date, and preferences — and we&apos;ll recommend the best food truck options.</p>
                    <a
                        href="mailto:info@foodtrucknext2me.com?subject=Corporate%20Food%20Truck%20Enquiry"
                        className="inline-flex items-center px-8 py-4 bg-white text-orange-600 font-bold rounded-full shadow-xl hover:bg-orange-50 transition-colors text-lg"
                    >
                        🏢 Get Corporate Quote
                    </a>
                </div>
            </div>
        </div>
    );
}
