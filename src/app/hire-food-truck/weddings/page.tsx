import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import { IconArrowRight, IconCalendarDays, IconHeart, IconSparkles, IconUsers } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
    title: 'Wedding Food Trucks Adelaide — Unique Catering for Your Special Day',
    description: 'Find the best wedding food trucks in Adelaide and South Australia. Unique, memorable catering that your guests will love. Wood-fired pizza, gourmet burgers, dessert vans and more.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck/weddings' },
    openGraph: {
        title: 'Wedding Food Trucks Adelaide',
        description: 'Wedding food truck catering ideas and enquiry flow for Adelaide and South Australia.',
        url: 'https://foodtrucknext2me.com/hire-food-truck/weddings',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Wedding Food Trucks Adelaide',
        description: 'Plan wedding food truck catering in Adelaide with a clearer enquiry path and local ideas.',
    },
};

const FAQ_ITEMS = [
    {
        question: 'Are food trucks a good fit for Adelaide weddings?',
        answer: 'Yes. They work especially well for relaxed, social weddings where couples want memorable food, flexible service, and a less traditional catering feel.',
    },
    {
        question: 'What details should I include in a wedding enquiry?',
        answer: 'Include your wedding date, guest count, venue area, service style, and any cuisine or dietary preferences so the enquiry starts from the right fit.',
    },
    {
        question: 'Can food trucks work at winery, barn, and outdoor venues?',
        answer: 'Yes. Food trucks are often a strong fit for Adelaide Hills, McLaren Vale, Barossa, and other outdoor or flexible wedding venues where mobile catering suits the setting.',
    },
];

export default function WeddingFoodTrucksPage() {
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
                                name: 'Wedding food truck catering in Adelaide',
                                serviceType: 'Wedding food truck hire',
                                provider: {
                                    '@type': 'Organization',
                                    name: 'Food Truck Next 2 Me',
                                    url: 'https://foodtrucknext2me.com',
                                },
                                areaServed: {
                                    '@type': 'State',
                                    name: 'South Australia',
                                },
                                url: 'https://foodtrucknext2me.com/hire-food-truck/weddings',
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
                                    { '@type': 'ListItem', position: 3, name: 'Weddings', item: 'https://foodtrucknext2me.com/hire-food-truck/weddings' },
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
                    <span className="text-slate-800 font-medium">Weddings</span>
                </nav>

                <section className="surface-panel overflow-hidden p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                        <div>
                            <div className="eyebrow-chip">
                                <IconSparkles className="h-4 w-4 text-orange-500" />
                                Adelaide wedding catering
                            </div>
                            <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                                Wedding food trucks in Adelaide that feel memorable without feeling overdone.
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                                From winery receptions to barn venues, beach weddings, and private properties, food truck catering can make the
                                whole wedding feel warmer, more social, and far easier to remember.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="#enquiry"
                                    className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                                >
                                    Start Wedding Enquiry
                                    <IconArrowRight className="h-4 w-4" />
                                </a>
                                <Link
                                    href="/featured"
                                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                                >
                                    Explore Featured Trucks
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Relaxed weddings</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Couples who want atmosphere, movement, and memorable food moments.</p>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Popular regions</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Hills + Vale</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Strong fit for Adelaide Hills, McLaren Vale, Barossa, and outdoor venue styles.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-8 bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="font-display text-2xl font-bold text-slate-950 mb-4">Why Choose Food Truck Wedding Catering?</h2>
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
                    <h2 className="font-display text-2xl font-bold text-slate-950 mb-4">Popular Wedding Food Truck Cuisines</h2>
                    <div className="flex flex-wrap gap-2">
                        {['Wood-Fired Pizza', 'Gourmet Burgers', 'Tacos & Mexican', 'Paella', 'Gelato & Ice Cream', 'Doughnuts & Desserts', 'Greek Souvlaki', 'Asian Fusion', 'BBQ & Smoked Meats', 'Coffee Vans'].map((c) => (
                            <span key={c} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{c}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="font-display text-2xl font-bold text-slate-950 mb-4">Popular Wedding Venues for Food Trucks in SA</h2>
                    <ul className="space-y-2 text-slate-600">
                        {['McLaren Vale & Fleurieu wineries', 'Adelaide Hills barn & farm venues', 'Barossa Valley estates', 'Glenelg & beachside venues', 'Adelaide CBD rooftop events', 'Victor Harbor & South Coast venues'].map((v) => (
                            <li key={v} className="flex items-center gap-2"><span className="text-orange-500">📍</span> {v}</li>
                        ))}
                    </ul>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {[
                        { icon: IconHeart, title: 'Atmosphere', text: 'Food trucks make the dining part of the wedding feel social instead of formal and stiff.' },
                        { icon: IconUsers, title: 'Guest-friendly', text: 'They work especially well when couples want more choice, easier movement, and a fun service style.' },
                        { icon: IconCalendarDays, title: 'Planning fit', text: 'Strong for outdoor, regional, winery, and flexible-format wedding venues across South Australia.' },
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
                    <EnquiryForm eventType="wedding" />
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
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Still deciding?</p>
                            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Keep browsing before you lock in the right wedding fit.</h2>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                If you want more inspiration first, browse the full directory, explore featured trucks, or head back to the main hire page.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link href="/food-trucks" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800">
                                Browse all trucks
                            </Link>
                            <Link href="/hire-food-truck" className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                Main hire page
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
