import Link from 'next/link';
import { Utensils } from 'lucide-react'; // For brand icon

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Footer branding */}
            <div className="md:col-span-12 lg:col-span-3 text-center md:text-left">
              <Link href="/" className="inline-flex items-center text-lg font-semibold">
                <Utensils className="h-7 w-7 mr-2 text-primary" />
                Truck Tracker
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover your next favorite meal on wheels.
              </p>
            </div>

            {/* Footer links: Quick Links */}
            <div className="md:col-span-4 lg:col-span-2">
              <h6 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Quick Links</h6>
              <ul className="space-y-2">
                <li><Link href="/map" className="text-sm text-muted-foreground hover:text-primary transition-colors">Find Trucks</Link></li>
                <li><Link href="/featured" className="text-sm text-muted-foreground hover:text-primary transition-colors">Featured Trucks</Link></li>
                <li><Link href="/customer/signup" className="text-sm text-muted-foreground hover:text-primary transition-colors">Customer Signup</Link></li>
                <li><Link href="/owner/portal" className="text-sm text-muted-foreground hover:text-primary transition-colors">Owner Portal</Link></li>
              </ul>
            </div>

            {/* Footer links: Resources */}
            <div className="md:col-span-4 lg:col-span-2">
              <h6 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Resources</h6>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help & FAQ</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                 {/* Placeholder for future blog/news */}
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog (Coming Soon)</Link></li>
              </ul>
            </div>

            {/* Footer links: Legal */}
            <div className="md:col-span-4 lg:col-span-2">
              <h6 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Legal</h6>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                 {/* Placeholder for cookie policy */}
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            {/* Placeholder for social links or newsletter if desired in future */}
             <div className="md:col-span-12 lg:col-span-3 text-center md:text-right">
                <h6 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Connect With Us</h6>
                <p className="text-xs text-muted-foreground">
                    Social media links coming soon!
                </p>
             </div>

          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t py-4">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} Truck Tracker. All rights reserved. Built with Next.js & Firebase.
          </p>
        </div>
      </div>
    </footer>
  );
}
