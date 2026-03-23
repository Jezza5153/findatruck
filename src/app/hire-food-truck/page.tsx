import type { Metadata } from 'next';
import Link from 'next/link';
import EnquiryForm from '@/components/EnquiryForm';
import {
  IconArrowRight,
  IconCalendarDays,
  IconCheckCircle,
  IconChefHat,
  IconMapPin,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
} from '@/components/ui/branded-icons';
import { toJsonLd } from '@/lib/json-ld';

export const metadata: Metadata = {
  title: 'Hire a Food Truck in Adelaide — Catering for Events, Weddings & Corporate',
  description:
    'Hire the best food trucks in Adelaide and South Australia for your event, wedding, or corporate function. Browse food truck caterers, get quotes, and book the perfect mobile kitchen.',
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
    description:
      'Bring movement, atmosphere, and genuinely memorable food to weddings with catering that feels warm and modern instead of overly formal.',
  },
  {
    slug: 'corporate',
    name: 'Corporate Catering',
    accent: 'Smooth, efficient, polished',
    description:
      'Ideal for team lunches, launches, staff events, and brand activations where the experience needs to feel organised and elevated.',
  },
  {
    slug: 'events',
    name: 'Events & Festivals',
    accent: 'High-volume, high-energy service',
    description:
      'A stronger route for markets, councils, school events, and festivals that need crowd-friendly vendors and a cleaner booking starting point.',
  },
];

const TRUST_PILLARS = [
  {
    icon: IconUsers,
    title: 'Matched to the event',
    description: 'Start from guest count, service style, and venue feel instead of sending a generic booking request.',
  },
  {
    icon: IconShieldCheck,
    title: 'Low-friction planning',
    description: 'Clearer structure upfront means less back-and-forth once you begin narrowing down the right truck.',
  },
  {
    icon: IconMapPin,
    title: 'Built for Adelaide & SA',
    description: 'The flow is designed for local events across Adelaide and South Australia, from inner-city launches to regional celebrations.',
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
    description: 'You start from trucks that suit the atmosphere and service pace you are trying to create.',
  },
  {
    icon: IconCalendarDays,
    title: 'Move forward with clarity',
    description: 'Lock in the best option from a cleaner starting point instead of trying to compare everything at once.',
  },
];

const PLANNING_NOTES = [
  'Event date, suburb, and venue style',
  'Estimated guest count and service window',
  'Cuisine preferences or dietary priorities',
  'Anything that affects setup, access, or service flow',
];

const FAQ_ITEMS = [
  {
    question: 'What types of events can I hire a food truck for?',
    answer:
      'The hire flow is designed for weddings, corporate functions, festivals, markets, school events, and private celebrations across Adelaide and South Australia.',
  },
  {
    question: 'Can I ask for a specific cuisine or food style?',
    answer:
      'Yes. You can mention cuisine preferences, dietary requirements, and the overall atmosphere you want in your enquiry so the shortlist starts in the right direction.',
  },
  {
    question: 'Do I have to pay to send an enquiry?',
    answer:
      'No. Sending an enquiry is free. The page is designed to help you start the conversation with better detail and less friction.',
  },
  {
    question: 'Should I use this page or browse the live map first?',
    answer:
      'Use this page if you are planning an event and want the booking path. Use the live map if you are trying to find trucks that are currently out serving customers.',
  },
];

const QUICK_LINKS = [
  { href: '#enquiry', label: 'Jump to enquiry' },
  { href: '/hire-food-truck/weddings', label: 'Wedding ideas' },
  { href: '/hire-food-truck/corporate', label: 'Corporate catering' },
  { href: '/hire-food-truck/events', label: 'Festivals & events' },
  { href: '/featured', label: 'Featured trucks' },
  { href: '/food-trucks', label: 'All locations & cuisines' },
];

export default function HireFoodTruckPage() {
  return (
    <div className="ambient-shell min-h-screen px-4 py-10">
      <div className="container mx-auto max-w-6xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd([
              {
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
                    name: 'Hire a Food Truck',
                    item: 'https://foodtrucknext2me.com/hire-food-truck',
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
            <span className="font-medium text-slate-800">Hire a Food Truck</span>
          </nav>

          <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <div>
              <div className="eyebrow-chip">
                <IconSparkles className="h-4 w-4 text-orange-500" />
                Event-ready food truck catering
              </div>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-4xl font-bold text-slate-950 sm:text-5xl">
                Hire a food truck with a booking flow that feels as polished as the event itself.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Weddings, corporate functions, markets, launch nights, school events, and private celebrations all need
                slightly different trucks. This page is built to make that first step feel clear, premium, and easy to act on.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#enquiry"
                  className="cta-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-3 font-semibold text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  Start a Free Enquiry
                  <IconArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/featured"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-orange-50"
                >
                  Explore Featured Trucks
                </Link>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Prefer a live discovery experience first?{' '}
                <Link href="/map" className="font-semibold text-orange-700 hover:text-orange-500">
                  Open the food truck map
                </Link>
                .
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-glow">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Booking funnel</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Designed to move planners from idea to shortlist faster.</h2>
                <p className="mt-3 text-sm leading-7 text-white/72">
                  Instead of dropping into a generic contact flow, event planners get a clearer route built around fit,
                  atmosphere, and confidence.
                </p>
                <div className="mt-6 grid gap-3">
                  {[
                    'Free enquiry with no payment required',
                    'Built for weddings, corporate, and public events',
                    'Better context before you start narrowing options',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4"
                    >
                      <IconCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-yellow" />
                      <p className="text-sm leading-6 text-white/78">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                  <p className="mt-3 font-display text-3xl font-bold text-slate-950">Weddings</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Social, memorable, and warmer than standard function catering.</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                  <p className="mt-3 font-display text-3xl font-bold text-slate-950">Corporate</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Cleaner for launches, team events, and branded experiences.</p>
                </div>
                <div className="rounded-[24px] border border-orange-100 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Best for</p>
                  <p className="mt-3 font-display text-3xl font-bold text-slate-950">Festivals</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Built for larger crowds, stronger pace, and public-event energy.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_LINKS.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex whitespace-nowrap rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex whitespace-nowrap rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-700"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {TRUST_PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-[28px] border border-orange-100 bg-white/92 p-6 shadow-sm">
              <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-orange-600 shadow-sm">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-950">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </section>

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Choose the right event path</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Different event types need different energy.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-right sm:text-base">
              These routes keep the experience feeling intentional for couples, coordinators, marketers, and event teams who
              are looking for something more specific than a general directory page.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {CATEGORIES.map((cat, index) => (
              <Link
                key={cat.slug}
                href={`/hire-food-truck/${cat.slug}`}
                className="group rounded-[30px] border border-orange-100 bg-white/95 p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-soft"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                    {cat.accent}
                  </span>
                  <span className="font-display text-3xl font-bold text-slate-200">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold text-slate-950 transition-colors group-hover:text-orange-600">
                  {cat.name}
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{cat.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700">
                  Explore this event type
                  <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="surface-panel mt-8 p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="rounded-[30px] bg-slate-950 p-6 text-white shadow-glow">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">What helps the match feel sharper</p>
              <h2 className="mt-3 font-display text-3xl font-bold">The better the brief, the better the starting shortlist.</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                You do not need every detail perfect. Just enough context to make the first recommendations feel useful instead of generic.
              </p>
              <div className="mt-6 space-y-3">
                {PLANNING_NOTES.map((note) => (
                  <div key={note} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                    <IconCheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-yellow" />
                    <p className="text-sm leading-6 text-white/78">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-6 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">How it works</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">
                  Structured enough for real events. Simple enough to move quickly.
                </h2>
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
            </div>
          </div>
        </section>

        <section id="enquiry" className="mt-8 grid gap-6 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <aside className="surface-panel-dark p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Before you send</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">Use this if you are booking for an event, not just browsing.</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              This route works best when you already know the date or event window and want a cleaner way to express the kind of truck experience you are after.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-sm font-semibold text-white">No-cost enquiry</p>
                <p className="mt-1 text-sm leading-6 text-white/68">You are only sharing event details so the first step feels more useful.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-sm font-semibold text-white">Stronger first conversation</p>
                <p className="mt-1 text-sm leading-6 text-white/68">Use the form to set cuisine, guest count, and event feel before you start comparing options.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4">
                <p className="text-sm font-semibold text-white">Need inspiration first?</p>
                <p className="mt-1 text-sm leading-6 text-white/68">
                  Start on the{' '}
                  <Link href="/featured" className="font-semibold text-brand-yellow hover:text-white">
                    featured page
                  </Link>{' '}
                  or browse the{' '}
                  <Link href="/map" className="font-semibold text-brand-yellow hover:text-white">
                    live map
                  </Link>
                  .
                </p>
              </div>
            </div>
          </aside>

          <EnquiryForm eventType="other" />
        </section>

        <section className="section-frame mt-8 p-8 sm:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/75">Planning questions</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-slate-950">Helpful answers before you enquire.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              These are the most common questions event planners ask when deciding whether to use the booking path or continue browsing the platform.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="rounded-[24px] border border-orange-100 bg-white/95 p-5">
                <summary className="cursor-pointer list-none font-semibold text-slate-900">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="surface-panel-dark mt-8 overflow-hidden p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Keep momentum high</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                The booking page works best when it feels connected to the rest of the product.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
                Some visitors want to enquire immediately. Others need a little more inspiration first. This page should support both without forcing them into a dead end.
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/featured"
                className="rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-5 text-white transition-colors hover:bg-white/[0.1]"
              >
                <p className="text-sm font-semibold text-brand-yellow">Need inspiration first?</p>
                <p className="mt-1 font-display text-2xl font-bold">Start with featured trucks</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Great for getting a stronger first sense of quality, style, and event fit.</p>
              </Link>
              <Link
                href="/food-trucks"
                className="rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-5 text-white transition-colors hover:bg-white/[0.1]"
              >
                <p className="text-sm font-semibold text-brand-yellow">Want broader discovery?</p>
                <p className="mt-1 font-display text-2xl font-bold">Browse all locations and cuisines</p>
                <p className="mt-2 text-sm leading-6 text-white/68">Use the wider discovery pages if you want to compare more trucks before sending your brief.</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
