
'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, AlertTriangle, Edit, MenuSquare, CalendarClock, Eye, LineChart, CreditCard, LogIn, MapPin, Globe2, CheckCircle2, XCircle, Info, Star, Trophy, Moon, Sun, UserPlus, Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import type { UserDocument, FoodTruck, MenuItem } from '@/lib/types';
import OwnerSidebar from '@/components/OwnerSidebar';
import AnalyticsWidgets from '@/components/AnalyticsWidgets';
import CustomerFeedback from '@/components/CustomerFeedback';
import WeatherWidget from '@/components/WeatherWidget';
import FoodTruckMap from '@/components/FoodTruckMap';
import RealTimeAlert from '@/components/RealTimeAlert';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';

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

function StatusPill({ open, visible }: { open?: boolean; visible?: boolean }) {
  if (!open) return (
    <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-red-100 text-red-700"
    ><XCircle className="w-4 h-4 mr-1" /> Closed</motion.span>
  );
  if (!visible) return (
    <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800"
    ><Info className="w-4 h-4 mr-1" /> Hidden</motion.span>
  );
  return (
    <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-100 text-green-800"
    ><CheckCircle2 className="w-4 h-4 mr-1" /> Open & Visible</motion.span>
  );
}

function formatAMPM(time: string = '') {
  if (!time.includes(':')) return time;
  let [hour, min] = time.split(':');
  let h = parseInt(hour, 10);
  let ampm = h >= 12 ? 'pm' : 'am';
  let h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12.toString().padStart(2, '0')}:${min} ${ampm}`;
}

function setupProgress(truck?: Partial<FoodTruck>) {
  if (!truck) return 0;
  let n = 0;
  if (truck.name) n++;
  if (truck.cuisine) n++;
  if (truck.currentLocation && truck.currentLocation.address) n++;
  if (truck.todaysMenu && truck.todaysMenu.length > 0) n++;
  if (truck.todaysHours && truck.todaysHours.open && truck.todaysHours.close) n++;
  return Math.round((n / 5) * 100);
}

// ---- Customer Card Preview (defensive image loading) -----------
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
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full">
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
                ? `${formatAMPM(truck.todaysHours.open)} – ${formatAMPM(truck.todaysHours.close)}`
                : <span className="italic text-muted-foreground">Not set</span>
              }
            </span>
          </div>
          <div>
            <Label>Today's Menu:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {menuList.length
                ? menuList.map((item, i) => {
                    // Defensive: imageUrl is non-empty and valid
                    const isImg = typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http');
                    return (
                      <span key={i} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        {isImg
                          ? (
                              <NextImage
                                src={item.imageUrl}
                                alt={item.name}
                                width={20}
                                height={20}
                                className="rounded-full mr-1"
                                unoptimized
                                onError={(e) => {
                                  if (process.env.NODE_ENV === 'development') {
                                    // eslint-disable-next-line no-console
                                    console.warn('Failed to load image:', item.imageUrl);
                                  }
                                }}
                              />
                            )
                          : <ImageIcon className="w-4 h-4 mr-1 text-gray-300" />
                        }
                        {item.name}
                      </span>
                    );
                  })
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
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // ----- Fetch Auth + Truck Data -----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true); setTruckData(null); setError(null);
      if (!user) {
        router.push('/login?redirect=/owner/dashboard'); setIsLoading(false); return;
      }
      setCurrentUser(user);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        toast({ title: "User Not Found", description: "User profile missing. Please login again.", variant: "destructive" });
        router.push('/login'); setIsLoading(false); return;
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
      else setError("Truck profile not found.");
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  // Fetch menu items for today's menu preview
  useEffect(() => {
    if (!truckId || !truckData?.todaysMenu?.length) { setMenuItems([]); return; }
    (async () => {
      const itemsCol = collection(db, "trucks", truckId, "menuItems");
      const itemsSnap = await getDocs(itemsCol);
      setMenuItems(itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    })();
  }, [truckId, truckData?.todaysMenu]);

  const updateTruck = useCallback(async (updates: Partial<FoodTruck>) => {
    if (!truckId) return;
    const sanitizedUpdates: Partial<FoodTruck> = { ...updates };
    if ('lat' in sanitizedUpdates && sanitizedUpdates.lat === null) delete sanitizedUpdates.lat;
    if ('lng' in sanitizedUpdates && sanitizedUpdates.lng === null) delete sanitizedUpdates.lng;
    await updateDoc(doc(db, "trucks", truckId), sanitizedUpdates);
    setTruckData(prev => ({ ...prev, ...sanitizedUpdates }));
  }, [truckId]);

  const dashboardDisabled = !truckData?.name;

  // ---- Loading & Auth States ----
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-xl font-semibold tracking-tight">Loading owner dashboard...</span>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <LogIn className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in as an owner to view this page.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/login?redirect=/owner/dashboard"><span>Login as Owner</span></Link>
        </Button>
      </div>
    );
  }
  if (!truckData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <div className="text-lg font-medium">Setting up your truck profile...</div>
        <div className="text-muted-foreground mt-2 mb-6">Please refresh the page if this takes longer than 20 seconds.</div>
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Truck Not Ready</AlertTitle>
          <AlertDescription>
            {error || "Your truck profile is still being set up in the background. Most dashboard actions will be unavailable until this completes."}
            <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => window.location.reload()}>
              Retry Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const progress = setupProgress(truckData);

  // ---- Social Share Handler ----
  const handleShare = () => {
    const url = `${window.location.origin}/trucks/${truckId}`;
    const text = encodeURIComponent(`Find us today at: ${truckData.currentLocation?.address || "see our map"}! 🍔🚚 ${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  // ---------------- UI START -----------------
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* SIDEBAR */}
      <OwnerSidebar activePage="dashboard" />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-2 py-8 md:px-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-40">
          <ThemeToggle />
        </div>

        {/* Header and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3 mt-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary drop-shadow-sm">Owner Dashboard</h1>
            <p className="text-muted-foreground font-medium">
              Manage <span className="font-semibold">{truckData?.name || "your food truck"}</span>'s profile, sales, and analytics.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-3 p-3 border rounded-xl shadow-sm bg-card">
              <Label htmlFor="truck-status-toggle" className={`text-sm font-medium ${truckData.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                Truck Status: {truckData.isOpen ? "Open" : "Closed"}
              </Label>
              <Switch
                id="truck-status-toggle"
                checked={!!truckData.isOpen}
                onCheckedChange={dashboardDisabled ? undefined : async (checked) => {
                  await updateTruck({ isOpen: checked });
                  toast({ title: "Status Updated", description: `Your truck is now marked as ${checked ? "Open" : "Closed"}.` });
                }}
                aria-label={`Toggle truck status to ${truckData.isOpen ? "closed" : "open"}`}
                disabled={dashboardDisabled}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
              <span className="block">Setup Progress:</span>
              <div className="h-2 w-36 rounded-full bg-muted overflow-hidden">
                <div className={`h-2 rounded-full bg-primary transition-all`} style={{ width: `${progress}%` }} />
              </div>
              <span className="ml-1">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <RealTimeAlert alerts={alerts} />

        {/* Main Grid: Analytics + Calendar + Map + Share + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Left Column (Analytics, Sales, Calendar, Share) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Stats</CardTitle>
                <CardDescription>Overview of your truck’s performance.</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsWidgets truckId={truckId} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Fast links for common tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Link href="/owner/profile" className={cn(buttonVariants({ variant: "outline" }))}><span><Edit className="w-4 h-4 mr-1" />Edit Profile</span></Link>
                  <Link href="/owner/menu" className={cn(buttonVariants({ variant: "outline" }))}><span><MenuSquare className="w-4 h-4 mr-1" />Edit Menu</span></Link>
                  <Link href="/owner/schedule" className={cn(buttonVariants({ variant: "outline" }))}><span><CalendarClock className="w-4 h-4 mr-1" />Set Hours</span></Link>
                  <Link href="/owner/analytics" className={cn(buttonVariants({ variant: "outline" }))}><span><LineChart className="w-4 h-4 mr-1" />Full Analytics</span></Link>
                  <Link href="/owner/leaderboard" className={cn(buttonVariants({ variant: "outline" }))}><span><Trophy className="w-4 h-4 mr-1" />Leaderboard</span></Link>
                  <Button variant="secondary" onClick={handleShare}><Star className="w-4 h-4 mr-1" />Share on X</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center/Right: Preview, Calendar, Weather, Feedback, Map */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card className="border-dashed border-blue-300/80 bg-blue-50/60 shadow-none">
              <CardHeader>
                <CardTitle>
                  <Eye className="inline w-5 h-5 mr-2 text-primary" />
                  Customer Card Preview
                </CardTitle>
                <CardDescription>This is your live public-facing card.</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerTruckCard truck={truckData} menuItems={menuItems} />
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Latest Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerFeedback truckId={truckId} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Weather</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeatherWidget lat={truckData.lat} lng={truckData.lng} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Trucks Map</CardTitle>
                <CardDescription>See all active trucks on the map. Your truck is highlighted.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden min-h-[250px]">
                  <FoodTruckMap currentTruckId={truckId} highlightMyTruck />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PROFILE INCOMPLETE */}
        {dashboardDisabled && (
          <Alert variant="destructive" className="mb-6 mt-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Profile Incomplete</AlertTitle>
            <AlertDescription>
              Your truck profile is missing. Please&nbsp;
              <Link href="/owner/profile" className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto ml-1 text-destructive hover:underline")}>
                complete your profile
              </Link>
              &nbsp;before using dashboard features.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
