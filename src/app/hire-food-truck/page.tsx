import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import {
  IconArrowRight,
  IconCalendarDays,
  IconChefHat,
  IconSparkles,
  IconUsers,
} from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Hire a Food Truck in Adelaide — Catering for Events, Weddings & Corporate',
  description: 'Hire the best food trucks in Adelaide and South Australia for your event, wedding, or corporate function. Browse food truck caterers, get quotes, and book the perfect mobile kitchen.',
  alternates: { canonical: 'https://foodtrucknext2me.com/hire-food-truck' },
  openGraph: {
    title: 'Hire a Food Truck in Adelaide',
    description: 'Find and book food truck catering for your next event in Adelaide and South Australia.',
    url: 'https://foodtrucknext2me.com/hire-food-truck',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hire a Food Truck in Adelaide',
    description: 'Find and book food truck catering for your next event in Adelaide and South Australia.',
  },
};

const CATEGORIES = [
  {
    slug: 'weddings',
    name: 'Wedding Food Trucks',
    accent: 'Elegant, social, memorable',
    description: 'Bring warmth, movement, and genuine atmosphere to weddings with gourmet food truck catering that feels more alive than a standard function menu.',
  },
  {
    slug: 'corporate',
    name: 'Corporate Catering',
    accent: 'Smooth, efficient, polished',
    description: 'Ideal for team lunches, launches, activations, and office events where you want something memorable without introducing chaos.',
  },
  {
    slug: 'events',
    name: 'Events & Festivals',
    accent: 'High-volume, high-energy service',
    description: 'Perfect for markets, school fetes, councils, community events, and festivals that need crowd-friendly catering options.',
  },
];

const PROCESS_STEPS = [
  {
    icon: IconChefHat,
    title: 'Tell us the event style',
    description: 'Share the guest count, vibe, venue, and timing so the shortlist starts from your actual needs.',
  },
  {
    icon: IconUsers,
    title: 'We narrow the fit',
    description: 'Match with trucks that align with service style, cuisine, and event type instead of sending generic options.',
  },
  {
    icon: IconCalendarDays,
    title: 'Lock in the best option',
    description: 'Move forward with the truck that fits your event best and continue details directly from a stronger starting point.',
  },
];

export default function HireFoodTruckPage() {
  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd({
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: 'Food Truck Hire in Adelaide',
              serviceType: 'Food truck catering and event booking',
              provider: {
                '@type': 'Organization',
                name: 'Food Truck Next 2 Me',
                url: 'https://foodtrucknext2me.com',
              },
              areaServed: {
                '@type': 'State',
                name: 'South Australia',
              },
              url: 'https://foodtrucknext2me.com/hire-food-truck',
            }),
          }}
        />

        <section className="surface-panel p-8 sm:p-10">
          <nav className="mb-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="font-medium text-slate-800">Hire a Food Truck</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Event-ready food truck catering
              </div>
              <h1 className="mt-5 text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Hire a food truck that people remember after the event ends.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Whether it&apos;s a wedding, corporate gathering, market night, school fete, or private celebration, we help connect your event with trucks that fit the crowd, service style, and atmosphere you want.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#enquiry" className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500">
                  Start a Free Enquiry
                  <IconArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Explore Live Trucks
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Weddings</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Unique catering with atmosphere built in.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Corporate</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Sharper than standard office catering.</p>
              </div>
              <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                <p className="mt-3 font-display text-3xl font-bold text-slate-950">Festivals</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Crowd-friendly service for bigger public events.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/hire-food-truck/${cat.slug}`}
              className="group rounded-[28px] border border-orange-100 bg-white/92 p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft"
            >
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                {cat.accent}
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                {cat.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {cat.description}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                Explore this event type
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </section>

        <section className="surface-panel mt-8 p-8 sm:p-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">How it works</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Simple enough for fast decisions. Thoughtful enough for real events.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PROCESS_STEPS.map((step, index) => (
              <div key={step.title} className="rounded-[28px] border border-orange-100 bg-orange-50/60 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex rounded-2xl bg-white p-3 text-orange-600 shadow-sm">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-3xl font-bold text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div id="enquiry" className="mt-8">
          <EnquiryForm eventType="other" />
        </div>
      </div>
    </div>
  );
}
