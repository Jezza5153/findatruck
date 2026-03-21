import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { IconMapPin, IconSparkles, IconTruck } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

const CUISINES = [
    { slug: 'mexican', name: 'Mexican', description: 'Find the best Mexican food trucks in Adelaide. Tacos, burritos, nachos, quesadillas and more — authentic Mexican street food on wheels across South Australia.', dishes: ['Tacos', 'Burritos', 'Nachos', 'Quesadillas', 'Churros', 'Elote'], keywords: ['mexican', 'taco', 'burrito', 'nacho', 'quesadilla'] },
    { slug: 'italian', name: 'Italian & Pizza', description: 'Discover Italian food trucks and wood-fired pizza vans in Adelaide. From Neapolitan pizza to fresh pasta, find authentic Italian street food across South Australia.', dishes: ['Wood-fired Pizza', 'Pasta', 'Arancini', 'Gelato', 'Panini', 'Bruschetta'], keywords: ['italian', 'pizza', 'pasta', 'wood-fired', 'neapolitan'] },
    { slug: 'greek', name: 'Greek', description: 'Find Greek food trucks serving souvlaki, gyros, and loukoumades across Adelaide. Authentic Hellenic street food from South Australia\'s favourite Greek vendors.', dishes: ['Souvlaki', 'Gyros', 'Loukoumades', 'Halloumi Fries', 'Greek Salad', 'Spanakopita'], keywords: ['greek', 'souvlaki', 'gyros', 'gyro', 'loukoumades', 'halloumi'] },
    { slug: 'asian', name: 'Asian', description: 'Explore Asian food trucks in Adelaide — from Thai and Vietnamese to Korean and Japanese. Find the best Asian street food on wheels in South Australia.', dishes: ['Pad Thai', 'Bao Buns', 'Dumplings', 'Satay', 'Pho', 'Korean Fried Chicken'], keywords: ['asian', 'thai', 'vietnamese', 'korean', 'japanese', 'chinese', 'pho', 'bao', 'dumpling', 'ramen', 'sushi'] },
    { slug: 'bbq', name: 'BBQ & Burgers', description: 'Find BBQ and burger food trucks across Adelaide. From smoked brisket to gourmet smash burgers, discover the best grilled food on wheels in South Australia.', dishes: ['Smash Burgers', 'Pulled Pork', 'Smoked Brisket', 'Loaded Fries', 'Hot Dogs', 'Ribs'], keywords: ['bbq', 'burger', 'grill', 'smash', 'brisket', 'ribs', 'pulled pork', 'smoke'] },
    { slug: 'desserts', name: 'Desserts & Ice Cream', description: 'Discover dessert food trucks and ice cream vans in Adelaide. From gelato to doughnuts, find sweet treats on wheels across South Australia.', dishes: ['Gelato', 'Doughnuts', 'Waffles', 'Churros', 'Frozen Yoghurt', 'Sundaes'], keywords: ['dessert', 'ice cream', 'gelato', 'doughnut', 'donut', 'waffle', 'churro', 'sweet'] },
    { slug: 'coffee', name: 'Coffee & Drinks', description: 'Find mobile coffee vans and drinks trucks across Adelaide. From specialty espresso to fresh juices, fuel up on the go across South Australia.', dishes: ['Specialty Coffee', 'Cold Brew', 'Fresh Juice', 'Smoothies', 'Chai', 'Hot Chocolate'], keywords: ['coffee', 'espresso', 'juice', 'smoothie', 'drink', 'chai', 'brew'] },
    { slug: 'vegan', name: 'Vegan & Plant-Based', description: 'Discover vegan and plant-based food trucks in Adelaide. From Buddha bowls to vegan burgers, find the best plant-powered street food in South Australia.', dishes: ['Vegan Burgers', 'Buddha Bowls', 'Falafel', 'Acai Bowls', 'Plant Wraps', 'Raw Desserts'], keywords: ['vegan', 'plant', 'vegetarian', 'falafel', 'acai', 'buddha bowl'] },
];

export async function generateStaticParams() {
    return CUISINES.map((c) => ({ cuisine: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ cuisine: string }> }): Promise<Metadata> {
    const { cuisine } = await params;
    const c = CUISINES.find((item) => item.slug === cuisine);
    if (!c) return { title: 'Food Trucks by Cuisine' };

    return {
        title: `${c.name} Food Trucks Adelaide — Best Street Food`,
        description: c.description,
        alternates: { canonical: `https://foodtrucknext2me.com/food-trucks/cuisine/${c.slug}` },
        openGraph: {
            title: `${c.name} Food Trucks in Adelaide`,
            description: c.description,
            url: `https://foodtrucknext2me.com/food-trucks/cuisine/${c.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${c.name} Food Trucks in Adelaide`,
            description: c.description,
        },
    };
}

async function getTrucksForCuisine(keywords: string[]) {
    try {
        const allTrucks = await db
            .select({
                id: trucks.id,
                name: trucks.name,
                cuisine: trucks.cuisine,
                description: trucks.description,
                rating: trucks.rating,
                isOpen: trucks.isOpen,
                address: trucks.address,
                imageUrl: trucks.imageUrl,
            })
            .from(trucks)
            .where(eq(trucks.isVisible, true));

        return allTrucks.filter((truck) => {
            const cuisineLower = (truck.cuisine || '').toLowerCase();
            const nameLower = (truck.name || '').toLowerCase();
            const descLower = (truck.description || '').toLowerCase();
            return keywords.some((kw) =>
                cuisineLower.includes(kw) || nameLower.includes(kw) || descLower.includes(kw)
            );
        });
    } catch {
        return [];
    }
}

export default async function CuisinePage({ params }: { params: Promise<{ cuisine: string }> }) {
    const { cuisine } = await params;
    const c = CUISINES.find((item) => item.slug === cuisine);

    if (!c) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-600">Cuisine not found.</p>
            </div>
        );
    }

    const cuisineTrucks = await getTrucksForCuisine(c.keywords);

    return (
        <div className="ambient-shell min-h-screen px-4 py-10">
            <div className="container mx-auto max-w-5xl">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: toJsonLd({
                            '@context': 'https://schema.org',
                            '@type': 'CollectionPage',
                            name: `${c.name} Food Trucks in Adelaide`,
                            url: `https://foodtrucknext2me.com/food-trucks/cuisine/${c.slug}`,
                            mainEntity: {
                                '@type': 'ItemList',
                                itemListElement: cuisineTrucks.map((truck, index) => ({
                                    '@type': 'ListItem',
                                    position: index + 1,
                                    url: `https://foodtrucknext2me.com/trucks/${truck.id}`,
                                    name: truck.name,
                                })),
                            },
                        }),
                    }}
                />

                <section className="surface-panel p-8 sm:p-10">
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/food-trucks" className="hover:text-orange-600">Food Trucks</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">{c.name}</span>
                </nav>

                <div className="eyebrow-chip">
                    <IconSparkles className="h-4 w-4 text-orange-500" />
                    Cuisine landing page
                </div>
                <h1 className="mt-5 font-display text-4xl font-extrabold text-slate-800 mb-4">
                    {c.name} Food Trucks in Adelaide
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {c.description}
                </p>
                </section>

                {/* Real truck listings — crawlable <a> links */}
                <div className="section-frame mb-8 mt-8 p-6 shadow-none">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                        {cuisineTrucks.length > 0
                            ? `${c.name} Food Trucks (${cuisineTrucks.length})`
                            : `${c.name} Food Trucks Coming Soon`}
                    </h2>

                    {cuisineTrucks.length > 0 ? (
                        <div className="space-y-3">
                            {cuisineTrucks.map((truck) => (
                                <Link
                                    key={truck.id}
                                    href={`/trucks/${truck.id}`}
                                    className="group flex items-center gap-4 rounded-[24px] border border-orange-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
                                >
                                    {truck.imageUrl ? (
                                        <img
                                            src={truck.imageUrl}
                                            alt={`${truck.name} — ${c.name} food truck Adelaide`}
                                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-orange-200 flex items-center justify-center text-2xl flex-shrink-0">🚚</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-display text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                            {truck.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">{truck.cuisine}</p>
                                        {truck.address && (
                                            <p className="mt-1 truncate text-xs text-slate-400">{truck.address}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        {truck.isOpen && (
                                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">Open</span>
                                        )}
                                        {truck.rating && truck.rating > 0 && (
                                            <span className="text-sm text-yellow-600 font-bold">★ {truck.rating.toFixed(1)}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-slate-500 mb-4">
                                No {c.name.toLowerCase()} food trucks listed yet. Check back soon — new trucks join every week!
                            </p>
                            <Link
                                href="/map"
                                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-600"
                            >
                                <IconMapPin className="h-4 w-4" />
                                Browse All Trucks
                            </Link>
                        </div>
                    )}
                </div>

                <div className="section-frame mb-8 p-6 shadow-none">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Popular {c.name} Dishes</h2>
                    <div className="flex flex-wrap gap-2">
                        {c.dishes.map((dish) => (
                            <span key={dish} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                {dish}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="surface-panel-dark mb-8 p-6">
                    <h2 className="mb-4 text-xl font-bold text-white">Serve {c.name} Food?</h2>
                    <p className="mb-4 text-white/75">
                        List your {c.name.toLowerCase()} food truck on Food Truck Next 2 Me for free. Reach customers searching for
                        {' '}{c.name.toLowerCase()} street food across Adelaide.
                    </p>
                    <Link
                        href="/owner/signup"
                        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-slate-950 transition-colors hover:bg-orange-50"
                    >
                        <IconTruck className="h-4 w-4" />
                        Register Your Truck
                    </Link>
                </div>

                <div className="text-center mt-12">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Explore Other Cuisines</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {CUISINES.filter((item) => item.slug !== c.slug).map((item) => (
                            <Link
                                key={item.slug}
                                href={`/food-trucks/cuisine/${item.slug}`}
                                className="px-4 py-2 bg-white border-2 border-orange-200 hover:border-orange-400 text-slate-700 rounded-full text-sm font-medium transition-colors hover:text-orange-600"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
