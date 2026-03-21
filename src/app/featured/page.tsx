import Link from 'next/link';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { Card, CardContent } from '@/components/ui/card';
import { IconArrowRight, IconMapPin, IconSparkles, IconStar, IconTruck } from '@/components/ui/branded-icons';
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
        isFeatured: trucks.isFeatured,
      })
      .from(trucks)
      .where(and(eq(trucks.isVisible, true), eq(trucks.isFeatured, true)))
      .orderBy(desc(trucks.rating), desc(trucks.updatedAt));
  } catch {
    return [];
  }
}

export default async function FeaturedPage() {
  const featuredTrucks = await getFeaturedTrucks();

  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <section className="surface-panel overflow-hidden p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Hand-picked discovery
              </div>
              <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Featured food trucks worth planning around.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                A curated mix of standout trucks across Adelaide and South Australia, chosen for flavour, presentation, consistency, and the kind of menu people talk about after they leave.
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
                  href="/food-trucks"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Browse All Locations
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Signal</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Top-rated</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Great menus, strong reviews, and trucks customers actually remember.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Fresh picks</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">{featuredTrucks.length}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Featured trucks available to explore right now on the platform.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Cravings</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">When you want a safer “this will be worth it” choice, start here.</p>
              </div>
            </div>
          </div>
        </section>

        {featuredTrucks.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: toJsonLd({
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
              }),
            }}
          />
        )}

        <section className="mt-8">
          {featuredTrucks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featuredTrucks.map((truck) => (
                <Link key={truck.id} href={`/trucks/${truck.id}`} className="block h-full">
                  <Card className="group h-full overflow-hidden rounded-[28px] border border-orange-100 bg-white/96 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft">
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="mb-2 text-5xl">🚚</div>
                          <span className="text-sm font-medium text-orange-500">Featured Food Truck</span>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white">
                        <IconStar className="h-3.5 w-3.5 text-brand-yellow" />
                        Featured
                      </div>

                      {truck.isOpen !== undefined && (
                        <div className={cn(
                          "absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg",
                          truck.isOpen ? 'bg-amber-300 text-slate-950' : 'bg-slate-500 text-white'
                        )}>
                          {truck.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="truncate font-display text-2xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                            {truck.name}
                          </h2>
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
                        <p className="line-clamp-3 text-sm leading-7 text-slate-600">
                          {truck.description}
                        </p>
                      ) : (
                        <p className="text-sm leading-7 text-slate-500">
                          Explore menus, live location details, and reviews for this featured Adelaide food truck.
                        </p>
                      )}

                      {truck.address ? (
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                          <IconMapPin className="h-4 w-4 text-orange-500" />
                          <span className="truncate">{truck.address}</span>
                        </div>
                      ) : null}

                      <div className="mt-5 flex items-center justify-between border-t border-orange-100 pt-4 text-sm font-semibold text-orange-700">
                        <span className="inline-flex items-center gap-2">
                          <IconTruck className="h-4 w-4" />
                          View truck profile
                        </span>
                        <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="section-frame rounded-[28px] border-none shadow-none">
              <CardContent className="p-16 text-center">
                <div className="mb-4 text-6xl">⭐</div>
                <h2 className="font-display text-3xl font-bold text-slate-950">No featured trucks yet</h2>
                <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
                  Our featured collection is curated, not auto-filled. In the meantime, use the live map to explore every truck currently listed across South Australia.
                </p>
                <Link
                  href="/map"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  Explore all trucks
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
