'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Utensils, LogOut, UserCircle, Home, MapPin, HelpCircle, Bell, Gift, LogIn as LogInIcon, Star, ChefHat, Settings } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import type { UserDocument } from '@/lib/types';

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

  // --- Branding ---
  const BrandIcon = Utensils; // Replace with custom if you have a FindATruck logo!

  // --- Navigation Links ---
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

  // --- Render nav links with active states ---
  const renderNavLinks = (isMobile = false) => {
    const buttonClass = isMobile ? "justify-start text-base py-6 w-full" : "text-sm";
    const iconClass = isMobile ? "mr-3 h-5 w-5" : "mr-2 h-4 w-4";

    return (
      <>
        {isMobile && (
          <Button variant="ghost" asChild className={buttonClass} onClick={handleLinkClick}>
            <Link href="/" aria-label="Go to FindATruck home"><Home className={iconClass} />Home</Link>
          </Button>
        )}
        {commonNavLinks.map(link => (
          <Button
            key={link.href}
            variant="ghost"
            size={isMobile ? "lg" : "sm"}
            asChild
            className={`${buttonClass} ${pathname === link.href ? 'bg-accent/20 text-accent-foreground' : ''}`}
            aria-current={pathname === link.href ? "page" : undefined}
            onClick={handleLinkClick}
          >
            <Link href={link.href}>{React.cloneElement(link.icon, { className: iconClass })}{link.label}</Link>
          </Button>
        ))}
        {user && !isLoadingAuth && (
          <>
            {userRole === 'customer' && customerAuthNavLinks.map(link => (
              <Button
                key={link.href}
                variant="ghost"
                size={isMobile ? "lg" : "sm"}
                asChild
                className={`${buttonClass} ${pathname === link.href ? 'bg-accent/20 text-accent-foreground' : ''}`}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={handleLinkClick}
              >
                <Link href={link.href}>{React.cloneElement(link.icon, { className: iconClass })}{link.label}</Link>
              </Button>
            ))}
            {userRole === 'owner' && ownerAuthNavLinks.map(link => (
              <Button
                key={link.href}
                variant="ghost"
                size={isMobile ? "lg" : "sm"}
                asChild
                className={`${buttonClass} ${pathname === link.href ? 'bg-accent/20 text-accent-foreground' : ''} ${isMobile ? 'text-accent border-accent hover:bg-accent/10 hover:text-accent':''}`}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={handleLinkClick}
              >
                <Link href={link.href}>{React.cloneElement(link.icon, { className: iconClass })}{link.label}</Link>
              </Button>
            ))}
            {isMobile && <hr className="my-2" />}
            <Button
              size={isMobile ? "lg" : "sm"}
              variant={isMobile ? "destructive" : "outline"}
              onClick={handleLogout}
              className={`${buttonClass} ${isMobile ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            >
              <LogOut className={iconClass} />Logout
            </Button>
          </>
        )}
        {!user && !isLoadingAuth && (
          <>
            {isMobile && <hr className="my-2" />}
            <Button variant="ghost" size={isMobile ? "lg" : "sm"} asChild className={buttonClass} onClick={handleLinkClick}>
              <Link href="/login"><LogInIcon className={iconClass} />Login</Link>
            </Button>
            <Button size={isMobile ? "lg" : "sm"} asChild className={`${buttonClass} bg-primary hover:bg-primary/90`} onClick={handleLinkClick}>
              <Link href="/signup"><UserCircle className={iconClass} />Customer Sign Up</Link>
            </Button>
            {isMobile && (
              <Button
                variant="outline"
                asChild
                className={`${buttonClass} text-accent border-accent hover:bg-accent/10 hover:text-accent`}
                onClick={handleLinkClick}
              >
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
          <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="FindATruck Home">
            <BrandIcon className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block text-lg">FindATruck</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Loading shimmer or spinner if you wish */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="FindATruck Home" onClick={isSheetOpen ? handleLinkClick : undefined}>
          <BrandIcon className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block text-lg">FindATruck</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden md:flex gap-1 items-center">
            {renderNavLinks(false)}
          </nav>
          {user && !isLoadingAuth && (
            <div className="hidden md:flex items-center gap-3 ml-2">
              <UserCircle className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[110px]" title={userName || undefined}>
                {userName}
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
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0" aria-label="FindATruck Menu">
              <SheetHeader className="p-4 border-b">
                <Link href="/" className="flex items-center space-x-2" onClick={handleLinkClick} aria-label="FindATruck Home">
                  <BrandIcon className="h-6 w-6 text-primary" />
                  <SheetTitle>FindATruck</SheetTitle>
                </Link>
                <VisuallyHidden><SheetTitle>Menu</SheetTitle></VisuallyHidden>
                <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary" />
              </SheetHeader>
              <div className="p-4 flex flex-col gap-3">
                {user && (
                  <div className="flex items-center gap-3 mb-2 border-b pb-2">
                    <UserCircle className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
                    <span className="font-semibold text-base truncate max-w-[140px]" title={userName || undefined}>{userName}</span>
                  </div>
                )}
                {renderNavLinks(true)}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
