import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, UserCircle, Utensils } from 'lucide-react'; // Utensils is a good icon for a food app logo

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Find Trucks', href: '/map' },
  { label: 'My Dashboard', href: '/dashboard' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Help', href: '/help' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">Truck Tracker</span>
        </Link>
        
        <nav className="hidden md:flex gap-6 items-center flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
            <Link href="/signup">Sign Up</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden px-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-2 py-1 text-lg font-medium hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
