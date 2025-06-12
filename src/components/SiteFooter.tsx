import Link from 'next/link';
import {
  Utensils,
  ChefHat,
  User,
  MapPin,
  HelpCircle,
  ShieldCheck,
  FileText,
  Star,
  CreditCard,
  Newspaper,
  Info,
} from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background/95 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Logo and description */}
            <div className="col-span-2 lg:col-span-1 text-center md:text-left mb-6 md:mb-0">
              <Link
                href="/"
                className="inline-flex items-center text-xl font-bold text-primary mb-2"
                aria-label="Home - FindATruck"
              >
                <span className="inline-flex items-center">
                  <Utensils className="h-7 w-7 mr-2 transition-transform hover:-rotate-6" />
                  FindATruck
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Your local food trucks, mapped live.
              </p>
            </div>

            {/* For Customers */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">
                For Customers
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/map"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <MapPin className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Find Trucks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <User className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Customer Signup
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <User className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/featured"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <Star className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Featured Trucks
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Owners */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">
                For Owners
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/owner/portal"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <ChefHat className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Owner Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/owner/signup"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <ChefHat className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Register Truck
                  </Link>
                </li>
                <li>
                  <Link
                    href="/owner/billing"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <CreditCard className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">
                Resources
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <HelpCircle className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <span
                    className="text-muted-foreground/70 cursor-not-allowed flex items-center"
                    aria-disabled="true"
                    tabIndex={-1}
                    title="Coming soon"
                  >
                    <Newspaper className="w-4 h-4 mr-1.5 inline-block" />
                    Blog (Soon)
                  </span>
                </li>
                <li>
                  <span
                    className="text-muted-foreground/70 cursor-not-allowed flex items-center"
                    aria-disabled="true"
                    tabIndex={-1}
                    title="Coming soon"
                  >
                    <Info className="w-4 h-4 mr-1.5 inline-block" />
                    About Us (Soon)
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">
                Legal
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <ShieldCheck className="w-4 h-4 mr-1.5 inline-block transition-transform hover:scale-110" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t py-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} FindATruck. All rights reserved. Operated by Firebase Studio.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
