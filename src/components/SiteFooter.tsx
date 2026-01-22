
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
} from '@/components/ui/branded-icons';


export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-orange-200 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Logo and description */}
            <div className="col-span-2 lg:col-span-1 text-center md:text-left mb-6 md:mb-0">
              <Link
                href="/"
                className="inline-flex items-center mb-3"
                aria-label="Home - FindATruck"
              >
                <Image
                  src="/logo.png"
                  alt="FindATruck"
                  width={120}
                  height={80}
                  className="h-16 w-auto"
                />
              </Link>
              <p className="text-sm text-slate-600">
                Your guide to the best food on wheels! 🚚🍕
              </p>
            </div>

            {/* For Customers */}
            <div className="text-sm">
              <h6 className="font-bold text-slate-800 uppercase tracking-wider mb-3">
                For Customers
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/map"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconMapPin className="w-4 h-4 mr-1.5 text-orange-500" />
                    Find Trucks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconUser className="w-4 h-4 mr-1.5 text-orange-500" />
                    Customer Signup
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconUser className="w-4 h-4 mr-1.5 text-orange-500" />
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/featured"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconStar className="w-4 h-4 mr-1.5 text-orange-500" />
                    Featured Trucks
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Owners */}
            <div className="text-sm">
              <h6 className="font-bold text-slate-800 uppercase tracking-wider mb-3">
                For Owners
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/owner/portal"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconChefHat className="w-4 h-4 mr-1.5 text-orange-500" />
                    Owner Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/owner/signup"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconChefHat className="w-4 h-4 mr-1.5 text-orange-500" />
                    Register Truck
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="text-sm">
              <h6 className="font-bold text-slate-800 uppercase tracking-wider mb-3">
                Resources
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconHelpCircle className="w-4 h-4 mr-1.5 text-orange-500" />
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconHelpCircle className="w-4 h-4 mr-1.5 text-orange-500" />
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-sm">
              <h6 className="font-bold text-slate-800 uppercase tracking-wider mb-3">
                Legal
              </h6>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconFileText className="w-4 h-4 mr-1.5 text-orange-500" />
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-slate-600 hover:text-orange-600 transition-colors flex items-center"
                  >
                    <IconShieldCheck className="w-4 h-4 mr-1.5 text-orange-500" />
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-200 py-6">
          <p className="text-center text-xs text-slate-500">
            © {currentYear} FindATruck. All rights reserved. Made with 🧡 for food truck lovers everywhere!
          </p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
