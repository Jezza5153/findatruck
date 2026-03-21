import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { IconMapPin, IconSparkles, IconTruck } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

const LOCATIONS = [
    { slug: 'adelaide-cbd', name: 'Adelaide CBD', description: 'Find food trucks in the heart of Adelaide. From Rundle Mall to North Terrace, discover the best street food in the city centre.', areas: ['Rundle Mall', 'North Terrace', 'Hindley Street', 'Victoria Square', 'Central Market'], keywords: ['adelaide', 'cbd', 'city', 'rundle', 'north terrace', 'hindley', 'victoria square', 'central market'] },
    { slug: 'glenelg', name: 'Glenelg', description: 'Discover food trucks along the Glenelg foreshore and Jetty Road. Beachside dining at its best with Adelaide\'s favourite mobile food vendors.', areas: ['Jetty Road', 'Moseley Square', 'Glenelg Beach', 'Holdfast Shores'], keywords: ['glenelg', 'jetty road', 'holdfast', 'moseley'] },
    { slug: 'henley-beach', name: 'Henley Beach', description: 'Food trucks serving up delicious eats near Henley Beach and Henley Square. Perfect sunset dining with your feet in the sand.', areas: ['Henley Square', 'Henley Beach Road', 'West Beach'], keywords: ['henley', 'west beach'] },
    { slug: 'adelaide-hills', name: 'Adelaide Hills', description: 'Explore food trucks across the Adelaide Hills region. From Stirling to Hahndorf, find gourmet street food surrounded by stunning scenery.', areas: ['Stirling', 'Hahndorf', 'Mount Lofty', 'Crafers', 'Lobethal'], keywords: ['stirling', 'hahndorf', 'mount lofty', 'crafers', 'lobethal', 'hills'] },
    { slug: 'mclaren-vale', name: 'McLaren Vale', description: 'Food trucks among the vineyards of McLaren Vale. Wine region street food at its best — pair a gourmet meal with world-class wines.', areas: ['McLaren Vale township', 'Willunga', 'Aldinga', 'Sellicks Beach'], keywords: ['mclaren', 'willunga', 'aldinga', 'sellicks'] },
    { slug: 'barossa-valley', name: 'Barossa Valley', description: 'Discover food trucks in the Barossa Valley wine region. Find mobile food vendors serving fresh, local cuisine alongside South Australia\'s finest wines.', areas: ['Tanunda', 'Angaston', 'Nuriootpa', 'Lyndoch'], keywords: ['barossa', 'tanunda', 'angaston', 'nuriootpa', 'lyndoch'] },
    { slug: 'port-adelaide', name: 'Port Adelaide', description: 'Find food trucks around Port Adelaide and the inner west. From the Lighthouse markets to the revitalised port precinct, discover exciting street food.', areas: ['Port Adelaide', 'Semaphore', 'Largs Bay', 'Birkenhead'], keywords: ['port adelaide', 'semaphore', 'largs', 'birkenhead'] },
    { slug: 'norwood', name: 'Norwood & Eastern Suburbs', description: 'Food trucks in Adelaide\'s eastern suburbs. From The Parade in Norwood to the parks of Burnside, find your next meal on wheels.', areas: ['Norwood', 'Kent Town', 'Burnside', 'Magill', 'Stepney'], keywords: ['norwood', 'kent town', 'burnside', 'magill', 'stepney', 'parade'] },
];

export async function generateStaticParams() {
    return LOCATIONS.map((loc) => ({ location: loc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
    const { location } = await params;
    const loc = LOCATIONS.find((l) => l.slug === location);
    if (!loc) return { title: 'Food Trucks Near You' };

    return {
        title: `Food Trucks in ${loc.name} — Find Street Food Near You`,
        description: loc.description,
        alternates: { canonical: `https://foodtrucknext2me.com/food-trucks/${loc.slug}` },
        openGraph: {
            title: `Food Trucks in ${loc.name}`,
            description: loc.description,
            url: `https://foodtrucknext2me.com/food-trucks/${loc.slug}`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `Food Trucks in ${loc.name}`,
            description: loc.description,
        },
    };
}

async function getTrucksForLocation(keywords: string[]) {
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

        // Filter trucks whose address matches any of the location keywords
        return allTrucks.filter((truck) => {
            if (!truck.address) return false;
            const addr = truck.address.toLowerCase();
            return keywords.some((kw) => addr.includes(kw));
        });
    } catch {
        return [];
    }
}

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
    const { location } = await params;
    const loc = LOCATIONS.find((l) => l.slug === location);

    if (!loc) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-600">Location not found.</p>
            </div>
        );
    }

    const locationTrucks = await getTrucksForLocation(loc.keywords);

    return (
        <div className="ambient-shell min-h-screen px-4 py-10">
            <div className="container mx-auto max-w-5xl">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: toJsonLd({
                            '@context': 'https://schema.org',
                            '@type': 'CollectionPage',
                            name: `Food Trucks in ${loc.name}`,
                            url: `https://foodtrucknext2me.com/food-trucks/${loc.slug}`,
                            mainEntity: {
                                '@type': 'ItemList',
                                itemListElement: locationTrucks.map((truck, index) => ({
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
                    <Link href="/food-trucks" className="hover:text-orange-600">Locations</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">{loc.name}</span>
                </nav>

                <div className="eyebrow-chip">
                    <IconSparkles className="h-4 w-4 text-orange-500" />
                    Location landing page
                </div>
                <h1 className="mt-5 text-4xl font-extrabold text-slate-800 mb-4 font-display">
                    Food Trucks in {loc.name}
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {loc.description}
                </p>
                </section>

                {/* Real truck listings — crawlable <a> links */}
                <div className="section-frame mb-8 mt-8 p-6 shadow-none">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                        {locationTrucks.length > 0
                            ? `Food Trucks in ${loc.name} (${locationTrucks.length})`
                            : `Food Trucks Coming to ${loc.name}`}
                    </h2>

                    {locationTrucks.length > 0 ? (
                        <div className="space-y-3">
                            {locationTrucks.map((truck) => (
                                <Link
                                    key={truck.id}
                                    href={`/trucks/${truck.id}`}
                                    className="group flex items-center gap-4 rounded-[24px] border border-orange-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
                                >
                                    {truck.imageUrl ? (
                                        <img
                                            src={truck.imageUrl}
                                            alt={`${truck.name} food truck in ${loc.name}`}
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
                                No food trucks are currently listed in {loc.name}. Check back soon — new trucks are joining every week!
                            </p>
                            <Link
                                href="/map"
                                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-bold text-white transition-colors hover:bg-orange-600"
                            >
                                <IconMapPin className="h-4 w-4" />
                                Open Live Map
                            </Link>
                        </div>
                    )}
                </div>

                <div className="section-frame mb-8 p-6 shadow-none">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Popular Areas</h2>
                    <div className="flex flex-wrap gap-2">
                        {loc.areas.map((area) => (
                            <span key={area} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                {area}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="surface-panel-dark mb-8 p-6">
                    <h2 className="mb-4 text-xl font-bold text-white">Own a Food Truck in {loc.name}?</h2>
                    <p className="mb-4 text-white/75">
                        List your food truck on Food Truck Next 2 Me for free and reach customers in {loc.name} and across Adelaide.
                        Update your location, manage your menu, and grow your following.
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
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Explore Other Locations</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {LOCATIONS.filter((l) => l.slug !== loc.slug).map((l) => (
                            <Link
                                key={l.slug}
                                href={`/food-trucks/${l.slug}`}
                                className="px-4 py-2 bg-white border-2 border-orange-200 hover:border-orange-400 text-slate-700 rounded-full text-sm font-medium transition-colors hover:text-orange-600"
                            >
                                {l.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
