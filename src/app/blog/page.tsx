import type { Metadata } from 'next';
import Link from 'next/link';
import { IconArrowRight, IconBookOpen, IconMapPin, IconSparkles } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
    title: 'Blog — Food Truck Next 2 Me',
    description: 'Tips, guides, and stories from Adelaide\'s food truck scene. Learn about permits, events, trending trucks, and everything street food in South Australia.',
    alternates: { canonical: 'https://foodtrucknext2me.com/blog' },
    openGraph: {
        title: 'Food Truck Next 2 Me Blog',
        description: 'Adelaide food truck guides, event coverage, and owner-focused articles from Food Truck Next 2 Me.',
        url: 'https://foodtrucknext2me.com/blog',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Food Truck Next 2 Me Blog',
        description: 'Adelaide food truck guides, event coverage, and owner resources.',
    },
};

interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
    category: string;
}

const POSTS: BlogPost[] = [
    {
        slug: 'best-food-trucks-adelaide-2026',
        title: 'Best Food Trucks in Adelaide 2026',
        excerpt: 'Discover the top food trucks serving Adelaide right now — from gourmet burgers to wood-fired pizza, this is your ultimate guide to street food in SA.',
        date: '2026-02-23',
        readTime: '5 min read',
        category: 'Guides',
    },
    {
        slug: 'food-truck-permits-south-australia',
        title: 'How to Get Food Truck Permits in South Australia',
        excerpt: 'Everything you need to know about getting your food truck licensed in SA — council permits, food safety requirements, insurance, and costs.',
        date: '2026-02-23',
        readTime: '8 min read',
        category: 'Owner Guides',
    },
    {
        slug: 'food-trucks-fork-on-the-road-2026',
        title: 'Food Trucks at Fork on the Road 2026',
        excerpt: 'Your guide to South Australia\'s biggest food truck festival — dates, locations, vendors, and how to apply as a food truck owner.',
        date: '2026-02-23',
        readTime: '6 min read',
        category: 'Events',
    },
];

const QUICK_LINKS = [
    { href: '/map', label: 'Open live map' },
    { href: '/events', label: 'Events & festivals' },
    { href: '/food-trucks', label: 'Browse trucks' },
    { href: '/hire-food-truck', label: 'Hire a food truck' },
];

export default function BlogPage() {
    return (
        <div className="ambient-shell min-h-screen px-4 py-10">
            <div className="container mx-auto max-w-5xl">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: toJsonLd([
                            {
                                '@context': 'https://schema.org',
                                '@type': 'CollectionPage',
                                name: 'Food Truck Next 2 Me Blog',
                                url: 'https://foodtrucknext2me.com/blog',
                                description: 'Adelaide food truck articles, event guides, and owner-focused content.',
                                mainEntity: {
                                    '@type': 'ItemList',
                                    itemListElement: POSTS.map((post, index) => ({
                                        '@type': 'ListItem',
                                        position: index + 1,
                                        name: post.title,
                                        url: `https://foodtrucknext2me.com/blog/${post.slug}`,
                                    })),
                                },
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
                                        name: 'Blog',
                                        item: 'https://foodtrucknext2me.com/blog',
                                    },
                                ],
                            },
                        ]),
                    }}
                />

                <section className="surface-panel overflow-hidden p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                        <div>
                            <div className="eyebrow-chip">
                                <IconSparkles className="h-4 w-4 text-orange-500" />
                                Adelaide food truck stories and guides
                            </div>
                            <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                                Blog articles that strengthen Adelaide food truck discovery, events, and owner know-how.
                            </h1>
                            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                                This is where the platform builds more depth around Adelaide food truck culture, local events, and the kinds of questions owners and customers actually ask.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Articles</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">{POSTS.length}</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Local guides and event/owner content that support search authority.</p>
                            </div>
                            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Context</p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Useful when people need more than a directory and want local knowledge too.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="inline-flex whitespace-nowrap rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="mt-8 space-y-6">
                    {POSTS.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block rounded-3xl border-2 border-orange-100 bg-white hover:border-orange-300 p-6 shadow-sm hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-3 text-sm">
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">{post.category}</span>
                                <span className="text-slate-400">{post.date}</span>
                                <span className="text-slate-400">· {post.readTime}</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors mb-2">
                                {post.title}
                            </h2>
                            <p className="text-slate-600">{post.excerpt}</p>
                            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                                Read article
                                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </section>

                <section className="section-frame mt-8 p-8 sm:p-10">
                    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Keep exploring</p>
                            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Use the blog as context, then move back into action.</h2>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                The strongest content paths on the site should not stop at reading. They should push people toward the <Link href="/map" className="font-semibold text-orange-700 hover:text-orange-500">live map</Link>,
                                the <Link href="/events" className="font-semibold text-orange-700 hover:text-orange-500">events pages</Link>, or the <Link href="/hire-food-truck" className="font-semibold text-orange-700 hover:text-orange-500">hire flow</Link>.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                            <Link href="/map" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-100">
                                <span className="flex items-center gap-2"><IconMapPin className="h-4 w-4 text-orange-600" /> Live map</span>
                                <IconArrowRight className="h-4 w-4 text-orange-600" />
                            </Link>
                            <Link href="/events" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                <span className="flex items-center gap-2"><IconBookOpen className="h-4 w-4 text-orange-600" /> Adelaide events</span>
                                <IconArrowRight className="h-4 w-4 text-orange-600" />
                            </Link>
                            <Link href="/food-trucks" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                                <span className="flex items-center gap-2"><IconMapPin className="h-4 w-4 text-orange-600" /> Browse trucks</span>
                                <IconArrowRight className="h-4 w-4 text-orange-600" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
