import { db } from '@/lib/db';
import { festivalEvents, festivalSightings, trucks } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { IconMapPin, IconTruck, IconArrowRight, IconStar, IconSparkles } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getEvent(slug: string) {
  const [event] = await db
    .select()
    .from(festivalEvents)
    .where(eq(festivalEvents.slug, slug))
    .limit(1);
  return event || null;
}

async function getEventTrucks(eventId: string) {
  const sightings = await db
    .select({
      truckId: festivalSightings.truckId,
      year: festivalSightings.year,
      truckName: trucks.name,
      truckCuisine: trucks.cuisine,
      truckDescription: trucks.description,
      truckImageUrl: trucks.imageUrl,
      truckRating: trucks.rating,
      truckIsOpen: trucks.isOpen,
      truckAddress: trucks.address,
      truckInstagram: trucks.instagramHandle,
      truckWebsite: trucks.websiteUrl,
      truckTags: trucks.tags,
    })
    .from(festivalSightings)
    .innerJoin(trucks, eq(festivalSightings.truckId, trucks.id))
    .where(eq(festivalSightings.eventId, eventId))
    .orderBy(trucks.name);

  // Deduplicate trucks (might appear in multiple years)
  const seen = new Set<string>();
  return sightings.filter(s => {
    if (seen.has(s.truckId)) return false;
    seen.add(s.truckId);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event Not Found' };

  const title = `Food Trucks at ${event.name} — Adelaide`;
  const description = event.description
    ? `${event.description} — See which food trucks attend ${event.name} on Food Truck Next 2 Me.`
    : `Discover the food trucks at ${event.name} in Adelaide, South Australia. Browse trucks, menus, and more.`;

  return {
    title,
    description,
    alternates: { canonical: `https://foodtrucknext2me.com/events/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://foodtrucknext2me.com/events/${slug}`,
    },
  };
}

// Map event names to emojis
const EVENT_EMOJIS: Record<string, string> = {
  'Gluttony': '🍔',
  'Adelaide Fringe': '🎭',
  'Food Truck Carnivale': '🎪',
  'Fork on the Road': '🍴',
  'Lucky Dumpling Market': '🥟',
  'Tasting Australia': '🇦🇺',
  'Garden of Unearthly Delights': '🌿',
  'Asia Oasis Street Food Festival': '🌏',
  'Royal Adelaide Show': '🎡',
  'Harvest Rock': '🎸',
  'Halal Food Festival': '🌙',
  'A Taste of the Hills': '🍷',
};

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return notFound();

  const eventTrucks = await getEventTrucks(event.id);
  const emoji = EVENT_EMOJIS[event.name] || '🎉';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.name,
            location: {
              '@type': 'Place',
              name: event.location,
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Adelaide',
                addressRegion: 'SA',
                addressCountry: 'AU',
              },
            },
            description: event.description || undefined,
            url: `https://foodtrucknext2me.com/events/${slug}`,
          }),
        }}
      />

      <div className="ambient-shell min-h-screen pb-24">
        <div className="container mx-auto max-w-5xl px-4 py-8">
          {/* Hero */}
          <section className="surface-panel mb-8 overflow-hidden">
            <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100 sm:h-56">
              <span className="text-8xl">{emoji}</span>
              {event.isRecurring && (
                <span className="absolute top-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-orange-700 shadow-sm backdrop-blur-sm">
                  Annual Event
                </span>
              )}
            </div>
            <div className="p-6 sm:p-8">
              <h1 className="font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                {event.name}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-lg text-slate-500">
                <IconMapPin className="h-5 w-5 text-orange-400" />
                {event.location}
              </div>
              {event.description && (
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                  {event.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
                  <IconTruck className="h-4 w-4" />
                  {eventTrucks.length} food truck{eventTrucks.length !== 1 ? 's' : ''} spotted
                </span>
              </div>
            </div>
          </section>

          {/* Trucks at this event */}
          <section>
            <div className="mb-5">
              <h2 className="font-display text-2xl font-bold text-slate-950">
                Food Trucks at {event.name}
              </h2>
              <p className="mt-1 text-slate-500">
                These trucks have been spotted at {event.name}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {eventTrucks.map((truck) => (
                <Link key={truck.truckId} href={`/trucks/${truck.truckId}`}>
                  <div className="group h-full cursor-pointer overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
                    {/* Image */}
                    <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                      {truck.truckImageUrl ? (
                        <img
                          src={truck.truckImageUrl}
                          alt={truck.truckName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-1">
                            {truck.truckName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-orange-500 font-semibold text-sm">{truck.truckCuisine}</span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">
                        {truck.truckCuisine}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                        {truck.truckName}
                      </h3>
                      {truck.truckDescription && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2 leading-snug">
                          {truck.truckDescription}
                        </p>
                      )}

                      {truck.truckTags && truck.truckTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {truck.truckTags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 border-t border-orange-100 pt-3">
                        <span className="flex items-center justify-center gap-2 text-sm font-bold text-orange-600 group-hover:text-orange-500">
                          View Profile
                          <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Breadcrumbs */}
          <nav className="text-sm text-slate-400 mt-10 text-center">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/events" className="hover:text-orange-600">Events</Link>
            <span className="mx-2">›</span>
            <span className="text-slate-600">{event.name}</span>
          </nav>
        </div>
      </div>
    </>
  );
}
