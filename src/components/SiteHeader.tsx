
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Utensils, LogOut, UserCircle, Home, MapPin, HelpCircle, Bell, Gift, LogIn as LogInIcon, Star, ChefHat } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  const commonNavLinks = [
    { href: "/map", label: "Find Trucks", icon: <MapPin className="mr-2 h-5 w-5" /> },
    { href: "/featured", label: "Featured", icon: <Star className="mr-2 h-5 w-5" /> },
    { href: "/help", label: "Help", icon: <HelpCircle className="mr-2 h-5 w-5" /> },
  ];

  const customerAuthNavLinks = [
    { href: "/customer/dashboard", label: "My Dashboard", icon: <UserCircle className="mr-2 h-5 w-5" /> },
    { href: "/customer/notifications", label: "Notifications", icon: <Bell className="mr-2 h-5 w-5" /> },
    { href: "/customer/rewards", label: "Rewards", icon: <Gift className="mr-2 h-5 w-5" /> },
  ];
  
  const ownerAuthNavLinks = [
    { href: "/owner/dashboard", label: "Owner Dashboard", icon: <ChefHat className="mr-2 h-5 w-5" /> },
  ];

  if (!isClient) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block text-lg">FindATruck</span>
          </Link>
           <div className="flex flex-1 items-center justify-end space-x-4">
           </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">FindATruck</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex gap-1 items-center">
            {commonNavLinks.map(link => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link href={link.href}>{link.icon}{link.label}</Link>
              </Button>
            ))}
            {user ? (
              <>
                {/* TODO: Check user role from Firestore to conditionally render customerAuthNavLinks or ownerAuthNavLinks */}
                {customerAuthNavLinks.map(link => (
                  <Button key={link.href} variant="ghost" size="sm" asChild>
                    <Link href={link.href}>{link.icon}{link.label}</Link>
                  </Button>
                ))}
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/owner/dashboard"><ChefHat className="mr-2 h-4 w-4"/>Owner Area</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-1 h-4 w-4" />Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login"><LogInIcon className="mr-1 h-4 w-4"/>Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                  <Link href="/customer/signup"><UserCircle className="mr-1 h-4 w-4"/>Sign Up</Link>
                </Button>
              </>
            )}
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden px-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-4">
                <Link href="/" className="flex items-center space-x-2">
                    <Utensils className="h-6 w-6 text-primary" />
                    <SheetTitle>FindATruck</SheetTitle>
                </Link>
                <VisuallyHidden><SheetTitle>Menu</SheetTitle></VisuallyHidden>
              </SheetHeader>
               <div className="mt-8 flex flex-col gap-3">
                <Button variant="outline" asChild className="justify-start text-base py-6">
                    <Link href="/"><Home className="mr-2 h-5 w-5" />Home</Link>
                </Button>
                {commonNavLinks.map(link => (
                    <Button key={link.href} variant="outline" asChild className="justify-start text-base py-6">
                        <Link href={link.href}>{link.icon}{link.label}</Link>
                    </Button>
                ))}
                <hr className="my-2"/>
                {user ? (
                  <>
                    {/* TODO: Check user role from Firestore to conditionally render customerAuthNavLinks or ownerAuthNavLinks */}
                    {customerAuthNavLinks.map(link => (
                        <Button key={link.href} variant="outline" asChild className="justify-start text-base py-6">
                            <Link href={link.href}>{link.icon}{link.label}</Link>
                        </Button>
                    ))}
                     <Button variant="outline" asChild className="justify-start text-base py-6 text-accent border-accent hover:bg-accent/10 hover:text-accent">
                        <Link href="/owner/dashboard"><ChefHat className="mr-2 h-5 w-5" />Owner Dashboard</Link>
                    </Button>
                    <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive/90 justify-start text-base py-6">
                      <LogOut className="mr-2 h-5 w-5" />Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="justify-start text-base py-6">
                        <Link href="/login"><LogInIcon className="mr-2 h-5 w-5" />Login</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 justify-start text-base py-6">
                        <Link href="/customer/signup"><UserCircle className="mr-2 h-5 w-5" />Customer Sign Up</Link>
                    </Button>
                    <Button variant="outline" asChild className="text-accent border-accent hover:bg-accent/10 hover:text-accent justify-start text-base py-6">
                        <Link href="/owner/signup"><ChefHat className="mr-2 h-5 w-5" />Owner Sign Up</Link>
                    </Button>
                  </>
                )}
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
