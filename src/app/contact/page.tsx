import type { Metadata } from 'next';
import Link from 'next/link';
import {
  IconArrowRight,
  IconHelpCircle,
  IconMail,
  IconMapPin,
  IconSparkles,
  IconTruck,
} from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

const SUPPORT_EMAIL = 'info@foodtrucknext2me.com';

export const metadata: Metadata = {
  title: 'Contact Food Truck Next 2 Me — Adelaide Support & Enquiries',
  description:
    'Contact Food Truck Next 2 Me for platform support, owner listing questions, and Adelaide food truck event enquiries.',
  alternates: { canonical: 'https://foodtrucknext2me.com/contact' },
  openGraph: {
    title: 'Contact Food Truck Next 2 Me',
    description:
      'Reach Food Truck Next 2 Me for support, owner listing help, and Adelaide food truck platform questions.',
    url: 'https://foodtrucknext2me.com/contact',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Food Truck Next 2 Me',
    description:
      'Support and contact information for the Adelaide food truck discovery platform.',
  },
};

const CONTACT_REASONS = [
  {
    icon: IconTruck,
    title: 'Owner listing help',
    description: 'Questions about getting your truck visible, improving your profile, or understanding the owner flow.',
  },
  {
    icon: IconMapPin,
    title: 'Platform questions',
    description: 'Support requests about discovery, Adelaide coverage, or how to use the site more effectively.',
  },
  {
    icon: IconHelpCircle,
    title: 'General support',
    description: 'If you are unsure where your question fits, send it through and it can be routed from there.',
  },
];

export default function ContactPage() {
  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
                '@context': 'https://schema.org',
                '@type': 'ContactPage',
                name: 'Contact Food Truck Next 2 Me',
                url: 'https://foodtrucknext2me.com/contact',
                description:
                  'Contact page for the Adelaide and South Australia food truck discovery and event booking platform.',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Food Truck Next 2 Me',
                url: 'https://foodtrucknext2me.com',
                email: SUPPORT_EMAIL,
                contactPoint: [
                  {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: SUPPORT_EMAIL,
                    availableLanguage: ['en-AU', 'en'],
                    areaServed: 'AU',
                  },
                ],
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
                    name: 'Contact',
                    item: 'https://foodtrucknext2me.com/contact',
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
            <span className="font-medium text-slate-800">Contact</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Support and platform contact
              </div>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Get in touch about the Adelaide food truck platform.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Whether you need owner listing help, platform support, or general guidance about Food Truck Next 2 Me,
                this is the cleanest place to start.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  <IconMail className="h-4 w-4" />
                  {SUPPORT_EMAIL}
                </a>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Open Help & FAQ
                </Link>
              </div>
            </div>

            <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-glow">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Best for</p>
              <h2 className="mt-3 font-display text-3xl font-bold">Support, owner questions, and platform trust.</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                This page helps users and search engines understand that the platform is real, contactable, and locally focused.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Coverage</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">Adelaide + SA</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Support email</p>
                  <p className="mt-2 text-sm font-semibold text-white">{SUPPORT_EMAIL}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {CONTACT_REASONS.map((reason) => (
            <div key={reason.title} className="rounded-[28px] border border-orange-100 bg-white/95 p-6 shadow-sm">
              <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600">
                <reason.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-950">{reason.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{reason.description}</p>
            </div>
          ))}
        </section>

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Prefer a self-serve path?</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Most people can move faster through the right page.</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                If you are trying to discover a truck, hire a truck, or list your own truck, these pages will usually get you to the right place faster than a general support email.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Browse the Map
              </Link>
              <Link
                href="/owner/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
              >
                List Your Truck
              </Link>
            </div>
          </div>
        </section>

        <section className="surface-panel mt-8 p-8 sm:p-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/help"
              className="group rounded-[24px] border border-orange-100 bg-orange-50/70 p-5 transition-all hover:-translate-y-1 hover:border-orange-300"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">Help</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">Read the FAQ</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Common platform questions and support topics in one place.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                Open Help
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            <Link
              href="/hire-food-truck"
              className="group rounded-[24px] border border-orange-100 bg-white p-5 transition-all hover:-translate-y-1 hover:border-orange-300"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">Events</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">Start an enquiry</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use the dedicated hire flow if you are planning an event.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                Hire a Truck
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
            <Link
              href="/about"
              className="group rounded-[24px] border border-orange-100 bg-white p-5 transition-all hover:-translate-y-1 hover:border-orange-300"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700/75">About</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">Learn about the platform</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">See what Food Truck Next 2 Me is and why it is built for Adelaide.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                Read More
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
