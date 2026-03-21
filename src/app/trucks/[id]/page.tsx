import { db } from '@/lib/db';
import { trucks, menuItems, reviews as reviewsTable, users, festivalSightings, festivalEvents } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import TruckInteractive from '@/components/TruckInteractive';
import { IconGlobe, IconMapPin, IconPhone } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

type Props = {
  params: Promise<{ id: string }>;
};

async function getTruck(id: string) {
  const [truck] = await db
    .select()
    .from(trucks)
    .where(eq(trucks.id, id))
    .limit(1);
  return truck || null;
}

async function getMenuItems(truckId: string) {
  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.truckId, truckId));
}

async function getReviews(truckId: string) {
  return db
    .select({
      id: reviewsTable.id,
      rating: reviewsTable.rating,
      text: reviewsTable.text,
      ownerReply: reviewsTable.ownerReply,
      createdAt: reviewsTable.createdAt,
      userName: users.name,
    })
    .from(reviewsTable)
    .leftJoin(users, eq(reviewsTable.userId, users.id))
    .where(eq(reviewsTable.truckId, truckId))
    .orderBy(desc(reviewsTable.createdAt))
    .limit(20);
}

async function getEventSightings(truckId: string) {
  const sightings = await db
    .select({
      eventName: festivalEvents.name,
      eventSlug: festivalEvents.slug,
      eventLocation: festivalEvents.location,
      year: festivalSightings.year,
    })
    .from(festivalSightings)
    .innerJoin(festivalEvents, eq(festivalSightings.eventId, festivalEvents.id))
    .where(eq(festivalSightings.truckId, truckId))
    .orderBy(festivalEvents.name);

  // Deduplicate by event name
  const seen = new Set<string>();
  return sightings.filter(s => {
    if (seen.has(s.eventName)) return false;
    seen.add(s.eventName);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const truck = await getTruck(id);
    if (!truck) return { title: 'Food Truck Not Found' };

    const title = `${truck.name} — ${truck.cuisine} Food Truck Adelaide`;
    const description = truck.description
      ? `${truck.description.substring(0, 150)}${truck.description.length > 150 ? '...' : ''} — Find ${truck.name} on Food Truck Next 2 Me.`
      : `${truck.name} is a ${truck.cuisine} food truck in Adelaide, South Australia. View menu, location, and reviews.`;

    return {
      title,
      description,
      alternates: { canonical: `https://foodtrucknext2me.com/trucks/${id}` },
      openGraph: {
        title: `${truck.name} — ${truck.cuisine} Food Truck`,
        description,
        type: 'website',
        url: `https://foodtrucknext2me.com/trucks/${id}`,
        siteName: 'Food Truck Next 2 Me',
        ...(truck.imageUrl ? { images: [truck.imageUrl] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${truck.name} — ${truck.cuisine} Food Truck`,
        description,
        ...(truck.imageUrl ? { images: [truck.imageUrl] } : {}),
      },
    };
  } catch {
    return { title: 'Food Truck', description: 'View this food truck on Food Truck Next 2 Me.' };
  }
}

export default async function TruckDetailPage({ params }: Props) {
  const { id } = await params;

  type MenuItemRow = Awaited<ReturnType<typeof getMenuItems>>[number];
  type ReviewRow = Awaited<ReturnType<typeof getReviews>>[number];

  let truck: Awaited<ReturnType<typeof getTruck>> | null = null;
  let menu: MenuItemRow[] = [];
  let truckReviews: ReviewRow[] = [];
  let eventSightings: Awaited<ReturnType<typeof getEventSightings>> = [];
  try {
    [truck, menu, truckReviews, eventSightings] = await Promise.all([
      getTruck(id),
      getMenuItems(id),
      getReviews(id),
      getEventSightings(id),
    ]);
  } catch {
    truck = null;
    menu = [];
    truckReviews = [];
    eventSightings = [];
  }

  if (!truck) return notFound();

  const avgRating = truck.rating || 0;
  const ratingCount = truck.numberOfRatings || 0;

  // Group menu items by category
  const menuByCategory: Record<string, typeof menu> = {};
  for (const item of menu) {
    const cat = item.category || 'Menu';
    if (!menuByCategory[cat]) menuByCategory[cat] = [];
    menuByCategory[cat].push(item);
  }

  return (
    <>
      {/* JSON-LD Structured Data — proper <script> tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLd({
            '@context': 'https://schema.org',
            '@type': 'FoodEstablishment',
            name: truck.name,
            servesCuisine: truck.cuisine,
            description: truck.description || undefined,
            image: truck.imageUrl || undefined,
            telephone: truck.phone || truck.ctaPhoneNumber || undefined,
            url: `https://foodtrucknext2me.com/trucks/${id}`,
            address: truck.address ? {
              '@type': 'PostalAddress',
              streetAddress: truck.address,
              addressRegion: 'SA',
              addressCountry: 'AU',
            } : {
              '@type': 'PostalAddress',
              addressLocality: 'Adelaide',
              addressRegion: 'SA',
              addressCountry: 'AU',
            },
            ...(truck.lat && truck.lng ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: truck.lat,
                longitude: truck.lng,
              },
            } : {}),
            ...(avgRating > 0 ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: avgRating,
                reviewCount: ratingCount,
                bestRating: 5,
              },
            } : {}),
            ...(menu.length > 0 ? {
              hasMenu: {
                '@type': 'Menu',
                hasMenuSection: Object.entries(menuByCategory).map(([name, items]) => ({
                  '@type': 'MenuSection',
                  name,
                  hasMenuItem: items.map((item) => ({
                    '@type': 'MenuItem',
                    name: item.name,
                    description: item.description || undefined,
                    offers: {
                      '@type': 'Offer',
                      price: item.price,
                      priceCurrency: 'AUD',
                    },
                  })),
                })),
              },
            } : {}),
          }),
        }}
      />

      <div className="ambient-shell min-h-screen px-4 py-10 pb-24">
        {/* Hero Image */}
        <div className="container mx-auto max-w-5xl">
        <div className="surface-panel relative h-64 overflow-hidden rounded-[32px] sm:h-80">
          {truck.imageUrl && (
            <img
              src={truck.imageUrl}
              alt={`${truck.name} — ${truck.cuisine} food truck in Adelaide, South Australia`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-50 via-transparent to-transparent" />

          <div className="absolute top-4 left-4">
            <Link
              href="/map"
              className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
            >
              ← Back to Map
            </Link>
          </div>

          {truck.isOpen !== undefined && (
            <div className="absolute top-4 right-4">
              {truck.isOpen ? (
                <span className="rounded-full px-3 py-1.5 text-sm font-bold bg-amber-300 text-slate-950">
                  Open Now
                </span>
              ) : (
                <span className="rounded-full px-3 py-1.5 text-sm font-bold bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm">
                  {truck.cuisine}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="relative z-10 mx-auto max-w-4xl -mt-16 px-4">
          {/* Main Info — SSR crawlable content */}
          <div className="section-frame mb-6 p-6 shadow-none">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="mb-1 font-display text-4xl font-bold text-slate-950">
                  {truck.name}
                </h1>
                <p className="text-lg text-slate-500">
                  {truck.cuisine} food truck · Adelaide, South Australia
                </p>
              </div>
              {/* Client interactive buttons */}
              <TruckInteractive
                truckId={id}
                truckName={truck.name}
                isOpen={!!truck.isOpen}
                lat={truck.lat}
                lng={truck.lng}
                address={truck.address}
              />
            </div>

            {/* Rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-yellow-600">
                  <span className="text-lg">★</span>
                  <span className="font-bold">{avgRating.toFixed(1)}</span>
                </div>
                {ratingCount > 0 && (
                  <span className="text-slate-500 text-sm">({ratingCount} review{ratingCount !== 1 ? 's' : ''})</span>
                )}
              </div>
            )}

            {/* Description — crawlable */}
            {truck.description && (
              <p className="text-slate-600 leading-relaxed mb-4">{truck.description}</p>
            )}

            {/* Tags */}
            {truck.tags && truck.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {truck.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Contact Info — crawlable links */}
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {truck.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(truck.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <IconMapPin className="h-4 w-4 text-orange-500" />
                  <span>{truck.address}</span>
                </a>
              )}
              {(truck.ctaPhoneNumber || truck.phone) && (
                <a
                  href={`tel:${truck.ctaPhoneNumber || truck.phone}`}
                  className="flex items-center gap-2 text-slate-600 hover:text-green-600 transition-colors"
                >
                  <IconPhone className="h-4 w-4 text-green-600" />
                  <span>{truck.ctaPhoneNumber || truck.phone}</span>
                </a>
              )}
              {truck.websiteUrl && (
                <a
                  href={truck.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors"
                >
                  <IconGlobe className="h-4 w-4 text-orange-500" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>

            {/* Social Media — crawlable links */}
            {(truck.facebookHandle || truck.instagramHandle || truck.tiktokHandle) && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-orange-100">
                {truck.instagramHandle && (
                  <a href={`https://instagram.com/${truck.instagramHandle}`} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-600 rounded-xl text-sm font-medium transition-colors">
                    Instagram
                  </a>
                )}
                {truck.facebookHandle && (
                  <a href={`https://facebook.com/${truck.facebookHandle}`} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium transition-colors">
                    Facebook
                  </a>
                )}
                {truck.tiktokHandle && (
                  <a href={`https://tiktok.com/@${truck.tiktokHandle}`} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                    TikTok
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Seen At — Festival Sightings */}
          {eventSightings.length > 0 && (
            <div className="section-frame mb-6 p-6 shadow-none">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Seen At</h2>
              <p className="text-sm text-slate-500 mb-4">
                {truck.name} has been spotted at these Adelaide events and festivals
              </p>
              <div className="flex flex-wrap gap-2">
                {eventSightings.map((sighting) => (
                  <Link
                    key={sighting.eventSlug}
                    href={`/events/${sighting.eventSlug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                  >
                    🎪 {sighting.eventName}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Menu — SSR crawlable content */}
          <div className="section-frame mb-6 p-6 shadow-none">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Menu</h2>
            {menu.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(menuByCategory).map(([category, items]) => (
                  <div key={category}>
                    {Object.keys(menuByCategory).length > 1 && (
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 pb-2 border-b border-orange-100">{category}</h3>
                    )}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-white p-3 transition-colors hover:bg-orange-50">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={`${item.name} — ${truck.name} menu item`}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-bold text-lg text-slate-800">${Number(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Menu coming soon — check back later!</p>
            )}
          </div>

          {/* Reviews — SSR crawlable content */}
          <div className="section-frame mb-6 p-6 shadow-none">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Reviews {ratingCount > 0 && <span className="text-lg font-normal text-slate-400">({ratingCount})</span>}
            </h2>
            {truckReviews.length > 0 ? (
              <div className="space-y-4">
                {truckReviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-orange-100 bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-sm text-orange-700 font-semibold">
                          {review.userName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-slate-700">{review.userName || 'Customer'}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span key={idx} className={idx < review.rating ? 'text-yellow-500' : 'text-slate-300'}>★</span>
                        ))}
                      </div>
                    </div>
                    {review.text && <p className="text-slate-600 text-sm">{review.text}</p>}
                    {review.ownerReply && (
                      <div className="mt-3 ml-4 pl-3 border-l-2 border-orange-300">
                        <p className="text-sm text-slate-500">
                          <span className="text-orange-600 font-medium">Owner reply:</span> {review.ownerReply}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No reviews yet — be the first to visit!</p>
            )}
          </div>

          {/* Features */}
          {truck.features && truck.features.length > 0 && (
            <div className="section-frame mb-6 p-6 shadow-none">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Features</h2>
              <div className="flex flex-wrap gap-2">
                {truck.features.map((feature) => (
                  <span key={feature} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Breadcrumbs — internal linking for SEO */}
          <nav className="text-sm text-slate-400 mt-8 text-center">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/food-trucks" className="hover:text-orange-600">Food Trucks</Link>
            <span className="mx-2">›</span>
            <span className="text-slate-600">{truck.name}</span>
          </nav>
        </div>
        </div>
      </div>
    </>
  );
}
