import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Blog — Food Truck Next 2 Me',
    description: 'Tips, guides, and stories from Adelaide\'s food truck scene. Learn about permits, events, trending trucks, and everything street food in South Australia.',
    alternates: { canonical: 'https://foodtrucknext2me.com/blog' },
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

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-extrabold text-slate-800 mb-3 text-center">Blog</h1>
                <p className="text-lg text-slate-600 mb-12 text-center">
                    Guides, tips, and stories from Adelaide&apos;s food truck scene.
                </p>

                <div className="space-y-6">
                    {POSTS.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block bg-white rounded-3xl border-2 border-orange-100 hover:border-orange-300 p-6 shadow-sm hover:shadow-lg transition-all group"
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
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
