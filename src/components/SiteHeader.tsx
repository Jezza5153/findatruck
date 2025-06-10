
'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Utensils, LogOut, UserCircle, Home, MapPin, HelpCircle, Bell, Gift, LogIn as LogInIcon, Star, ChefHat, Settings } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import type { UserDocument } from '@/lib/types';
import { cn } from '@/lib/utils'; // Import cn

// ---- Import your stats bar here!
import HeaderStatsBar from '@/components/HeaderStatsBar';

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserDocument['role'] | null>(null);
  const [userName, setUserName] = useState<string | null>(null); // For display
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
            setUserName(userData.truckName || userData.name || currentUser.displayName || currentUser.email || "User");
          } else {
            setUserRole(null);
            setUserName(null);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setUserRole(null);
          setUserName(null);
        }
      } else {
        setUserRole(null);
        setUserName(null);
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
      setUserName(null);
      setIsSheetOpen(false);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/');
    } catch (error) {
      toast({ title: "Logout Failed", description: "Could not log you out. Please try again.", variant: "destructive" });
    }
  };

  const BrandIcon = Utensils;

  const commonNavLinks = [
    { href: "/map", label: "Find Trucks", icon: <MapPin /> },
    { href: "/featured", label: "Featured", icon: <Star /> },
    { href: "/help", label: "Help & FAQ", icon: <HelpCircle /> },
  ];

  const customerAuthNavLinks = [
    { href: "/customer/dashboard", label: "My Dashboard", icon: <Settings /> },
    { href: "/customer/notifications", label: "Notifications", icon: <Bell /> },
    { href: "/customer/rewards", label: "Rewards", icon: <Gift /> },
  ];

  const ownerAuthNavLinks = [
    { href: "/owner/dashboard", label: "Owner Dashboard", icon: <ChefHat /> },
  ];

  const handleLinkClick = () => setIsSheetOpen(false);

  const renderNavLinks = (isMobile = false) => {
    const mobileBaseClass = "justify-start text-base py-3 w-full"; // Adjusted py for consistency
    const desktopBaseClass = "text-sm";
    const iconClass = isMobile ? "mr-3 h-5 w-5" : "mr-2 h-4 w-4";

    return (
      <>
        {isMobile && (
          <Link
            href="/"
            aria-label="Truck Tracker home"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              mobileBaseClass
            )}
            onClick={handleLinkClick}
          >
            <span><Home className={iconClass} />Home</span>
          </Link>
        )}
        {commonNavLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: isMobile ? "lg" : "sm" }),
              isMobile ? mobileBaseClass : desktopBaseClass,
              pathname === link.href ? 'bg-primary/10 text-primary' : ''
            )}
            aria-current={pathname === link.href ? "page" : undefined}
            onClick={handleLinkClick}
          >
            <span>
              {React.cloneElement(link.icon, { className: iconClass })}
              {link.label}
            </span>
          </Link>
        ))}
        {user && !isLoadingAuth && (
          <>
            {userRole === 'customer' && customerAuthNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: isMobile ? "lg" : "sm" }),
                  isMobile ? mobileBaseClass : desktopBaseClass,
                  pathname === link.href ? 'bg-primary/10 text-primary' : ''
                )}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={handleLinkClick}
              >
                <span>
                  {React.cloneElement(link.icon, { className: iconClass })}
                  {link.label}
                </span>
              </Link>
            ))}
            {userRole === 'owner' && ownerAuthNavLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: isMobile ? "lg" : "sm" }),
                  isMobile ? `${mobileBaseClass} text-accent border-accent hover:bg-accent/10 hover:text-accent` : desktopBaseClass,
                  pathname === link.href ? (isMobile ? 'bg-accent/20 text-accent-foreground font-semibold' : 'bg-primary/10 text-primary') : ''
                )}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={handleLinkClick}
              >
                <span>
                  {React.cloneElement(link.icon, { className: iconClass })}
                  {link.label}
                </span>
              </Link>
            ))}
            {isMobile && <hr className="my-2 border-border" />}
            <Button // Logout button is a direct action, not a link
              size={isMobile ? "lg" : "sm"}
              variant={isMobile ? "destructive" : "outline"}
              onClick={handleLogout}
              className={cn(isMobile ? mobileBaseClass : desktopBaseClass)}
            >
              <LogOut className={iconClass} />Logout
            </Button>
          </>
        )}
        {!user && !isLoadingAuth && (
          <>
            {isMobile && <hr className="my-2 border-border" />}
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: isMobile ? "lg" : "sm" }),
                isMobile ? mobileBaseClass : desktopBaseClass
              )}
              onClick={handleLinkClick}
            >
              <span><LogInIcon className={iconClass} />Login</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: isMobile ? "default" : "default", size: isMobile ? "lg" : "sm" }),
                isMobile ? mobileBaseClass : desktopBaseClass,
                isMobile ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-primary text-primary-foreground hover:bg-primary/90' // Ensure mobile primary looks distinct
              )}
              onClick={handleLinkClick}
            >
              <span><UserCircle className={iconClass} />Customer Sign Up</span>
            </Link>
            {isMobile && (
              <Link
                href="/owner/signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  mobileBaseClass,
                  'text-accent border-accent hover:bg-accent/10 hover:text-accent'
                )}
                onClick={handleLinkClick}
              >
                <span><ChefHat className={iconClass} />Owner Sign Up</span>
              </Link>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2 group" aria-label="Truck Tracker Home" onClick={isSheetOpen ? handleLinkClick : undefined}>
          <BrandIcon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="font-bold sm:inline-block text-lg tracking-tight">Truck Tracker</span>
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <div className="relative h-0 w-full">
            <HeaderStatsBar />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex gap-1 items-center">
            {renderNavLinks(false)}
          </nav>
          {user && !isLoadingAuth && (
            <div className="hidden md:flex items-center gap-3 ml-2">
              <UserCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[110px]" title={userName || undefined}>
                {userName || "User"}
              </span>
            </div>
          )}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden px-2" aria-label="Open menu">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0" aria-label="Truck Tracker Menu">
              <SheetHeader className="p-4 border-b">
                <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick} aria-label="Truck Tracker Home">
                  <BrandIcon className="h-6 w-6 text-primary" />
                  <SheetTitle>Truck Tracker</SheetTitle>
                </Link>
                <VisuallyHidden><SheetTitle>Menu</SheetTitle></VisuallyHidden>
                <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
              </SheetHeader>
              <div className="p-4 flex flex-col gap-2"> {/* Reduced gap for tighter mobile menu */}
                {user && !isLoadingAuth && (
                  <div className="flex items-center gap-3 mb-2 border-b pb-3"> {/* Adjusted padding/margin */}
                    <UserCircle className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
                    <span className="font-semibold text-base truncate max-w-[160px]" title={userName || undefined}>{userName || "User"}</span>
                  </div>
                )}
                {renderNavLinks(true)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="absolute left-0 right-0 top-16 h-2 bg-gradient-to-b from-background/70 to-transparent pointer-events-none z-30" />
    </header>
  );
}

export default SiteHeader;

    