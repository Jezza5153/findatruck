import type { Metadata } from 'next';
import Link from 'next/link';
import HomeContent from '@/components/HomeContent';
import { toJsonLd } from '@/lib/json-ld';

const FAQ_ITEMS = [
  { q: 'How do I find food trucks near me in Adelaide?', a: 'Open Food Truck Next 2 Me and allow location access. Our live map will show you all nearby food trucks in Adelaide and across South Australia, with real-time status updates so you know which ones are serving right now.' },
  { q: 'How do I list my food truck on Food Truck Next 2 Me?', a: 'Click "Register Your Truck" to create a free owner account. You can add your truck name, cuisine, photos, menu, and social media links. Once set up, you can go live and start attracting customers across Adelaide and South Australia.' },
  { q: 'Is Food Truck Next 2 Me free?', a: 'Yes! Basic listings are completely free for food truck owners. Customers can browse, search, and discover trucks at no cost. Premium plans are available for owners who want extra visibility and features.' },
  { q: 'What areas does Food Truck Next 2 Me cover?', a: 'We focus on Adelaide and the wider South Australia region, including the Adelaide Hills, Barossa Valley, Fleurieu Peninsula, McLaren Vale, and regional SA. Any food truck operating in South Australia can list with us.' },
  { q: 'Can I explore food truck events in Adelaide too?', a: 'Yes. Browse our Adelaide event and festival pages to see which trucks appear at major food events, then move into the live map or hire flow depending on what you need next.' },
];

export const metadata: Metadata = {
  title: 'Food Truck Next 2 Me — Find Food Trucks in Adelaide & South Australia',
  description: 'Find the best food trucks near you in Adelaide and South Australia. Live locations, menus, reviews, and real-time tracking. Your next favourite meal on wheels is just a tap away!',
  alternates: {
    canonical: 'https://foodtrucknext2me.com',
    languages: { 'en-AU': 'https://foodtrucknext2me.com' },
  },
};

export default function HomePage() {
  return (
    <>
      <HomeContent />

      {/* FAQ structured data for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLd({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_ITEMS.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />

      {/* Server-rendered SEO content — indexable by Google */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="section-frame p-8 sm:p-10">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">
                Adelaide&apos;s Food Truck Finder
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-slate-950">
                Built to turn cravings, event plans, and truck growth into action
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-7 text-slate-600 sm:text-lg">
                Food Truck Next 2 Me helps hungry customers discover what is open now, event planners hire with less friction, and truck owners get found when people are deciding.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Link href="/map" className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5 transition-transform hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">Live Map</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">See what&apos;s open now</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Open the real-time map and spot nearby trucks before the queue builds.</p>
              </Link>
              <Link href="/food-trucks" className="rounded-[24px] border border-orange-100 bg-white p-5 transition-transform hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">Local SEO Pages</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">Browse by suburb or cuisine</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Jump into Adelaide CBD, Glenelg, pizza, coffee, vegan and more discovery pages.</p>
              </Link>
              <Link href="/hire-food-truck" className="rounded-[24px] border border-orange-100 bg-white p-5 transition-transform hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">Event Bookings</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">Hire a truck for your next event</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">From weddings to corporate catering, connect with trucks built for high-intent enquiries.</p>
              </Link>
              <Link href="/owner/signup" className="rounded-[24px] border border-orange-100 bg-white p-5 transition-transform hover:-translate-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">Owner Growth</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">List your truck and get discovered</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Create your owner account, build your profile, and show up when local customers are searching.</p>
              </Link>
            </div>

            <div className="prose prose-slate mt-10 max-w-none text-slate-600">
            <p>
              <strong>Food Truck Next 2 Me</strong> is Adelaide and South Australia&apos;s go-to platform
              for discovering food trucks near you. Whether you&apos;re craving tacos in the CBD, gelato in
              Glenelg, or wood-fired pizza in the Adelaide Hills, our <Link href="/map">real-time food truck map</Link> shows you
              exactly where your next meal on wheels is.
            </p>
            <p>
              We help food truck lovers across South Australia find open trucks, browse full menus,
              read reviews, and check in to earn loyalty rewards. From <Link href="/food-trucks/port-adelaide">Port Adelaide</Link> to <Link href="/food-trucks/mclaren-vale">McLaren Vale</Link>,
              Norwood to Henley Beach — if there&apos;s a food truck rolling, we&apos;ll help you find it.
            </p>

            <h3 className="text-xl font-bold text-slate-700 mt-8">
              For Adelaide Events and Festivals
            </h3>
            <p>
              Adelaide food truck discovery does not only happen on ordinary lunch runs. It also happens around festivals,
              markets, and big public nights. Explore our <Link href="/events">food truck events and festival pages</Link> to see how trucks show up around
              Adelaide Fringe, Fork on the Road, and other local favourites, or move straight into the <Link href="/hire-food-truck">hire a truck flow</Link> if you
              are planning your own event.
            </p>

            <h3 className="text-xl font-bold text-slate-700 mt-8">
              For Food Truck Owners in South Australia
            </h3>
            <p>
              Own a food truck in Adelaide? <Link href="/owner/signup">List your truck on Food Truck Next 2 Me for free</Link> and reach
              thousands of hungry customers. Our owner dashboard lets you update your location in real-time,
              manage your menu, track reviews, and grow your following. Whether you&apos;re at the Royal Adelaide
              Show, Fork on the Road, or serving lunch at a local winery — we put your truck on the map.
            </p>

            <h3 className="text-xl font-bold text-slate-700 mt-8">
              Frequently Asked Questions
            </h3>
            <details className="rounded-2xl border border-orange-200 bg-white p-4">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                How do I find food trucks near me in Adelaide?
              </summary>
              <p className="mt-2 text-sm">
                Open Food Truck Next 2 Me and allow location access. Our live map will show you all nearby
                food trucks in Adelaide and across South Australia, with real-time status updates so you
                know which ones are serving right now.
              </p>
            </details>
            <details className="rounded-2xl border border-orange-200 bg-white p-4">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                How do I list my food truck on Food Truck Next 2 Me?
              </summary>
              <p className="mt-2 text-sm">
                Click &quot;Register Your Truck&quot; to create a free owner account. You can add your truck name,
                cuisine, photos, menu, and social media links. Once set up, you can go live and start
                attracting customers across Adelaide and South Australia.
              </p>
            </details>
            <details className="rounded-2xl border border-orange-200 bg-white p-4">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                Is Food Truck Next 2 Me free?
              </summary>
              <p className="mt-2 text-sm">
                Yes! Basic listings are completely free for food truck owners. Customers can browse,
                search, and discover trucks at no cost. Premium plans are available for owners who want
                extra visibility and features.
              </p>
            </details>
            <details className="rounded-2xl border border-orange-200 bg-white p-4">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                What areas does Food Truck Next 2 Me cover?
              </summary>
              <p className="mt-2 text-sm">
                We focus on Adelaide and the wider South Australia region, including the Adelaide Hills,
                Barossa Valley, Fleurieu Peninsula, McLaren Vale, and regional SA. Any food truck
                operating in South Australia can list with us.
              </p>
            </details>
            <details className="rounded-2xl border border-orange-200 bg-white p-4">
              <summary className="font-semibold text-slate-700 cursor-pointer">
                Can I explore food truck events in Adelaide too?
              </summary>
              <p className="mt-2 text-sm">
                Yes. Browse our Adelaide event and festival pages to see which trucks appear at major food
                events, then move into the live map or hire flow depending on what you need next.
              </p>
            </details>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
