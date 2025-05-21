
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Utensils, LogOut, UserCircle } from 'lucide-react'; 
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
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/'); // Redirect to homepage after logout
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  if (!isClient) {
    // Render a basic header or null during SSR to avoid hydration mismatch potential with auth state
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block text-lg">FindATruck</span>
          </Link>
           <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Placeholder for buttons to avoid layout shift */}
             <Button variant="ghost" size="sm" disabled>Login</Button>
             <Button size="sm" disabled>Sign Up</Button>
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
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard"><UserCircle className="mr-1 h-5 w-5" />My Dashboard</Link>
              </Button>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                <LogOut className="mr-1 h-5 w-5" />Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}

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
                  <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden>
              </SheetHeader>
               <div className="mt-8 flex flex-col gap-4">
                {user ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard"><UserCircle className="mr-2 h-5 w-5" />My Dashboard</Link>
                    </Button>
                     <Button variant="outline" asChild>
                      <Link href="/notifications"><Menu className="mr-2 h-5 w-5" />Notifications</Link>
                    </Button>
                     <Button variant="outline" asChild>
                      <Link href="/rewards"><Menu className="mr-2 h-5 w-5" />Rewards</Link>
                    </Button>
                     <Button variant="outline" asChild>
                      <Link href="/help"><Menu className="mr-2 h-5 w-5" />Help</Link>
                    </Button>
                    <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                      <LogOut className="mr-2 h-5 w-5" />Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                    <hr/>
                     <Button variant="ghost" asChild>
                        <Link href="/map">Find Trucks</Link>
                    </Button>
                     <Button variant="ghost" asChild>
                        <Link href="/help">Help</Link>
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
