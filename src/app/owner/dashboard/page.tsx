'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, AlertTriangle, Edit, MenuSquare, CalendarClock, Eye, LineChart, CreditCard, LogIn, EyeIcon, MapPin, Globe2, CheckCircle2, XCircle, Info, Star, Trophy, Moon, Sun, ArrowLeftRight, UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import type { UserDocument, FoodTruck, MenuItem } from '@/lib/types';
import { OwnerSidebar } from '@/components/OwnerSidebar';
import NextImage from "next/image";
import { motion } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import axios from 'axios';

// ------------- Theme Toggle -------------
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

// ----------- Status Pill --------------
function StatusPill({ open, visible }: { open?: boolean; visible?: boolean }) {
  if (!open) return (
    <motion.span
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-red-100 text-red-700"
    ><XCircle className="w-4 h-4 mr-1" /> Closed</motion.span>
  );
  if (!visible) return (
    <motion.span
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800"
    ><Info className="w-4 h-4 mr-1" /> Hidden</motion.span>
  );
  return (
    <motion.span
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-green-100 text-green-800"
    ><CheckCircle2 className="w-4 h-4 mr-1" /> Open & Visible</motion.span>
  );
}

// ----------- Weather Widget -----------
function WeatherWidget({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const [forecast, setForecast] = useState<any>(null);
  useEffect(() => {
    if (typeof lat !== "number" || typeof lng !== "number") return;
    (async () => {
      try {
        const res = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation_probability,temperature_2m&forecast_days=1`
        );
        setForecast(res.data);
      } catch {}
    })();
  }, [lat, lng]);
  if (!forecast) return null;
  const rainChance = forecast?.hourly?.precipitation_probability?.[0] || 0;
  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded mt-2">
      <span>Weather: {rainChance > 30 ? "Rainy ☔️" : "Clear ☀️"}</span>
      <span>Temp: {forecast?.hourly?.temperature_2m?.[0]}°C</span>
    </div>
  );
}

// ------------- Customer Feedback --------------
function CustomerFeedback({ truckId }: { truckId?: string | null }) {
  const [feedback, setFeedback] = useState<any[]>([]);
  useEffect(() => {
    if (!truckId) return;
    getDocs(collection(db, "trucks", truckId, "reviews")).then(snap => {
      setFeedback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, 3));
    });
  }, [truckId]);
  if (!feedback.length) return null;
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2 text-lg">Latest Customer Reviews</h3>
      <div className="space-y-2">
        {feedback.map(f => (
          <div key={f.id} className="p-3 bg-card border rounded shadow flex items-center">
            <Star className="text-yellow-400 w-4 h-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">{f.author || "Anonymous"}</div>
              <div className="text-sm text-muted-foreground">{f.text}</div>
            </div>
            <span className="text-xs text-muted-foreground">{f.createdAt?.toDate?.().toLocaleDateString() ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------- Analytics Widgets ------------
function AnalyticsWidgets({ truckId }: { truckId?: string | null }) {
  const [orders, setOrders] = useState(0);
  const [sales, setSales] = useState(0);
  const [topItem, setTopItem] = useState("");
  useEffect(() => {
    if (!truckId) return;
    getDocs(collection(db, "trucks", truckId, "orders")).then(snap => {
      setOrders(snap.size);
      let sum = 0, items: Record<string, number> = {};
      snap.docs.forEach(doc => {
        const o = doc.data();
        sum += o.total || 0;
        (o.items || []).forEach((item: any) => { items[item.name] = (items[item.name] || 0) + 1; });
      });
      setSales(sum);
      setTopItem(Object.keys(items).sort((a, b) => items[b] - items[a])[0] || "");
    });
  }, [truckId]);
  return (
    <div className="flex gap-4 mb-4 mt-28 md:mt-0">
      <div className="p-3 bg-green-50 rounded font-bold">Orders: {orders}</div>
      <div className="p-3 bg-yellow-50 rounded font-bold">Sales: ${sales.toFixed(2)}</div>
      {topItem && <div className="p-3 bg-blue-50 rounded font-bold">Top Item: {topItem}</div>}
    </div>
  );
}

// ----------- Real Time Alerts -------------
function RealTimeAlert({ alerts }: { alerts: any[] }) {
  if (!alerts?.length) return null;
  return (
    <div className="mb-4">
      {alerts.map(a => (
        <Alert key={a.id} variant={a.type}>
          <AlertTitle>{a.title}</AlertTitle>
          <AlertDescription>{a.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

// ----------- Format AM/PM -------------
function formatAMPM(time: string = '') {
  if (!time.includes(':')) return time;
  let [hour, min] = time.split(':');
  let h = parseInt(hour, 10);
  let ampm = h >= 12 ? 'pm' : 'am';
  let h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12.toString().padStart(2, '0')}:${min} ${ampm}`;
}

// ----------- Setup Progress ------------
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

// ----------- Customer Card Preview ------------
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
                ? `${formatAMPM(truck.todaysHours.open)} – ${formatAMPM(truck.todaysHours.close)}`
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

// ----------- Quick Actions Sidebar ------------
function QuickActionsSidebar({ truckData, updateTruck, router, dashboardDisabled }: any) {
  return (
    <aside className="hidden md:flex flex-col gap-2 px-2 py-6 min-w-[170px] bg-card/90 border-r border-primary/10 shadow-lg z-30 mt-4 rounded-xl ml-2">
      <span className="text-xs uppercase text-muted-foreground mb-2 tracking-wide font-semibold pl-2">
        Quick Actions
      </span>
      <Button
        onClick={() => router.push('/owner/menu')}
        size="sm"
        variant="outline"
        className="justify-start"
        icon={<MenuSquare className="mr-2 w-4 h-4" />}
        disabled={dashboardDisabled}
      >New Menu</Button>
      <Button
        onClick={() => updateTruck({ isOpen: !truckData.isOpen })}
        size="sm"
        variant={truckData.isOpen ? "destructive" : "secondary"}
        className="justify-start"
        icon={<ArrowLeftRight className="mr-2 w-4 h-4" />}
        disabled={dashboardDisabled}
      >{truckData.isOpen ? "Close Truck" : "Open Truck"}</Button>
      <Button
        onClick={() => router.push('/owner/orders')}
        size="sm"
        variant="outline"
        className="justify-start"
        icon={<Eye className="mr-2 w-4 h-4" />}
        disabled={dashboardDisabled}
      >Orders</Button>
      <Button
        onClick={() => router.push('/owner/schedule')}
        size="sm"
        variant="outline"
        className="justify-start"
        icon={<CalendarClock className="mr-2 w-4 h-4" />}
        disabled={dashboardDisabled}
      >Edit Hours</Button>
      <Button
        onClick={() => router.push('/owner/leaderboard')}
        size="sm"
        variant="outline"
        className="justify-start"
        icon={<Trophy className="mr-2 w-4 h-4 text-yellow-400" />}
      >Leaderboard</Button>
    </aside>
  );
}

// ----------- Dashboard Card ------------
interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  buttonText: string;
  disabled?: boolean;
}
function DashboardCard({ title, description, link, icon, buttonText, disabled }: DashboardCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-all flex flex-col border-primary/10 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold gap-2">
          <span className="mr-2 h-6 w-6">{icon}</span> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <div className="flex-grow" />
      <CardContent className="pt-0">
        <Button className="w-full" asChild disabled={disabled}>
          <Link href={disabled ? "#" : link}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------- Main Dashboard Page ------------
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

  // Hotkeys
  useHotkeys('n', () => router.push('/owner/menu'), [router]);
  useHotkeys('o', () => updateTruck && truckData && updateTruck({ isOpen: !truckData.isOpen }), [truckData]);
  useHotkeys('s', () => router.push('/owner/schedule'), [router]);
  useHotkeys('l', () => router.push('/owner/leaderboard'), [router]);

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
      {/* OWNER MAIN NAVIGATION SIDEBAR */}
      <OwnerSidebar />

      {/* QUICK ACTIONS SIDEBAR */}
      <QuickActionsSidebar
        truckData={truckData}
        updateTruck={updateTruck}
        router={router}
        dashboardDisabled={dashboardDisabled}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 py-8 md:px-8 relative">

        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-40">
          <ThemeToggle />
        </div>

        {/* Stats Floater */}
        <motion.div
          className="fixed left-1/2 transform -translate-x-1/2 top-4 z-40 bg-white/90 border shadow-xl rounded-2xl flex gap-8 px-8 py-4"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center">
            <MapPin className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl">5</span>
            <span className="text-xs text-muted-foreground font-semibold">Total Trucks</span>
          </div>
          <div className="border-l h-8 my-auto" />
          <div className="flex flex-col items-center">
            <UserPlus className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl">8</span>
            <span className="text-xs text-muted-foreground font-semibold">Registered Users</span>
          </div>
          <div className="border-l h-8 my-auto" />
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <span className="font-bold text-xl">4</span>
            <span className="text-xs text-muted-foreground font-semibold">Open Now</span>
          </div>
        </motion.div>

        {/* Analytics Mini-Widgets */}
        <AnalyticsWidgets truckId={truckId} />

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-3 mt-20">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary drop-shadow-sm">Owner Dashboard</h1>
            <p className="text-muted-foreground font-medium">
              Manage <span className="font-semibold">{truckData?.name || "your food truck"}</span>'s presence and operations.
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

        {/* Real-Time Alerts */}
        <RealTimeAlert alerts={alerts} />

        {/* PRESENCE TOOLS */}
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
            {/* Weather Widget */}
            <WeatherWidget lat={truckData.lat} lng={truckData.lng} />
            {/* One-Click Social Share */}
            <div className="mt-4">
              <Button variant="outline" onClick={handleShare}>Share Today’s Location (X/Twitter)</Button>
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER FEEDBACK */}
        <CustomerFeedback truckId={truckId} />

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

        {/* PROFILE INCOMPLETE */}
        {dashboardDisabled && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Profile Incomplete</AlertTitle>
            <AlertDescription>
              Your truck profile is missing. Please&nbsp;
              <Button asChild variant="link" className="p-0 h-auto ml-1 text-destructive hover:underline">
                <Link href="/owner/profile">complete your profile</Link>
              </Button>
              &nbsp;before using dashboard features.
            </AlertDescription>
          </Alert>
        )}

        {/* DASHBOARD NAV CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Truck Profile"
            description="Manage name, cuisine, photos, and description."
            link="/owner/profile"
            icon={<Edit className="text-primary" />}
            buttonText="Edit Profile"
            disabled={dashboardDisabled}
          />
          <DashboardCard
            title="Manage Menu"
            description="Update items, prices, categories, and availability."
            link="/owner/menu"
            icon={<MenuSquare className="text-primary" />}
            buttonText="Edit Menu"
            disabled={dashboardDisabled}
          />
          <DashboardCard
            title="Set Schedule"
            description="Define your regular and special operating hours."
            link="/owner/schedule"
            icon={<CalendarClock className="text-primary" />}
            buttonText="Set Hours"
            disabled={dashboardDisabled}
          />
          <DashboardCard
            title="View Live Orders"
            description="Track incoming orders and update their statuses."
            link="/owner/orders"
            icon={<Eye className="text-primary" />}
            buttonText="See Orders"
            disabled={dashboardDisabled}
          />
          <DashboardCard
            title="Performance Analytics"
            description="Track sales, popular items, revenue, and ratings."
            link="/owner/analytics"
            icon={<LineChart className="text-primary" />}
            buttonText="View Analytics"
            disabled={dashboardDisabled}
          />
          <DashboardCard
            title="Billing & Subscription"
            description="Manage premium features, payments, and invoices."
            link="/owner/billing"
            icon={<CreditCard className="text-primary" />}
            buttonText="Manage Billing"
            disabled={dashboardDisabled}
          />
          <DashboardCard
            title="Top Trucks Leaderboard"
            description="See who's trending near you."
            link="/owner/leaderboard"
            icon={<Trophy className="text-yellow-400" />}
            buttonText="View Leaderboard"
            disabled={false}
          />
        </div>
      </main>
    </div>
  );
}
