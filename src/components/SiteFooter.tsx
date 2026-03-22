
import Link from 'next/link';
import Image from 'next/image';
import {
  IconChefHat,
  IconUser,
  IconMapPin,
  IconHelpCircle,
  IconShieldCheck,
  IconFileText,
  IconStar,
  IconArrowRight,
  IconSparkles,
} from '@/components/ui/branded-icons';


export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="surface-panel-dark px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <IconSparkles className="h-4 w-4 text-brand-yellow" />
                Made for Adelaide food discovery
              </div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Looking for a food truck?
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:min-w-[250px]">
              <Link
                href="/food-trucks"
                className="cta-sheen inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-5 py-3 font-semibold text-slate-950 transition-transform hover:scale-[1.01]"
              >
                Browse All Trucks
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hire-food-truck"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10"
              >
                Hire for an Event
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <Link
                href="/"
                className="inline-flex items-center mb-4"
                aria-label="Home - Food Truck Next 2 Me"
              >
                <Image
                  src="/logo.png"
                  alt="Food Truck Next 2 Me — Adelaide Food Truck Finder"
                  width={120}
                  height={80}
                  className="h-16 w-auto rounded-2xl bg-white p-1"
                />
              </Link>
              <p className="max-w-md text-sm leading-6 text-white/72">
                Food Truck Next 2 Me helps customers discover live food trucks across Adelaide and South Australia, while helping owners stay visible and book more events.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/68">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">51 Trucks</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">12 Cuisines</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Free to Use</span>
              </div>
            </div>

            {/* For Customers */}
            <div className="text-sm">
              <h6 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                For Customers
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/food-trucks"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconMapPin className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Browse Trucks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hire-food-truck"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconChefHat className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Hire for an Event
                  </Link>
                </li>
                <li>
                  <Link
                    href="/featured"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconStar className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Featured Trucks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconStar className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Events & Festivals
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Owners */}
            <div className="text-sm">
              <h6 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                For Owners
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/owner/portal"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconChefHat className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Owner Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/owner/signup"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconChefHat className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Register Truck
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="text-sm">
              <h6 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                Resources
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconHelpCircle className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconHelpCircle className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconFileText className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/food-trucks"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconMapPin className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Browse by Location
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hire-food-truck"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconChefHat className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Hire a Food Truck
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-sm">
              <h6 className="mb-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                Legal
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconFileText className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="flex items-center text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    <IconShieldCheck className="mr-1.5 h-4 w-4 text-brand-yellow" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} Food Truck Next 2 Me. Serving Adelaide and South Australia.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/food-trucks" className="transition-colors hover:text-brand-yellow">Browse Trucks</Link>
              <Link href="/featured" className="transition-colors hover:text-brand-yellow">Featured</Link>
              <Link href="/hire-food-truck" className="transition-colors hover:text-brand-yellow">Hire a Truck</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
