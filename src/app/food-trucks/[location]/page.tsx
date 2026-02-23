import type { Metadata } from 'next';
import Link from 'next/link';

const LOCATIONS = [
    { slug: 'adelaide-cbd', name: 'Adelaide CBD', description: 'Find food trucks in the heart of Adelaide. From Rundle Mall to North Terrace, discover the best street food in the city centre.', areas: ['Rundle Mall', 'North Terrace', 'Hindley Street', 'Victoria Square', 'Central Market'] },
    { slug: 'glenelg', name: 'Glenelg', description: 'Discover food trucks along the Glenelg foreshore and Jetty Road. Beachside dining at its best with Adelaide\'s favourite mobile food vendors.', areas: ['Jetty Road', 'Moseley Square', 'Glenelg Beach', 'Holdfast Shores'] },
    { slug: 'henley-beach', name: 'Henley Beach', description: 'Food trucks serving up delicious eats near Henley Beach and Henley Square. Perfect sunset dining with your feet in the sand.', areas: ['Henley Square', 'Henley Beach Road', 'West Beach'] },
    { slug: 'adelaide-hills', name: 'Adelaide Hills', description: 'Explore food trucks across the Adelaide Hills region. From Stirling to Hahndorf, find gourmet street food surrounded by stunning scenery.', areas: ['Stirling', 'Hahndorf', 'Mount Lofty', 'Crafers', 'Lobethal'] },
    { slug: 'mclaren-vale', name: 'McLaren Vale', description: 'Food trucks among the vineyards of McLaren Vale. Wine region street food at its best — pair a gourmet meal with world-class wines.', areas: ['McLaren Vale township', 'Willunga', 'Aldinga', 'Sellicks Beach'] },
    { slug: 'barossa-valley', name: 'Barossa Valley', description: 'Discover food trucks in the Barossa Valley wine region. Find mobile food vendors serving fresh, local cuisine alongside South Australia\'s finest wines.', areas: ['Tanunda', 'Angaston', 'Nuriootpa', 'Lyndoch'] },
    { slug: 'port-adelaide', name: 'Port Adelaide', description: 'Find food trucks around Port Adelaide and the inner west. From the Lighthouse markets to the revitalised port precinct, discover exciting street food.', areas: ['Port Adelaide', 'Semaphore', 'Largs Bay', 'Birkenhead'] },
    { slug: 'norwood', name: 'Norwood & Eastern Suburbs', description: 'Food trucks in Adelaide\'s eastern suburbs. From The Parade in Norwood to the parks of Burnside, find your next meal on wheels.', areas: ['Norwood', 'Kent Town', 'Burnside', 'Magill', 'Stepney'] },
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
        },
    };
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <nav className="text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-orange-600">Home</Link>
                    <span className="mx-2">›</span>
                    <Link href="/food-trucks" className="hover:text-orange-600">Locations</Link>
                    <span className="mx-2">›</span>
                    <span className="text-slate-800 font-medium">{loc.name}</span>
                </nav>

                <h1 className="text-4xl font-extrabold text-slate-800 mb-4">
                    Food Trucks in {loc.name}
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                    {loc.description}
                </p>

                <div className="bg-white rounded-2xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Popular Areas</h2>
                    <div className="flex flex-wrap gap-2">
                        {loc.areas.map((area) => (
                            <span key={area} className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                📍 {area}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Find Food Trucks in {loc.name}</h2>
                    <p className="text-slate-600 mb-4">
                        Use our live map to see which food trucks are currently serving in {loc.name} and surrounding areas.
                        Filter by cuisine, check menus, and get directions — all in real time.
                    </p>
                    <Link
                        href="/map"
                        className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-colors"
                    >
                        🗺️ Open Live Map
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border-2 border-orange-100 p-6 shadow-md mb-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Own a Food Truck in {loc.name}?</h2>
                    <p className="text-slate-600 mb-4">
                        List your food truck on Food Truck Next 2 Me for free and reach customers in {loc.name} and across Adelaide.
                        Update your location, manage your menu, and grow your following.
                    </p>
                    <Link
                        href="/owner/signup"
                        className="inline-flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-colors"
                    >
                        🚚 Register Your Truck — Free
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
