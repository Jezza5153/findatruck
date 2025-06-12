'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, AlertTriangle, Edit, MenuSquare, CalendarClock, Eye, LineChart, CreditCard, LogIn, EyeIcon, MapPin, Globe2, CheckCircle2, XCircle, Info, Star, Trophy, UserPlus, Menu as MenuIcon, ChevronLeft, ArrowLeftRight, Sun, Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import type { UserDocument, FoodTruck, MenuItem } from '@/lib/types';
import NextImage from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

// --- Theme Toggle Button ---
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const theme = localStorage.theme;
    if (
      window.matchMedia('(prefers-color-scheme: dark)').matches ||
      theme === 'dark'
    ) {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);
  function toggle() {
    setDark(d => {
      if (!d) {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
      }
      return !d;
    });
  }
  return (
    <motion.button
      aria-label="Toggle dark mode"
      className="rounded-full border p-2 shadow hover:scale-110 transition bg-white dark:bg-gray-900"
      onClick={toggle}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
    >
      {dark ? <Sun className="text-yellow-400 w-5 h-5" /> : <Moon className="text-gray-700 w-5 h-5" />}
    </motion.button>
  );
}

// --- Sidebar Navigation ---
function OwnerSidebar({ current, onNav, open, setOpen }: { current: string; onNav: (route: string) => void; open: boolean; setOpen: (o: boolean) => void }) {
  // Sidebar nav structure
  const nav = [
    { label: "Dashboard", icon: <MenuSquare />, route: "/owner/dashboard" },
    { label: "Profile", icon: <Edit />, route: "/owner/profile" },
    { label: "Menu", icon: <MenuSquare />, route: "/owner/menu" },
    { label: "Hours", icon: <CalendarClock />, route: "/owner/schedule" },
    { label: "Orders", icon: <Eye />, route: "/owner/orders" },
    { label: "Analytics", icon: <LineChart />, route: "/owner/analytics" },
    { label: "Billing", icon: <CreditCard />, route: "/owner/billing" },
    { label: "Leaderboard", icon: <Trophy className="text-yellow-400" />, route: "/owner/leaderboard" },
  ];
  return (
    <AnimatePresence>
      {(open || typeof window === 'undefined' || window.innerWidth >= 768) && (
        <motion.aside
          className={`fixed z-40 md:static left-0 top-0 h-full md:h-auto bg-card/95 border-r border-primary/10 shadow-lg flex flex-col w-64 md:w-56 px-2 py-6 transition-all ${open ? 'block' : 'hidden md:block'}`}
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <span className="font-bold text-primary text-xl tracking-tight">FindATruck</span>
            <button className="md:hidden" onClick={() => setOpen(false)}>
              <ChevronLeft />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map(n => (
              <Button
                key={n.label}
                variant={current === n.route ? "secondary" : "ghost"}
                className={`justify-start gap-2 px-4 py-2 rounded-xl text-base ${current === n.route ? 'font-bold' : ''}`}
                onClick={() => { setOpen(false); onNav(n.route); }}
              >
                {n.icon}
                {n.label}
              </Button>
            ))}
          </nav>
          <div className="flex-grow" />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// --- Status Pill ---
function StatusPill({ open, visible }: { open?: boolean; visible?: boolean }) {
  if (!open) return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-red-100 text-red-700"><XCircle className="w-4 h-4 mr-1" /> Closed</span>
  );
  if (!visible) return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800"><Info className="w-4 h-4 mr-1" /> Hidden</span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-100 text-green-800"><CheckCircle2 className="w-4 h-4 mr-1" /> Open & Visible</span>
  );
}

// --- Customer Preview Card ---
function CustomerTruckCard({
  truck,
  menuItems
}: {
  truck: Partial<FoodTruck>,
  menuItems: MenuItem[]
}) {
  const menuList = (Array.isArray(truck.todaysMenu) && menuItems.length)
    ? truck.todaysMenu
        .map((id: string) => menuItems.find(m => m.id === id))
        .filter((m): m is MenuItem => !!m)
    : [];
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      <Card className="w-full border-primary border-[1.5px] bg-gradient-to-br from-white/70 to-green-50/70 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl mb-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <MapPin className="text-primary w-5 h-5" />
            <span>{truck.name || "Your Truck Name"}</span>
            <StatusPill open={truck.isOpen} visible={truck.isVisible} />
          </CardTitle>
          <CardDescription>
            <span className="block">{truck.cuisine || "Cuisine Type"}</span>
            <span className="block">{truck.description || "About your truck..."}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <div className="flex gap-4 items-center">
            <Label>Status:</Label>
            <StatusPill open={truck.isOpen} visible={truck.isVisible} />
          </div>
          <div className="flex gap-4 items-center">
            <Label>Location:</Label>
            <span>
              {truck.currentLocation?.address
                ? truck.currentLocation.address
                : <span className="italic text-muted-foreground">No address set</span>
              }
              {!truck.currentLocation?.address && truck.currentLocation?.lat && truck.currentLocation?.lng &&
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">GPS set – not shown to customers</span>
              }
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Label>Today's Hours:</Label>
            <span>
              {(truck.todaysHours?.open && truck.todaysHours?.close)
                ? `${truck.todaysHours.open} – ${truck.todaysHours.close}`
                : <span className="italic text-muted-foreground">Not set</span>
              }
            </span>
          </div>
          <div>
            <Label>Today's Menu:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {menuList.length
                ? menuList.map((item, i) => (
                    <span key={i} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {item.imageUrl &&
                        <NextImage
                          src={item.imageUrl}
                          alt={item.name}
                          width={20}
                          height={20}
                          className="rounded-full mr-1"
                        />
                      }
                      {item.name}
                    </span>
                  ))
                : <span className="italic text-muted-foreground">No menu set for today</span>
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OwnerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckData, setTruckData] = useState<Partial<FoodTruck> | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Hotkeys
  useHotkeys('ctrl+n', () => router.push('/owner/menu'), [router]);

  // Auth + data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true); setTruckData(null);
      if (!user) {
        router.push('/login?redirect=/owner/dashboard');
        setIsLoading(false);
        return;
      }
      setCurrentUser(user);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        toast({ title: "User Not Found", description: "User profile missing. Please login again.", variant: "destructive" });
        router.push('/login');
        setIsLoading(false); return;
      }
      const userData = userDocSnap.data() as UserDocument;
      if (userData.role !== 'owner') {
        toast({ title: "Access Denied", description: "This area is for food truck owners.", variant: "destructive" });
        router.push('/'); setIsLoading(false); return;
      }
      const resolvedTruckId = userData.truckId || user.uid;
      setTruckId(resolvedTruckId);
      const truckDocRef = doc(db, "trucks", resolvedTruckId);
      const snap = await getDoc(truckDocRef);
      if (snap.exists()) setTruckData(snap.data() as Partial<FoodTruck>);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  // Fetch menu items for preview
  useEffect(() => {
    if (!truckId || !truckData?.todaysMenu?.length) { setMenuItems([]); return; }
    (async () => {
      const itemsCol = collection(db, "trucks", truckId, "menuItems");
      const itemsSnap = await getDocs(itemsCol);
      setMenuItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    })();
  }, [truckId, truckData?.todaysMenu]);

  // Save truck updates (with auto feedback)
  const updateTruck = useCallback(async (updates: Partial<FoodTruck>) => {
    if (!truckId) return;
    await updateDoc(doc(db, "trucks", truckId), updates);
    setTruckData(prev => ({ ...prev, ...updates }));
    toast({ title: "Saved!", description: "Truck profile auto-saved." });
  }, [truckId, toast]);

  // --- Loading & Auth States ---
  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <span className="ml-3 text-xl font-semibold tracking-tight">Loading owner dashboard...</span>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <LogIn className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in as an owner to view this page.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/login?redirect=/owner/dashboard">Login as Owner</Link>
        </Button>
      </div>
    );
  }

  if (!truckData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <div className="text-lg font-medium">Setting up your truck profile...</div>
      </div>
    );
  }

  // -- Main dashboard layout --
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* MOBILE FAB */}
      <Button
        className="fixed z-50 md:hidden bottom-6 right-6 rounded-full w-16 h-16 p-0 shadow-xl bg-primary"
        onClick={() => setSidebarOpen(true)}
      >
        <MenuIcon className="w-8 h-8 text-white" />
      </Button>

      {/* SIDEBAR */}
      <OwnerSidebar current="/owner/dashboard" onNav={router.push} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* MAIN */}
      <main className="flex-1 flex flex-col px-2 py-6 md:px-8 md:py-10 max-w-6xl mx-auto relative">
        {/* THEME TOGGLE */}
        <div className="absolute top-4 right-4 z-40">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary drop-shadow-sm">Owner Dashboard</h1>
          <StatusPill open={truckData.isOpen} visible={truckData.isVisible} />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Button size="sm" variant="outline" onClick={() => router.push('/owner/menu')}>
            <MenuSquare className="mr-2 w-4 h-4" /> New Menu
          </Button>
          <Button
            size="sm"
            variant={truckData.isOpen ? "destructive" : "secondary"}
            onClick={() => updateTruck({ isOpen: !truckData.isOpen })}
          >
            <ArrowLeftRight className="mr-2 w-4 h-4" />
            {truckData.isOpen ? "Close Truck" : "Open Truck"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push('/owner/orders')}>
            <Eye className="mr-2 w-4 h-4" /> Orders
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push('/owner/schedule')}>
            <CalendarClock className="mr-2 w-4 h-4" /> Edit Hours
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push('/owner/leaderboard')}>
            <Trophy className="mr-2 w-4 h-4 text-yellow-400" /> Leaderboard
          </Button>
        </div>

        {/* Presence */}
        <Card className="mb-8 shadow-md border-2 border-primary/10 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              <Globe2 className="inline w-6 h-6 mr-2 text-primary" />
              I'm Here! <span className="font-normal text-muted-foreground">Live Presence</span>
            </CardTitle>
            <CardDescription>
              Share your location, today's menu, and hours. Let customers find and follow you!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* LOCATION */}
            <div className="mb-4 flex gap-2 items-center flex-wrap">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!navigator.geolocation) {
                    toast({ title: "Location Not Supported", description: "Enable GPS or enter address manually.", variant: "destructive" }); return;
                  }
                  navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    await updateTruck({
                      currentLocation: { lat: latitude, lng: longitude },
                      lat: latitude,
                      lng: longitude,
                      locationSetAt: new Date(),
                    });
                    toast({ title: "Location Updated", description: "Customers will see your live GPS location now." });
                  });
                }}>
                📍 Use My Location
              </Button>
              <span className="text-muted-foreground">or</span>
              <Button
                variant="secondary"
                onClick={async () => {
                  const addr = prompt("Enter your current address (e.g. 123 Main St):");
                  if (addr) {
                    await updateTruck({
                      currentLocation: { address: addr },
                      address: addr,
                      locationSetAt: new Date(),
                    });
                    toast({ title: "Location Updated", description: "Customers will see your entered address now." });
                  }
                }}>
                Enter Address Manually
              </Button>
              {truckData?.currentLocation && (
                <span className="ml-4 text-sm font-medium">
                  Current: <span className="text-muted-foreground">
                  {truckData.currentLocation.address
                    ? truckData.currentLocation.address
                    : <span className="italic text-muted-foreground">No address set</span>}
                  {!truckData.currentLocation.address && truckData.currentLocation.lat && truckData.currentLocation.lng &&
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">GPS set – not shown to customers</span>
                  }
                  </span>
                </span>
              )}
            </div>
            {/* HOURS */}
            <div className="mb-4 flex gap-2 items-center">
              <Label className="mr-2">Today's Hours:</Label>
              <input
                type="time"
                value={typeof truckData?.todaysHours === 'object' ? truckData.todaysHours?.open || "" : ""}
                onChange={async e => {
                  const open = e.target.value;
                  let hours: any = typeof truckData?.todaysHours === 'object' ? { ...truckData?.todaysHours } : {};
                  hours.open = open;
                  await updateTruck({ todaysHours: hours });
                }}
                className="w-32 border rounded px-2 py-1"
              />
              <span>to</span>
              <input
                type="time"
                value={typeof truckData?.todaysHours === 'object' ? truckData.todaysHours?.close || "" : ""}
                onChange={async e => {
                  const close = e.target.value;
                  let hours: any = typeof truckData?.todaysHours === 'object' ? { ...truckData?.todaysHours } : {};
                  hours.close = close;
                  await updateTruck({ todaysHours: hours });
                }}
                className="w-32 border rounded px-2 py-1"
              />
            </div>
            {/* MENU */}
            <div className="mb-4">
              <Label className="mr-2">Today's Menu:</Label>
              <Button asChild variant="link" className="p-0 h-auto ml-1">
                <Link href="/owner/menu">Edit Today's Menu</Link>
              </Button>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Array.isArray(truckData?.todaysMenu) && menuItems.length)
                  ? truckData.todaysMenu.map((id: string, i: number) => {
                      const item = menuItems.find(m => m.id === id);
                      if (!item) return null;
                      return (
                        <span key={i} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          {item.imageUrl &&
                            <NextImage
                              src={item.imageUrl}
                              alt={item.name}
                              width={20}
                              height={20}
                              className="rounded-full mr-1"
                            />}
                          {item.name}
                        </span>
                      );
                    })
                  : <span className="italic text-muted-foreground">No menu set for today</span>
                }
              </div>
            </div>
            {/* VISIBILITY */}
            <div className="flex items-center gap-2">
              <Switch
                checked={!!truckData?.isVisible}
                onCheckedChange={async (checked: boolean) => {
                  await updateTruck({ isVisible: checked });
                }}
                id="visible-toggle"
              />
              <Label htmlFor="visible-toggle">
                Show Me to Customers <span className="text-xs text-muted-foreground">(Live on Map)</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER PREVIEW */}
        <Card className="mb-10 border-dashed border-blue-300/80 bg-blue-50/60 shadow-none">
          <CardHeader>
            <CardTitle>
              <EyeIcon className="inline w-5 h-5 mr-2 text-primary" />
              Preview: What Customers See
            </CardTitle>
            <CardDescription>This is your live customer card.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerTruckCard truck={truckData} menuItems={menuItems} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
