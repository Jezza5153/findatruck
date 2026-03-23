import { db } from '@/lib/db';
import { festivalEvents, festivalSightings } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { IconMapPin, IconTruck, IconArrowRight, IconSparkles } from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Food Truck Events & Festivals — Adelaide & South Australia',
  description: 'Find the best food truck events and festivals in Adelaide and South Australia. See which food trucks attend Gluttony, Adelaide Fringe, Fork on the Road, Food Truck Carnivale, and more.',
  alternates: { canonical: 'https://foodtrucknext2me.com/events' },
  openGraph: {
    title: 'Food Truck Events & Festivals — Adelaide & SA',
    description: 'Discover Adelaide\'s biggest food truck events. Browse festivals, see which trucks attend, and plan your next street food adventure.',
    url: 'https://foodtrucknext2me.com/events',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Truck Events & Festivals — Adelaide & South Australia',
    description: 'Explore Adelaide food truck festivals, recurring events, and the trucks people keep discovering there.',
  },
};

const FAQ_ITEMS = [
  {
    question: 'What Adelaide food truck events can I browse here?',
    answer:
      'You can explore major Adelaide and South Australia food truck events, festivals, and recurring street food nights, then click through to see the trucks spotted at each one.',
  },
  {
    question: 'Should I use the events pages or the live map?',
    answer:
      'Use the events pages when you want festival-specific discovery and past truck appearances. Use the live map when you want to see what is serving right now.',
  },
  {
    question: 'Can I hire a food truck for my own Adelaide event?',
    answer:
      'Yes. If you are planning your own event, move from the events hub into the hire flow to start a free enquiry for weddings, corporate catering, markets, and private celebrations.',
  },
];

const QUICK_LINKS = [
  { href: '/map', label: 'Open live map' },
  { href: '/hire-food-truck/events', label: 'Hire for an event' },
  { href: '/food-trucks', label: 'Browse all trucks' },
  { href: '/featured', label: 'Featured trucks' },
];

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
  const recurringCount = events.filter((event) => event.isRecurring).length;
  const locationCount = new Set(events.map((event) => event.location).filter(Boolean)).size;

  return (
    <div className="ambient-shell min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: 'Food Truck Events and Festivals in Adelaide and South Australia',
                url: 'https://foodtrucknext2me.com/events',
                description: 'Browse Adelaide food truck festivals, recurring events, and the trucks that have appeared there.',
                mainEntity: {
                  '@type': 'ItemList',
                  numberOfItems: events.length,
                  itemListElement: events.map((event, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: event.name,
                    url: `https://foodtrucknext2me.com/events/${event.slug}`,
                  })),
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: FAQ_ITEMS.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                  },
                })),
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
                    name: 'Events & Festivals',
                    item: 'https://foodtrucknext2me.com/events',
                  },
                ],
              },
            ]),
          }}
        />

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
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Recurring events</p>
              <p className="mt-3 font-display text-3xl font-bold text-slate-950">{recurringCount}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Annual and repeat Adelaide event pages that can keep compounding search value.</p>
            </div>
            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Tracked locations</p>
              <p className="mt-3 font-display text-3xl font-bold text-slate-950">{locationCount}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Festival and event locations already connected to Adelaide food truck discovery.</p>
            </div>
            <div className="rounded-[24px] border border-orange-100 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best use</p>
              <p className="mt-3 font-display text-3xl font-bold text-slate-950">Event intent</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">A strong search path for people looking for food trucks around Adelaide festivals and public events.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
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

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Adelaide event discovery</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">This is one of the strongest local search angles on the site.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Adelaide food truck searches are not only about “near me” moments. They also happen around big event names,
                festival precincts, and recurring public gatherings. These pages give the site a clearer way to match that intent
                and connect people from event curiosity into truck profiles, the <Link href="/map" className="font-semibold text-orange-700 hover:text-orange-500">live map</Link>, and the <Link href="/hire-food-truck/events" className="font-semibold text-orange-700 hover:text-orange-500">event hire flow</Link>.
              </p>
            </div>
            <div className="rounded-[28px] border border-orange-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Popular next steps</p>
              <div className="mt-4 space-y-3">
                <Link href="/map" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-100">
                  See what is open now on the map
                  <IconArrowRight className="h-4 w-4 text-orange-600" />
                </Link>
                <Link href="/hire-food-truck/events" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                  Plan your own Adelaide event
                  <IconArrowRight className="h-4 w-4 text-orange-600" />
                </Link>
                <Link href="/food-trucks" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                  Browse location and cuisine pages
                  <IconArrowRight className="h-4 w-4 text-orange-600" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer font-display text-xl font-bold text-slate-900">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </section>

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
