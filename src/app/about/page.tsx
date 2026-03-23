import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconArrowRight,
  IconChefHat,
  IconMapPin,
  IconSparkles,
  IconTruck,
  IconUsers,
} from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'About Food Truck Next 2 Me — Adelaide Food Truck Platform',
  description:
    'Learn what Food Truck Next 2 Me is, who it helps, and why it is built for Adelaide and South Australia food truck discovery, event bookings, and owner visibility.',
  alternates: { canonical: 'https://foodtrucknext2me.com/about' },
  openGraph: {
    title: 'About Food Truck Next 2 Me',
    description:
      'Adelaide and South Australia food truck discovery, event booking, and owner visibility platform.',
    url: 'https://foodtrucknext2me.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Food Truck Next 2 Me',
    description:
      'Why Food Truck Next 2 Me exists and how it helps Adelaide food truck discovery.',
  },
};

const FAQ_ITEMS = [
  {
    question: 'What is Food Truck Next 2 Me?',
    answer:
      'Food Truck Next 2 Me is a platform built to help people discover food trucks across Adelaide and South Australia, help event planners hire trucks with less friction, and help owners stay visible when customers are deciding.',
  },
  {
    question: 'Who is the platform for?',
    answer:
      'It is built for customers, event planners, and food truck owners. Customers use it to discover trucks, planners use it to start event enquiries, and owners use it to get found more easily.',
  },
  {
    question: 'Why is the site focused on Adelaide?',
    answer:
      'The platform is designed around Adelaide and South Australia because local food truck discovery depends heavily on place, timing, events, and neighbourhood context.',
  },
];

const PILLARS = [
  {
    icon: IconMapPin,
    title: 'Discovery first',
    description:
      'Help customers find food trucks faster through live discovery, local landing pages, and a cleaner path from search to action.',
  },
  {
    icon: IconChefHat,
    title: 'Events made easier',
    description:
      'Give planners a clearer route from idea to enquiry when they need food truck catering for weddings, corporate functions, and public events.',
  },
  {
    icon: IconTruck,
    title: 'Owner visibility',
    description:
      'Help truck owners show up where people are searching, stay visible across Adelaide, and turn attention into more enquiries.',
  },
];

export default function AboutPage() {
  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'AboutPage',
                name: 'About Food Truck Next 2 Me',
                url: 'https://foodtrucknext2me.com/about',
                description:
                  'About the Adelaide and South Australia food truck discovery, event booking, and owner visibility platform.',
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
                    name: 'About',
                    item: 'https://foodtrucknext2me.com/about',
                  },
                ],
              },
            ]),
          }}
        />

        <section className="surface-panel overflow-hidden p-8 sm:p-10">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-600">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span className="font-medium text-slate-800">About</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Adelaide food truck platform
              </div>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Built to make Adelaide food truck discovery feel easier, clearer, and more useful.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Food Truck Next 2 Me exists to connect hungry customers, event planners, and food truck owners through a
                platform that is designed around Adelaide and South Australia instead of generic marketplace noise.
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
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Focus</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Adelaide</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Built around local discovery, not generic national listings.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">For</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">3 sides</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Customers, planners, and owners all need clearer next steps.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Goal</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Visibility</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Help the best local trucks get found when people are ready to act.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-[28px] border border-orange-100 bg-white/95 p-6 shadow-sm">
              <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-950">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </section>

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Why this matters</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">The platform should feel like Adelaide&apos;s food truck home base.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                People do not just need another directory. They need a place that helps them find trucks quickly, understand
                where to start, and move from interest to action without friction. That is why the site combines a <Link href="/map" className="font-semibold text-orange-700 hover:text-orange-500">live map</Link>,
                event pages, truck profiles, and a dedicated <Link href="/hire-food-truck" className="font-semibold text-orange-700 hover:text-orange-500">hire flow</Link>.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-600">
                On the owner side, the goal is just as practical: help trucks show up when customers are searching, keep profiles
                current, and create more chances for repeat discovery across Adelaide and South Australia.
              </p>
            </div>
            <div className="rounded-[28px] border border-orange-100 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Good next steps</p>
              <div className="mt-4 space-y-3">
                <Link href="/food-trucks" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-100">
                  Browse Adelaide trucks
                  <IconArrowRight className="h-4 w-4 text-orange-600" />
                </Link>
                <Link href="/events" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                  Explore events and festivals
                  <IconArrowRight className="h-4 w-4 text-orange-600" />
                </Link>
                <Link href="/owner/signup" className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-orange-50">
                  List your truck
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

        <section className="surface-panel mt-8 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Need help?</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Questions about the platform, events, or owner listings?</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Move into the contact page for support and platform questions, or head to the help section for more answers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Contact Us
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
              >
                Help & FAQ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
