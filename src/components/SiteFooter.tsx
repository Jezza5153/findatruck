
import Link from 'next/link';
import { Utensils, ChefHat, User, MapPin, HelpCircle, ShieldCheck, FileText } from 'lucide-react'; // Added more icons

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background/95 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Footer branding */}
            <div className="col-span-2 lg:col-span-1 text-center md:text-left mb-6 md:mb-0">
              <Link href="/" className="inline-flex items-center text-xl font-bold text-primary mb-2">
                <Utensils className="h-7 w-7 mr-2" />
                FindATruck
              </Link>
              <p className="text-sm text-muted-foreground">
                Your guide to the best food on wheels.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">For Customers</h6>
              <ul className="space-y-2">
                <li><Link href="/map" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><MapPin className="w-4 h-4 mr-1.5"/>Find Trucks</Link></li>
                <li><Link href="/customer/signup" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><User className="w-4 h-4 mr-1.5"/>Customer Signup</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><User className="w-4 h-4 mr-1.5"/>Login</Link></li>
                <li><Link href="/featured" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><Star className="w-4 h-4 mr-1.5"/>Featured Trucks</Link></li>
              </ul>
            </div>

            {/* For Owners */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">For Owners</h6>
              <ul className="space-y-2">
                <li><Link href="/owner/portal" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><ChefHat className="w-4 h-4 mr-1.5"/>Owner Portal</Link></li>
                <li><Link href="/owner/signup" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><ChefHat className="w-4 h-4 mr-1.5"/>Register Truck</Link></li>
                <li><Link href="/owner/billing" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><CreditCard className="w-4 h-4 mr-1.5"/>Pricing</Link></li>
              </ul>
            </div>


            {/* Resources */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">Resources</h6>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><HelpCircle className="w-4 h-4 mr-1.5"/>Help & FAQ</Link></li>
                {/* Placeholder for future blog/news */}
                <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><Newspaper className="w-4 h-4 mr-1.5"/>Blog (Soon)</Link></li>
                 <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><Info className="w-4 h-4 mr-1.5"/>About Us (Soon)</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="text-sm">
              <h6 className="font-semibold text-foreground uppercase tracking-wider mb-3">Legal</h6>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><FileText className="w-4 h-4 mr-1.5"/>Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center"><ShieldCheck className="w-4 h-4 mr-1.5"/>Privacy Policy</Link></li>
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

// Dummy icons for placeholders if not imported from lucide, ensure these are actually imported
const Star = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 7.09l6.572-.955L10 0l2.939 6.135 6.572.955-4.756 4.455 1.123 6.545z"/></svg>;
const CreditCard = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v2H4V6zm0 4h12v2H4v-2z"/></svg>;
const Newspaper = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm2-1v10h12V4H4zm2 2h8v1H6V6zm0 2h8v1H6V8zm0 2h5v1H6v-1z"/></svg>;
const Info = ({ className }: { className?: string }) => <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.707-3.293a1 1 0 001.414-1.414L10 12.586l.293-.293a1 1 0 00-1.414-1.414L10 11.414l-.293-.293a1 1 0 00-1.414 1.414L8.586 13l.293.293a1 1 0 001.414 1.414L10 13.414l.293.293zm0-5a1 1 0 10-2 0v.01a1 1 0 102 0V9.707z" clipRule="evenodd"/></svg>;

