import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';

export const metadata: Metadata = {
    title: 'Wedding Food Trucks Adelaide — Unique Catering for Your Special Day',
    description: 'Find the best wedding food trucks in Adelaide and South Australia. Unique, memorable catering that your guests will love. Wood-fired pizza, gourmet burgers, dessert vans and more.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck/weddings' },
};

export default function WeddingFoodTrucksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/hire-food-truck" className="hover:text-orange-600">Hire a Food Truck</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">Weddings</span>
                </nav>

                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
                    Wedding Food Trucks in Adelaide
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    Ditch the traditional sit-down dinner and wow your guests with Adelaide&apos;s best
                    food truck catering. From wood-fired pizza under the stars to gourmet dessert
                    trucks serving late-night treats — food trucks bring a relaxed, fun dining
                    experience that makes your wedding truly memorable.
                </p>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Why Choose Food Truck Wedding Catering?</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: '🎉', title: 'Unique & Memorable', text: 'Your guests will talk about it for years. Food trucks create a social, interactive dining experience.' },
                            { icon: '💰', title: 'Cost-Effective', text: 'Skip the formal catering markup. Food trucks offer competitive pricing with flexible menu options.' },
                            { icon: '🍕', title: 'Diverse Cuisine', text: 'From Italian to Mexican, BBQ to desserts — mix and match trucks to suit every guest\'s taste.' },
                            { icon: '📍', title: 'Any Venue', text: 'Food trucks work everywhere — wineries, parks, backyards, farms, beaches. They bring the kitchen to you.' },
                        ].map((item) => (
                            <div key={item.title} className="p-4 bg-orange-50 rounded-2xl">
                                <div className="text-2xl mb-2">{item.icon}</div>
                                <h3 className="font-bold text-slate-800 mb-1">{item.title}</h3>
                                <p className="text-sm text-slate-600">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Popular Wedding Food Truck Cuisines</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Wood-Fired Pizza', 'Gourmet Burgers', 'Tacos & Mexican', 'Paella', 'Gelato & Ice Cream', 'Doughnuts & Desserts', 'Greek Souvlaki', 'Asian Fusion', 'BBQ & Smoked Meats', 'Coffee Vans'].map((c) => (
                            <span key={c} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{c}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Popular Wedding Venues for Food Trucks in SA</h2>
                    <ul className="space-y-2 text-slate-600">
                        {['McLaren Vale & Fleurieu wineries', 'Adelaide Hills barn & farm venues', 'Barossa Valley estates', 'Glenelg & beachside venues', 'Adelaide CBD rooftop events', 'Victor Harbor & South Coast venues'].map((v) => (
                            <li key={v} className="flex items-center gap-2"><span className="text-orange-500">📍</span> {v}</li>
                        ))}
                    </ul>
                </div>

                <EnquiryForm eventType="wedding" />

                <div className="text-center mt-8">
                    <Link href="/food-trucks" className="text-orange-600 hover:text-orange-500 font-medium">
                        ← Browse all food trucks in Adelaide
                    </Link>
                </div>
            </div>
        </div>
    );
}
