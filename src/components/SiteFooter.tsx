
import Link from 'next/link';
import { Utensils, ChefHat, User, MapPin, HelpCircle, ShieldCheck, FileText, Star, CreditCard, Newspaper, Info } from 'lucide-react';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background/95 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-1 text-center md:text-left mb-6 md:mb-0">
              <Link href="/" className="inline-flex items-center text-xl font-bold text-primary mb-2">
                <Utensils className="h-7 w-7 mr-2" />
                Truck Tracker
              </Link>
              <p className="text-sm text-muted-foreground">
                Your guide to the best food on wheels.
              </p>
            </div>

            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">For Customers</h6>
              <ul className="space-y-2">
                <li><Link href="/map" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><MapPin className="w-4 h-4 mr-1.5 inline-block"/>Find Trucks</span></Link></li>
                <li><Link href="/signup" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><User className="w-4 h-4 mr-1.5 inline-block"/>Customer Signup</span></Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><User className="w-4 h-4 mr-1.5 inline-block"/>Login</span></Link></li>
                <li><Link href="/featured" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><Star className="w-4 h-4 mr-1.5 inline-block"/>Featured Trucks</span></Link></li>
              </ul>
            </div>

            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">For Owners</h6>
              <ul className="space-y-2">
                <li><Link href="/owner/portal" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><ChefHat className="w-4 h-4 mr-1.5 inline-block"/>Owner Portal</span></Link></li>
                <li><Link href="/owner/signup" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><ChefHat className="w-4 h-4 mr-1.5 inline-block"/>Register Truck</span></Link></li>
                <li><Link href="/owner/billing" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><CreditCard className="w-4 h-4 mr-1.5 inline-block"/>Pricing</span></Link></li>
              </ul>
            </div>


            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">Resources</h6>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><HelpCircle className="w-4 h-4 mr-1.5 inline-block"/>Help & FAQ</span></Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><Newspaper className="w-4 h-4 mr-1.5 inline-block"/>Blog (Soon)</span></Link></li>
                 <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><Info className="w-4 h-4 mr-1.5 inline-block"/>About Us (Soon)</span></Link></li>
              </ul>
            </div>

            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">Legal</h6>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><FileText className="w-4 h-4 mr-1.5 inline-block"/>Terms of Service</span></Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><span><ShieldCheck className="w-4 h-4 mr-1.5 inline-block"/>Privacy Policy</span></Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t py-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} Truck Tracker. All rights reserved. Operated by Firebase Studio.
          </p>
        </div>
      </div>
    </footer>
  );
}
