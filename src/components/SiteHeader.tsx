
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Utensils, LogOut, UserCircle, Home, MapPin, HelpCircle, Bell, Gift, LogIn as LogInIcon, Star, ChefHat, Settings } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import type { UserDocument } from '@/lib/types'; 

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserDocument['role'] | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserDocument;
            setUserRole(userData.role);
          } else {
            setUserRole(null); 
            console.warn("User document not found in Firestore for UID:", currentUser.uid);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null); 
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      setIsSheetOpen(false); 
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
    { href: "/help", label: "Help & FAQ", icon: <HelpCircle className="mr-2 h-5 w-5" /> },
  ];

  const customerAuthNavLinks = [
    { href: "/customer/dashboard", label: "My Dashboard", icon: <Settings className="mr-2 h-5 w-5" /> },
    { href: "/customer/notifications", label: "Notifications", icon: <Bell className="mr-2 h-5 w-5" /> },
    { href: "/customer/rewards", label: "Rewards", icon: <Gift className="mr-2 h-5 w-5" /> },
  ];
  
  const ownerAuthNavLinks = [
    { href: "/owner/dashboard", label: "Owner Dashboard", icon: <ChefHat className="mr-2 h-5 w-5" /> },
  ];
  
  const handleLinkClick = () => setIsSheetOpen(false);


  const renderNavLinks = (isMobile = false) => {
    const buttonClass = isMobile ? "justify-start text-base py-6 w-full" : "text-sm";
    const iconClass = isMobile ? "mr-3 h-5 w-5" : "mr-2 h-4 w-4";

    return (
      <>
        {isMobile && (
          <Button variant="ghost" asChild className={buttonClass} onClick={handleLinkClick}>
            <Link href="/"><Home className={iconClass} />Home</Link>
          </Button>
        )}
        {commonNavLinks.map(link => (
          <Button key={link.href} variant="ghost" size={isMobile ? "lg" : "sm"} asChild className={`${buttonClass} ${pathname === link.href ? 'bg-accent/20 text-accent-foreground' : ''}`} onClick={handleLinkClick}>
            <Link href={link.href}>{React.cloneElement(link.icon, {className: iconClass})}{link.label}</Link>
          </Button>
        ))}
        {user && !isLoadingAuth && (
          <>
            {userRole === 'customer' && customerAuthNavLinks.map(link => (
              <Button key={link.href} variant="ghost" size={isMobile ? "lg" : "sm"} asChild className={`${buttonClass} ${pathname === link.href ? 'bg-accent/20 text-accent-foreground' : ''}`} onClick={handleLinkClick}>
                <Link href={link.href}>{React.cloneElement(link.icon, {className: iconClass})}{link.label}</Link>
              </Button>
            ))}
            {userRole === 'owner' && ownerAuthNavLinks.map(link => (
              <Button key={link.href} variant="ghost" size={isMobile ? "lg" : "sm"} asChild className={`${buttonClass} ${pathname === link.href ? 'bg-accent/20 text-accent-foreground' : ''} ${isMobile ? 'text-accent border-accent hover:bg-accent/10 hover:text-accent':''}`} onClick={handleLinkClick}>
                <Link href={link.href}>{React.cloneElement(link.icon, {className: iconClass})}{link.label}</Link>
              </Button>
            ))}
            {isMobile && <hr className="my-2"/>}
            <Button size={isMobile ? "lg" : "sm"} variant={isMobile ? "destructive" : "outline"} onClick={handleLogout} className={`${buttonClass} ${isMobile ? 'bg-destructive hover:bg-destructive/90' : ''}`}>
              <LogOut className={iconClass} />Logout
            </Button>
          </>
        )}
        {!user && !isLoadingAuth && (
          <>
            {isMobile && <hr className="my-2"/>}
            <Button variant="ghost" size={isMobile ? "lg" : "sm"} asChild className={buttonClass} onClick={handleLinkClick}>
              <Link href="/login"><LogInIcon className={iconClass}/>Login</Link>
            </Button>
            <Button size={isMobile ? "lg" : "sm"} asChild className={`${buttonClass} ${isMobile ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'}`} onClick={handleLinkClick}>
              <Link href="/customer/signup"><UserCircle className={iconClass}/>Customer Sign Up</Link>
            </Button>
             {isMobile && (
                <Button variant="outline" asChild className={`${buttonClass} text-accent border-accent hover:bg-accent/10 hover:text-accent`} onClick={handleLinkClick}>
                    <Link href="/owner/signup"><ChefHat className={iconClass} />Owner Sign Up</Link>
                </Button>
             )}
          </>
        )}
      </>
    );
  };


  if (isLoadingAuth && !user) { 
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block text-lg">Truck Tracker</span>
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
        <Link href="/" className="mr-6 flex items-center space-x-2" onClick={isSheetOpen ? handleLinkClick : undefined}>
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">Truck Tracker</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex gap-1 items-center">
            {renderNavLinks(false)}
          </nav>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden px-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0"> 
              <SheetHeader className="p-4 border-b"> 
                <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick}>
                    <Utensils className="h-6 w-6 text-primary" />
                    <SheetTitle>Truck Tracker</SheetTitle>
                </Link>
                <VisuallyHidden><SheetTitle>Menu</SheetTitle></VisuallyHidden>
                <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
              </SheetHeader>
               <div className="p-4 flex flex-col gap-3"> 
                {renderNavLinks(true)}
               </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
