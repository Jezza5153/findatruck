import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import { IconArrowRight, IconMapPin, IconSparkles, IconTrendingUp, IconUsers } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
    title: 'Corporate Food Truck Catering Adelaide — Office Lunches & Team Events',
    description: 'Book food truck catering for your corporate event in Adelaide. Perfect for team lunches, client functions, conferences, and office parties across South Australia.',
    alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck/corporate' },
    openGraph: {
        title: 'Corporate Food Truck Catering Adelaide',
        description: 'Corporate food truck catering for Adelaide office lunches, launches, staff events, and brand activations.',
        url: 'https://foodtrucknext2me.com/hire-food-truck/corporate',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Corporate Food Truck Catering Adelaide',
        description: 'Plan Adelaide corporate food truck catering with a stronger enquiry path and clearer event framing.',
    },
};

const FAQ_ITEMS = [
    {
        question: 'What kinds of corporate events suit food truck catering?',
        answer: 'Food trucks work well for team lunches, staff appreciation days, conferences, launches, construction-site catering, and brand activations where speed and atmosphere both matter.',
    },
    {
        question: 'Can food trucks handle larger corporate groups?',
        answer: 'Yes. They can be a good fit for larger groups, especially when the event brief includes guest count, timing, service style, and any site or access requirements.',
    },
    {
        question: 'Why choose food trucks over standard corporate catering?',
        answer: 'They can create a more memorable experience, offer more variety, and make office or event catering feel less generic than standard tray-based options.',
    },
];

export default function CorporateFoodTrucksPage() {
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
                                name: 'Corporate food truck catering in Adelaide',
                                serviceType: 'Corporate food truck hire',
                                provider: {
                                    '@type': 'Organization',
                                    name: 'Food Truck Next 2 Me',
                                    url: 'https://foodtrucknext2me.com',
                                },
                                areaServed: {
                                    '@type': 'State',
                                    name: 'South Australia',
                                },
                                url: 'https://foodtrucknext2me.com/hire-food-truck/corporate',
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
                                    { '@type': 'ListItem', position: 3, name: 'Corporate', item: 'https://foodtrucknext2me.com/hire-food-truck/corporate' },
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
                    <span className="text-slate-800 font-medium">Corporate</span>
                </nav>

                <section className="surface-panel overflow-hidden p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                        <div>
                            <div className="eyebrow-chip">
                                <IconSparkles className="h-4 w-4 text-orange-500" />
                                Corporate food truck catering
                            </div>
                            <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                                Corporate food truck catering in Adelaide that feels more alive than standard office catering.
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                                Team lunches, launches, client events, and large staff gatherings all benefit from catering that feels easier to enjoy and easier to remember.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <a
                                    href="#enquiry"
                                    className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                                >
                                    Start Corporate Enquiry
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
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Team + clients</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">A stronger fit for lunches, launches, activations, and staff events.</p>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Why it works</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Less generic</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Food trucks can add variety, atmosphere, and better brand energy to the event.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-8 bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="font-display text-2xl font-bold text-slate-950 mb-4">Perfect For</h2>
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

                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {[
                        { icon: IconTrendingUp, title: 'Brand fit', text: 'A better option when the event needs to feel modern, social, and slightly more premium.' },
                        { icon: IconUsers, title: 'Guest flow', text: 'Works well for teams and larger groups that need easier movement and service flexibility.' },
                        { icon: IconMapPin, title: 'Venue flexibility', text: 'Useful for offices, worksites, showrooms, launch spaces, and outdoor corporate setups.' },
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
                    <EnquiryForm eventType="corporate" />
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
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Need more context first?</p>
                            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Keep exploring before you decide what kind of event fit you need.</h2>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                                Browse featured trucks for inspiration, head back to the main hire page, or use the live map to see what the broader Adelaide truck scene looks like.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link href="/hire-food-truck" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800">
                                Main hire page
                            </Link>
                            <Link href="/map" className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                Open the map
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
