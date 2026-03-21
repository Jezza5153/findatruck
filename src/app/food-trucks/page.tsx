import type { Metadata } from 'next';
import Link from 'next/link';
import { count, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { IconArrowRight, IconCoffee, IconLeaf, IconMap, IconMapPin, IconPizza, IconSparkles, IconStar } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Find Food Trucks by Location — Adelaide & South Australia',
  description: 'Browse food trucks by location across Adelaide and South Australia. Find street food in the CBD, Glenelg, Adelaide Hills, Barossa Valley, McLaren Vale, and more.',
  alternates: { canonical: 'https://foodtrucknext2me.com/food-trucks' },
  openGraph: {
    title: 'Find Food Trucks by Location in Adelaide & South Australia',
    description: 'Browse suburbs, beaches, wine regions, and cuisine landing pages to discover the best food trucks across South Australia.',
    url: 'https://foodtrucknext2me.com/food-trucks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Food Trucks by Location — Adelaide & South Australia',
    description: 'Browse suburbs, beaches, and cuisine guides to discover the best food trucks across South Australia.',
  },
};

const LOCATIONS = [
  { slug: 'adelaide-cbd', name: 'Adelaide CBD', tagline: 'City centre lunch runs, late-night bites, market energy', accent: 'Core district' },
  { slug: 'glenelg', name: 'Glenelg', tagline: 'Beachside food trucks, sunsets, and Jetty Road foot traffic', accent: 'Foreshore favourite' },
  { slug: 'henley-beach', name: 'Henley Beach', tagline: 'Easygoing coastal dining with golden-hour crowd appeal', accent: 'Sunset hotspot' },
  { slug: 'adelaide-hills', name: 'Adelaide Hills', tagline: 'Weekend drives, wineries, and scenic gourmet street food', accent: 'Weekend escape' },
  { slug: 'mclaren-vale', name: 'McLaren Vale', tagline: 'Food trucks among cellar doors, weddings, and events', accent: 'Wine region' },
  { slug: 'barossa-valley', name: 'Barossa Valley', tagline: 'Regional events and vineyard experiences with serious flavour', accent: 'Destination dining' },
  { slug: 'port-adelaide', name: 'Port Adelaide', tagline: 'Harbour precinct meals, markets, and western suburb crowds', accent: 'Harbour precinct' },
  { slug: 'norwood', name: 'Norwood & Eastern Suburbs', tagline: 'The Parade, parks, and polished local food discovery', accent: 'Neighbourhood pick' },
];

const CUISINES = [
  { slug: 'mexican', name: 'Mexican', description: 'Tacos, burritos, and punchy street food favourites', icon: IconStar },
  { slug: 'italian', name: 'Italian & Pizza', description: 'Wood-fired pizza, pasta, and Italian comfort food', icon: IconPizza },
  { slug: 'greek', name: 'Greek', description: 'Souvlaki, gyros, and Mediterranean classics', icon: IconMapPin },
  { slug: 'asian', name: 'Asian', description: 'Thai, Vietnamese, Korean, Japanese, and more', icon: IconSparkles },
  { slug: 'bbq', name: 'BBQ & Burgers', description: 'Smash burgers, brisket, loaded fries, and grill favourites', icon: IconMap },
  { slug: 'desserts', name: 'Desserts & Ice Cream', description: 'Gelato, doughnuts, waffles, churros, and sweet finishes', icon: IconCoffee },
  { slug: 'coffee', name: 'Coffee & Drinks', description: 'Specialty coffee, juices, smoothies, and mobile caffeine', icon: IconCoffee },
  { slug: 'vegan', name: 'Vegan & Plant-Based', description: 'Plant-powered bowls, wraps, burgers, and desserts', icon: IconLeaf },
];

async function getTruckCount() {
  try {
    const [result] = await db
      .select({ value: count() })
      .from(trucks)
      .where(eq(trucks.isVisible, true));
    return result?.value || 0;
  } catch {
    return 0;
  }
}

export default async function FoodTrucksPage() {
  const truckCount = await getTruckCount();

  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <section className="surface-panel p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Browse Adelaide & South Australia
              </div>
              <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Browse food trucks by suburb, beach, wine region, or craving.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                This is the fastest way to move from a vague “what should we eat?” to a specific place, cuisine, or local area with better odds of finding the right truck.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/map"
                  className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  Open Live Map
                  <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/featured"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  See Featured Trucks
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Active directory</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">{truckCount}+</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Visible trucks indexed across South Australia.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Discovery</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Perfect when you want a neighbourhood or cuisine-first way to browse.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Coverage</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Adelaide + SA</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">City, coast, hills, and wine-region landing pages built for search and real users.</p>
              </div>
            </div>
          </div>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'Find Food Trucks by Location in Adelaide and South Australia',
              url: 'https://foodtrucknext2me.com/food-trucks',
              hasPart: [
                ...LOCATIONS.map((loc) => ({
                  '@type': 'WebPage',
                  name: loc.name,
                  url: `https://foodtrucknext2me.com/food-trucks/${loc.slug}`,
                })),
                ...CUISINES.map((cuisine) => ({
                  '@type': 'WebPage',
                  name: cuisine.name,
                  url: `https://foodtrucknext2me.com/food-trucks/cuisine/${cuisine.slug}`,
                })),
              ],
            }),
          }}
        />

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Location landing pages</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Browse where people actually search</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {LOCATIONS.map((loc, index) => (
              <Link
                key={loc.slug}
                href={`/food-trucks/${loc.slug}`}
                className="group rounded-[28px] border border-orange-100 bg-white/92 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    {loc.accent}
                  </span>
                  <span className="font-display text-2xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                  {loc.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{loc.tagline}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                  Explore this area
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Cuisine landing pages</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Browse by the mood you are in</h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine.slug}
                href={`/food-trucks/cuisine/${cuisine.slug}`}
                className="group rounded-[28px] border border-orange-100 bg-white/92 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft"
              >
                <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
                  <cuisine.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                  {cuisine.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{cuisine.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                  Browse this cuisine
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="surface-panel mt-10 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Real-time fallback</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Need a faster answer than browsing?</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Use the live map for what&apos;s open right now, or jump into featured picks when you want a stronger chance of finding something exceptional quickly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Open Live Map
              </Link>
              <Link
                href="/featured"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
              >
                Explore Featured
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
