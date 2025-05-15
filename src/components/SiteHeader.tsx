
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Utensils } from 'lucide-react'; 
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// navItems removed as per user request to simplify header

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">FindATruck</span>
        </Link>
        
        {/* Desktop navigation removed */}
        {/* 
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
        */}

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
              <SheetHeader>
                <VisuallyHidden> 
                  <SheetTitle>Menu</SheetTitle> {/* Changed from "Navigation Menu" for brevity */}
                </VisuallyHidden>
              </SheetHeader>
              {/* Mobile navigation links removed. This area can be populated with authenticated user links later. */}
              {/* 
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
              */}
               <div className="mt-8 flex flex-col gap-4">
                <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/signup">Sign Up</Link>
                </Button>
                {/* Placeholder for future authenticated links like "My Dashboard", "Logout" */}
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
