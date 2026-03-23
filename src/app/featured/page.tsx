import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { Card, CardContent } from '@/components/ui/card';
import {
  IconArrowRight,
  IconCalendarDays,
  IconMapPin,
  IconSparkles,
  IconStar,
  IconTruck,
  IconUsers,
} from '@/components/ui/branded-icons';
import { cn } from '@/lib/utils';
import { toJsonLd } from '@/lib/json-ld';

async function getFeaturedTrucks() {
  try {
    return await db
      .select({
        id: trucks.id,
        name: trucks.name,
        cuisine: trucks.cuisine,
        description: trucks.description,
        imageUrl: trucks.imageUrl,
        rating: trucks.rating,
        isOpen: trucks.isOpen,
        address: trucks.address,
      })
      .from(trucks)
      .where(and(eq(trucks.isVisible, true), eq(trucks.isFeatured, true)))
      .orderBy(desc(trucks.rating), desc(trucks.updatedAt));
  } catch {
    return [];
  }
}

const CURATION_REASONS = [
  {
    icon: IconStar,
    title: 'Stronger signals first',
    description: 'Use featured when you want a better first shortlist instead of browsing the full directory from scratch.',
  },
  {
    icon: IconUsers,
    title: 'Great for first-time visitors',
    description: 'These trucks create an easier entry point for customers, event planners, and anyone deciding where to start.',
  },
  {
    icon: IconCalendarDays,
    title: 'Useful for event inspiration',
    description: 'If you are planning a booking, featured trucks are a better place to gather quality references before sending an enquiry.',
  },
];

const QUICK_LINKS = [
  { href: '/map', label: 'Open live map' },
  { href: '/hire-food-truck', label: 'Plan an event' },
  { href: '/food-trucks', label: 'All locations & cuisines' },
  { href: '/owner/signup', label: 'List your truck' },
];

export default async function FeaturedPage() {
  const featuredTrucks = await getFeaturedTrucks();
  const openCount = featuredTrucks.filter((truck) => truck.isOpen).length;
  const ratedCount = featuredTrucks.filter((truck) => (truck.rating ?? 0) > 0).length;
  const cuisineCount = new Set(featuredTrucks.map((truck) => truck.cuisine)).size;

  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: 'Featured Food Trucks in Adelaide and South Australia',
                url: 'https://foodtrucknext2me.com/featured',
                mainEntity: {
                  '@type': 'ItemList',
                  itemListElement: featuredTrucks.map((truck, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    url: `https://foodtrucknext2me.com/trucks/${truck.id}`,
                    name: truck.name,
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
                    name: 'Featured Food Trucks',
                    item: 'https://foodtrucknext2me.com/featured',
                  },
                ],
              },
            ]),
          }}
        />

        <section className="surface-panel overflow-hidden p-8 sm:p-10">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Hand-picked discovery
              </div>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                The featured page should feel like your smartest first click.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                This is where standout Adelaide and South Australia food trucks get a more curated spotlight, giving customers
                a faster route to confidence and giving planners a better place to start building a shortlist.
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
                  href="/hire-food-truck"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Hire for an Event
                </Link>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Want broader discovery too?{' '}
                <Link href="/food-trucks" className="font-semibold text-orange-700 hover:text-orange-500">
                  Browse every location and cuisine page
                </Link>
                .
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-glow">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Why featured matters</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Not every visitor wants a blank-slate search experience.</h2>
                <p className="mt-3 text-sm leading-7 text-white/72">
                  Featured works best when someone wants a stronger starting point, cleaner inspiration, or a higher-confidence
                  shortlist before they dive into the full platform.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Featured now</p>
                    <p className="mt-2 font-display text-3xl font-bold text-white">{featuredTrucks.length}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Open now</p>
                    <p className="mt-2 font-display text-3xl font-bold text-white">{openCount}</p>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Cuisines</p>
                    <p className="mt-2 font-display text-3xl font-bold text-white">{cuisineCount}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Signal</p>
                  <p className="mt-3 font-display text-3xl font-bold text-slate-950">Top-rated</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Great menus, better presentation, and trucks people remember.</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Social proof</p>
                  <p className="mt-3 font-display text-3xl font-bold text-slate-950">{ratedCount}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Featured trucks currently showing rating data on the platform.</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                  <p className="mt-3 font-display text-3xl font-bold text-slate-950">Shortlists</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">A cleaner starting page for both cravings and event inspiration.</p>
                </div>
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

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">How to use featured well</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Use this page to narrow taste, quality, and confidence faster.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-right sm:text-base">
              Featured should feel like the premium lane in the product: quicker to trust, calmer to browse, and easier to turn
              into the next click whether that means a truck profile, the live map, or an event enquiry.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {CURATION_REASONS.map((reason) => (
              <div key={reason.title} className="rounded-[28px] border border-orange-100 bg-white/95 p-6 shadow-sm">
                <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600 shadow-sm">
                  <reason.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-slate-950">{reason.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Curated trucks</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">The trucks that should feel easier to say yes to.</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-right sm:text-base">
              Open trucks are still useful in the moment, but featured is about quality perception too: memorable brands, better
              menus, and cleaner reasons to click deeper.
            </p>
          </div>

          {featuredTrucks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featuredTrucks.map((truck) => (
                <Link key={truck.id} href={`/trucks/${truck.id}`} className="block h-full">
                  <Card className="group h-full overflow-hidden rounded-[30px] border border-orange-100 bg-white/96 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                    <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-500 to-amber-400 text-3xl font-bold text-white shadow-lg">
                            {truck.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-orange-600">Featured Food Truck</span>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                        <IconSparkles className="h-3.5 w-3.5 text-brand-yellow" />
                        Featured
                      </div>

                      <div
                        className={cn(
                          'absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg',
                          truck.isOpen ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-700 backdrop-blur-sm'
                        )}
                      >
                        {truck.isOpen ? 'Open Now' : truck.cuisine}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                            {truck.name}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-slate-500">{truck.cuisine}</p>
                        </div>
                        {truck.rating && truck.rating > 0 ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700">
                            <IconStar className="h-4 w-4 fill-current" />
                            {truck.rating.toFixed(1)}
                          </div>
                        ) : null}
                      </div>

                      {truck.description ? (
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600">{truck.description}</p>
                      ) : (
                        <p className="text-sm leading-7 text-slate-500">
                          Explore menus, atmosphere, location details, and reviews for this featured Adelaide food truck.
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-orange-100 pt-4">
                        {truck.address ? (
                          <span className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-500">
                            <IconMapPin className="h-4 w-4 flex-shrink-0 text-orange-500" />
                            <span className="truncate">{truck.address}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <IconTruck className="h-4 w-4 text-orange-500" />
                            Adelaide & South Australia
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                          View truck profile
                          <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="section-frame rounded-[28px] border-none shadow-none">
              <CardContent className="p-16 text-center">
                <div className="mx-auto mb-4 inline-flex rounded-[28px] bg-orange-100 p-4 text-orange-600">
                  <IconSparkles className="h-10 w-10" />
                </div>
                <h2 className="font-display text-3xl font-bold text-slate-950">No featured trucks yet</h2>
                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
                  Featured is intentionally curated, not auto-filled. In the meantime, use the live map for open-now discovery or the hire page if you are planning an event.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/map"
                    className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                  >
                    Explore the Live Map
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/hire-food-truck"
                    className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                  >
                    Plan an Event
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="surface-panel-dark mt-8 overflow-hidden p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Next step</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Turn the featured page into the right next action, not a dead end.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
                Once someone finds a truck they like, the product should keep momentum going. That can mean opening the live map,
                browsing truck profiles, or moving into the event-booking flow with stronger inspiration already in hand.
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/map"
                className="rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-5 text-white transition-colors hover:bg-white/[0.1]"
              >
                <p className="text-sm font-semibold text-brand-yellow">Live discovery</p>
                <p className="mt-1 font-display text-2xl font-bold">See what is open right now</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Jump from curated picks into the full real-time map when the decision becomes immediate.</p>
              </Link>
              <Link
                href="/hire-food-truck"
                className="rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-5 text-white transition-colors hover:bg-white/[0.1]"
              >
                <p className="text-sm font-semibold text-brand-yellow">Event planning</p>
                <p className="mt-1 font-display text-2xl font-bold">Hire a food truck with less friction</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Use featured trucks as inspiration, then move into the dedicated event enquiry flow.</p>
              </Link>
              <Link
                href="/food-trucks"
                className="rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-5 text-white transition-colors hover:bg-white/[0.1]"
              >
                <p className="text-sm font-semibold text-brand-yellow">SEO discovery pages</p>
                <p className="mt-1 font-display text-2xl font-bold">Browse all locations and cuisines</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Move from curation into the broader suburb and cuisine pages when you want a wider comparison set.</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
