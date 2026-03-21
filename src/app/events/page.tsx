import { db } from '@/lib/db';
import { festivalEvents, festivalSightings, trucks } from '@/lib/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { IconMapPin, IconTruck, IconArrowRight, IconSparkles } from '@/components/ui/branded-icons';

export const metadata: Metadata = {
  title: 'Food Truck Events & Festivals — Adelaide & South Australia',
  description: 'Find the best food truck events and festivals in Adelaide and South Australia. See which food trucks attend Gluttony, Adelaide Fringe, Fork on the Road, Food Truck Carnivale, and more.',
  alternates: { canonical: 'https://foodtrucknext2me.com/events' },
  openGraph: {
    title: 'Food Truck Events & Festivals — Adelaide & SA',
    description: 'Discover Adelaide\'s biggest food truck events. Browse festivals, see which trucks attend, and plan your next street food adventure.',
    url: 'https://foodtrucknext2me.com/events',
  },
};

async function getEvents() {
  return db
    .select({
      id: festivalEvents.id,
      name: festivalEvents.name,
      slug: festivalEvents.slug,
      location: festivalEvents.location,
      description: festivalEvents.description,
      isRecurring: festivalEvents.isRecurring,
      truckCount: sql<number>`(SELECT COUNT(DISTINCT ${festivalSightings.truckId}) FROM ${festivalSightings} WHERE ${festivalSightings.eventId} = ${festivalEvents.id})`.as('truck_count'),
    })
    .from(festivalEvents)
    .orderBy(desc(sql`truck_count`));
}

// Map event names to emojis for visual flair
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

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="ambient-shell min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="surface-panel mb-8 p-6 sm:p-8">
          <div className="eyebrow-chip">
            <IconSparkles className="h-4 w-4 text-orange-500" />
            Adelaide & South Australia
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold text-slate-950 sm:text-5xl">
            Food Truck Events & Festivals
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Adelaide hosts some of Australia&apos;s best food truck events year-round. Discover which trucks attend each festival and plan your next street food adventure.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-slate-700">
            <IconTruck className="h-4 w-4 text-orange-500" />
            {events.length} events tracked
          </div>
        </section>

        {/* Events Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`}>
              <div className="group h-full cursor-pointer overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">
                {/* Header */}
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-100">
                  <span className="text-6xl">{EVENT_EMOJIS[event.name] || '🎉'}</span>
                  {event.isRecurring && (
                    <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm backdrop-blur-sm">
                      Annual
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="font-display text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {event.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <IconMapPin className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  {event.description && (
                    <p className="mt-3 text-sm text-slate-500 leading-snug line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                      <IconTruck className="h-4 w-4" />
                      {event.truckCount} truck{Number(event.truckCount) !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-orange-600 group-hover:text-orange-500">
                      View trucks
                      <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Breadcrumbs */}
        <nav className="text-sm text-slate-400 mt-10 text-center">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-600">Events & Festivals</span>
        </nav>
      </div>
    </div>
  );
}
