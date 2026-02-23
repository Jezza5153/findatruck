import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPost {
    slug: string;
    title: string;
    date: string;
    readTime: string;
    category: string;
    metaDescription: string;
    content: string;
}

const POSTS: Record<string, BlogPost> = {
    'best-food-trucks-adelaide-2026': {
        slug: 'best-food-trucks-adelaide-2026',
        title: 'Best Food Trucks in Adelaide 2026',
        date: '2026-02-23',
        readTime: '5 min read',
        category: 'Guides',
        metaDescription: 'Discover the best food trucks in Adelaide for 2026. From gourmet burgers to wood-fired pizza, here are the top street food vendors you need to try in South Australia.',
        content: `
Adelaide's food truck scene has exploded in recent years, and 2026 is shaping up to be the biggest year yet. Whether you're a local foodie or visiting South Australia for the first time, here's your guide to the best food trucks you need to track down.

## Why Adelaide's Food Truck Scene is Booming

South Australia has embraced the food truck movement like few other Australian states. With year-round events like Fork on the Road, the Royal Adelaide Show, and Adelaide Fringe, there's always somewhere to find great street food. The relaxed outdoor dining culture and Adelaide's world-class wine regions make it the perfect setting for food trucks.

## How to Find Food Trucks Near You

The easiest way to find food trucks in Adelaide is with **Food Truck Next 2 Me** — our live map shows you exactly where food trucks are serving right now. You can filter by cuisine, check menus, read reviews, and even earn loyalty rewards when you check in.

## Top Cuisines to Try

- **Wood-Fired Pizza** — Nothing beats a Neapolitan pizza cooked in a mobile wood-fired oven. Several Adelaide food trucks specialise in this craft.
- **Gourmet Burgers** — From smash burgers to loaded wagyu creations, Adelaide's burger trucks are next level.
- **Mexican Street Food** — Authentic tacos, burritos, and elote from trucks that take Mexican cuisine seriously.
- **Greek Souvlaki** — Adelaide has a strong Greek food tradition, and the souvlaki trucks here are some of the best in Australia.
- **Dessert Trucks** — Gelato, churros, loukoumades, and artisan doughnuts — the perfect way to end any food truck crawl.

## Where to Find Them

Food trucks in Adelaide pop up everywhere from the CBD to beachside locations:

- **Adelaide CBD** — Rundle Mall, Victoria Square, and the Central Market precinct
- **Glenelg** — Along the foreshore and Jetty Road
- **Henley Beach** — Henley Square is a food truck hotspot, especially at sunset
- **Adelaide Hills** — Stirling, Hahndorf, and Mount Lofty attract food trucks on weekends
- **Wine Regions** — McLaren Vale and Barossa Valley wineries frequently host food trucks

## Find Your Next Meal

Ready to explore? Head to the [live map](/map) to see what's open right now, or browse food trucks [by location](/food-trucks) or [by cuisine](/food-trucks).

Food truck owners can [register for free](/owner/signup) to get listed and start reaching hungry customers across Adelaide.
    `.trim(),
    },

    'food-truck-permits-south-australia': {
        slug: 'food-truck-permits-south-australia',
        title: 'How to Get Food Truck Permits in South Australia',
        date: '2026-02-23',
        readTime: '8 min read',
        category: 'Owner Guides',
        metaDescription: 'Complete guide to getting food truck permits in South Australia. Learn about council requirements, food safety licences, insurance, and costs for operating a mobile food business in Adelaide.',
        content: `
Starting a food truck in South Australia? Before you fire up the grill, you'll need to navigate the permitting and licensing process. This guide covers everything you need to know about operating a mobile food business legally in SA.

## Step 1: Food Business Registration

All food businesses in South Australia, including food trucks, must be registered with their local council. This is a requirement under the Food Act 2001 (SA).

**What you need:**
- Complete a food business notification form
- Provide details of your food handling processes
- Outline your food safety supervisor qualifications
- Pay the registration fee (varies by council, typically $200–$500/year)

## Step 2: Council Trading Permits

Each council in Adelaide has its own rules about where and when food trucks can trade. You'll need a **mobile food vending permit** from each council area where you plan to operate.

**Key councils and what to expect:**

- **City of Adelaide** — CBD trading requires a specific permit. High demand, limited spots.
- **City of Holdfast Bay** (Glenelg) — Popular beachside spots require booking through the council.
- **Port Adelaide Enfield** — Permits available for designated trading areas. Insurance and public liability required.
- **City of Marion** — Food truck-friendly with designated spots near shopping areas.

## Step 3: Food Safety Requirements

South Australia requires all food businesses to:

1. **Appoint a Food Safety Supervisor** — At least one person must hold an approved food safety supervisor certificate.
2. **Develop a Food Safety Plan** — Document your food handling, storage, and preparation processes.
3. **Maintain records** — Temperature logs, cleaning schedules, and supplier information.

## Step 4: Insurance

You'll need:

- **Public Liability Insurance** — Minimum $10 million cover (most councils require this)
- **Product Liability Insurance** — Covers claims related to your food products
- **Motor Vehicle Insurance** — For the truck itself
- **Workers Compensation** — If you employ staff

## Step 5: Vehicle Requirements

Your food truck must comply with:

- SA food safety standards for mobile food premises
- Local council vehicle inspection requirements
- Australian Design Rules for road registration
- LPG gas compliance (if applicable)

## Costs Breakdown

| Item | Estimated Cost |
|------|---------------|
| Council registration | $200–$500/year |
| Trading permits (per council) | $100–$1,000/year |
| Food safety supervisor cert | $100–$200 |
| Public liability insurance | $500–$2,000/year |
| Health inspection fees | $100–$300/year |

## Ready to Get Started?

Once you're permitted and ready to trade, [list your food truck for free](/owner/signup) on Food Truck Next 2 Me. Our platform helps Adelaide food truck owners reach more customers, manage their online presence, and track their performance.

For more information about specific council requirements, contact your local council directly or visit the [SA Health website](https://www.sahealth.sa.gov.au).
    `.trim(),
    },

    'food-trucks-fork-on-the-road-2026': {
        slug: 'food-trucks-fork-on-the-road-2026',
        title: 'Food Trucks at Fork on the Road 2026',
        date: '2026-02-23',
        readTime: '6 min read',
        category: 'Events',
        metaDescription: 'Your complete guide to Fork on the Road 2026 — South Australia\'s biggest food truck festival. Dates, locations, how to attend, and how food truck owners can apply to participate.',
        content: `
Fork on the Road is South Australia's premier food truck and street food festival series, attracting thousands of food lovers across multiple events throughout the year. Here's everything you need to know about Fork on the Road in 2026.

## What is Fork on the Road?

Fork on the Road brings together the best food trucks, mobile kitchens, and street food vendors in South Australia for a series of outdoor dining events. With live music, local drinks, and a festival atmosphere, it's the ultimate food truck experience.

## Why Fork on the Road Matters

For food truck owners, Fork on the Road is one of the most important events on the SA calendar:

- **Massive foot traffic** — Thousands of attendees per event
- **Brand exposure** — Get your truck in front of new customers
- **Networking** — Connect with other vendors and event organisers
- **Revenue** — High-volume trading opportunities

## For Food Truck Owners: How to Apply

If you want to trade at Fork on the Road events, here's what you need:

1. **Registered food business** — Must be compliant with SA food safety requirements
2. **Public liability insurance** — Minimum $10 million
3. **Professional presentation** — Quality truck, clear branding, and a strong menu
4. **Apply early** — Spots are competitive and fill up fast

Visit the [Fork on the Road website](https://www.forkontheroad.com) for application details.

## For Attendees: What to Expect

- Multiple food trucks and vendors in one location
- Live music and entertainment
- Local wine, beer, and craft drinks
- Family-friendly atmosphere
- Free entry (pay for food and drinks)

## Other Major SA Food Truck Events

Besides Fork on the Road, keep an eye out for:

- **Royal Adelaide Show** — SA's biggest annual event
- **Adelaide Fringe** — Food hubs across the city
- **Gluttony** — Rymill Park food festival hub
- **WOMADelaide** — World music + food
- **Local council markets** — Many councils host regular food truck nights

## Track Food Trucks Year-Round

Don't wait for festivals — use [Food Truck Next 2 Me](/map) to find open food trucks any day of the week. Our live map shows you what's serving right now across Adelaide and South Australia.

Food truck owners can [register for free](/owner/signup) to stay visible between events and build a loyal customer base.
    `.trim(),
    },
};

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = POSTS[slug];
    if (!post) return { title: 'Blog Post Not Found' };

    return {
        title: `${post.title} — Food Truck Next 2 Me`,
        description: post.metaDescription,
        alternates: { canonical: `https://foodtrucknext2me.com/blog/${post.slug}` },
        openGraph: {
            title: post.title,
            description: post.metaDescription,
            type: 'article',
            publishedTime: post.date,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = POSTS[slug];
    if (!post) return notFound();

    // Convert markdown-like content to basic HTML sections
    const sections = post.content.split('\n\n').map((block, i) => {
        if (block.startsWith('## ')) {
            return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-8 mb-4">{block.replace('## ', '')}</h2>;
        }
        if (block.startsWith('| ')) {
            // Simple table rendering
            const rows = block.split('\n').filter(r => !r.startsWith('|--'));
            const headers = rows[0]?.split('|').filter(Boolean).map(s => s.trim());
            const data = rows.slice(1).map(r => r.split('|').filter(Boolean).map(s => s.trim()));
            return (
                <div key={i} className="overflow-x-auto my-4">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>{headers?.map((h, j) => <th key={j} className="text-left p-3 bg-orange-100 text-slate-700 font-bold border-b-2 border-orange-200">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {data.map((row, ri) => (
                                <tr key={ri} className="border-b border-orange-100">
                                    {row.map((cell, ci) => <td key={ci} className="p-3 text-slate-600">{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (block.startsWith('- ')) {
            const items = block.split('\n').map(l => l.replace(/^- /, ''));
            return (
                <ul key={i} className="space-y-2 my-4 ml-4">
                    {items.map((item, j) => (
                        <li key={j} className="text-slate-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-800">$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-600 hover:text-orange-500 underline">$1</a>') }} />
                        </li>
                    ))}
                </ul>
            );
        }
        if (block.startsWith('1. ')) {
            const items = block.split('\n').map(l => l.replace(/^\d+\. /, ''));
            return (
                <ol key={i} className="space-y-2 my-4 ml-4 list-decimal list-inside">
                    {items.map((item, j) => (
                        <li key={j} className="text-slate-600">
                            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-800">$1</strong>') }} />
                        </li>
                    ))}
                </ol>
            );
        }
        // Regular paragraph with inline formatting
        return (
            <p key={i} className="text-slate-600 leading-relaxed my-4"
                dangerouslySetInnerHTML={{
                    __html: block
                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-slate-800">$1</strong>')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-600 hover:text-orange-500 underline">$1</a>')
                }}
            />
        );
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            {/* Article JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Article',
                        headline: post.title,
                        datePublished: post.date,
                        author: { '@type': 'Organization', name: 'Food Truck Next 2 Me' },
                        publisher: { '@type': 'Organization', name: 'Food Truck Next 2 Me', url: 'https://foodtrucknext2me.com' },
                        description: post.metaDescription,
                    }),
                }}
            />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <nav className="text-sm text-slate-500 mb-8">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/blog" className="hover:text-orange-600">Blog</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">{post.title}</span>
                </nav>

                <article className="bg-white rounded-3xl border-2 border-orange-100 p-8 shadow-md">
                    <div className="flex items-center gap-3 mb-6 text-sm">
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">{post.category}</span>
                        <span className="text-slate-400">{post.date}</span>
                        <span className="text-slate-400">· {post.readTime}</span>
                    </div>

                    <h1 className="text-3xl font-extrabold text-slate-800 mb-6">{post.title}</h1>

                    <div className="prose prose-slate max-w-none">
                        {sections}
                    </div>
                </article>

                <div className="text-center mt-8">
                    <Link href="/blog" className="text-orange-600 hover:text-orange-500 font-medium">
                        ← Back to all articles
                    </Link>
                </div>
            </div>
        </div>
    );
}
