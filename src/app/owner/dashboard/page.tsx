'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import { Loader2, AlertTriangle, Edit, MenuSquare, CalendarClock, Eye, LineChart, CreditCard, LogIn, EyeIcon, MapPin, Globe2 } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserDocument, FoodTruck } from '@/lib/types';

import { OwnerSidebar } from '@/components/OwnerSidebar';
import '@/app/globals.css';

// ---- Safe helpers ----
function displayLocation(loc?: FoodTruck['currentLocation']) {
  if (!loc) return "No location set";
  if ('address' in loc && loc.address) return loc.address;
  if ('lat' in loc && 'lng' in loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    return `(${loc.lat}, ${loc.lng})`;
  }
  return "No location set";
}

function displayTodaysHours(hours: any) {
  // Support both string and object
  if (!hours) return "Not set";
  if (typeof hours === 'string') return hours;
  if (typeof hours === 'object' && ('open' in hours || 'close' in hours)) {
    return (hours.open && hours.close)
      ? `${hours.open}–${hours.close}`
      : "Not set";
  }
  return "Not set";
}

// ---- Customer Preview Card ----
function CustomerTruckCard({ truck }: { truck: Partial<FoodTruck> }) {
  return (
    <Card className="w-full border-primary border-2 bg-gradient-to-br from-white to-green-50 mb-2">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <MapPin className="text-primary w-5 h-5" />
          {truck.name || "Your Truck Name"}
        </CardTitle>
        <CardDescription>
          <span className="block">{truck.cuisine || "Cuisine Type"}</span>
          <span className="block">{truck.description || "About your truck..."}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex gap-4 items-center">
          <Label>Status:</Label>
          <span className={`font-bold ${truck.isOpen && truck.isVisible ? "text-green-700" : "text-red-600"}`}>
            {truck.isOpen && truck.isVisible ? "OPEN & VISIBLE" : "Closed/Hidden"}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Label>Location:</Label>
          <span>{displayLocation(truck.currentLocation)}</span>
        </div>
        <div className="flex gap-4 items-center">
          <Label>Today's Hours:</Label>
          <span>{displayTodaysHours(truck.todaysHours)}</span>
        </div>
        <div>
          <Label>Today's Menu:</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {Array.isArray(truck.todaysMenu) && truck.todaysMenu.length
              ? truck.todaysMenu.map((item: string, i: number) => (
                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{item}</span>
              ))
              : <span className="italic text-muted-foreground">No menu set for today</span>
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Main Dashboard ----
export default function OwnerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckData, setTruckData] = useState<Partial<FoodTruck> | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setTruckData(null);
      setError(null);

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
        router.push('/');
        setIsLoading(false); return;
      }
      const resolvedTruckId = userData.truckId || user.uid;
      setTruckId(resolvedTruckId);

      const truckDocRef = doc(db, "trucks", resolvedTruckId);
      const snap = await getDoc(truckDocRef);
      if (snap.exists()) {
        setTruckData(snap.data() as Partial<FoodTruck>);
      } else {
        setError("Truck profile not found.");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  // --- All updates through this helper (safe partial updates) ---
  const updateTruck = async (updates: Partial<FoodTruck>) => {
    if (!truckId) return;
    await updateDoc(doc(db, "trucks", truckId), updates);
    setTruckData(prev => ({ ...prev, ...updates }));
  };

  const dashboardDisabled = !truckData?.name;

  // --- Loading & Auth States ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-xl">Loading owner dashboard...</span>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
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
      <div className="flex flex-col items-center justify-center h-screen">
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

  // ---- UI START ----
  return (
    <div className="flex min-h-screen bg-background">
      <OwnerSidebar />

      <main className="flex-1 px-4 py-8 md:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Owner Dashboard</h1>
            <p className="text-muted-foreground">
              Manage {(truckData?.name || "your food truck")}'s presence and operations.
            </p>
          </div>
          {truckData && truckId && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-3 p-3 border rounded-lg shadow-sm bg-card">
              <Label htmlFor="truck-status-toggle" className={`text-sm font-medium ${truckData.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                Truck Status: {truckData.isOpen ? "Open" : "Closed"}
              </Label>
              <Switch
                id="truck-status-toggle"
                checked={!!truckData.isOpen}
                onCheckedChange={dashboardDisabled ? undefined : async (checked) => {
                  await updateTruck({ isOpen: checked });
                  toast({
                    title: "Status Updated",
                    description: `Your truck is now marked as ${checked ? "Open" : "Closed"}.`,
                  });
                }}
                aria-label={`Toggle truck status to ${truckData.isOpen ? "closed" : "open"}`}
                disabled={dashboardDisabled}
              />
            </div>
          )}
        </div>

        {/* --- LIVE PRESENCE TOOLS --- */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              <Globe2 className="inline w-6 h-6 mr-2 text-primary" />
              I'm Here! (Live Presence)
            </CardTitle>
            <CardDescription>
              Share your location, today's menu and hours. Let customers find and follow you!
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
                      locationSetAt: new Date(),
                    });
                    toast({ title: "Location Updated", description: "Customers will see your entered address now." });
                  }
                }}>
                Enter Address Manually
              </Button>
              {truckData?.currentLocation && (
                <span className="ml-4 text-sm">
                  Current: {displayLocation(truckData.currentLocation)}
                </span>
              )}
            </div>
            {/* HOURS */}
            <div className="mb-4 flex gap-2 items-center">
              <Label className="mr-2">Today's Hours:</Label>
              <input
                type="time"
                value={
                  typeof truckData?.todaysHours === 'object'
                    ? truckData.todaysHours?.open || ""
                    : ""
                }
                onChange={async e => {
                  const open = e.target.value;
                  let hours: any = typeof truckData?.todaysHours === 'object'
                    ? { ...truckData?.todaysHours }
                    : {};
                  hours.open = open;
                  await updateTruck({ todaysHours: hours });
                }}
                className="w-32 border rounded px-2 py-1"
              />
              <span>to</span>
              <input
                type="time"
                value={
                  typeof truckData?.todaysHours === 'object'
                    ? truckData.todaysHours?.close || ""
                    : ""
                }
                onChange={async e => {
                  const close = e.target.value;
                  let hours: any = typeof truckData?.todaysHours === 'object'
                    ? { ...truckData?.todaysHours }
                    : {};
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
              {truckData?.todaysMenu && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {truckData.todaysMenu.map((item: string, i: number) => (
                    <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{item}</span>
                  ))}
                </div>
              )}
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
                Show Me to Customers (Live on Map)
              </Label>
            </div>
          </CardContent>
        </Card>
        {/* END PRESENCE TOOLS */}

        {/* ---- CUSTOMER PREVIEW ---- */}
        <Card className="mb-8 border-dashed border-blue-300">
          <CardHeader>
            <CardTitle>
              <EyeIcon className="inline w-5 h-5 mr-2 text-primary" />
              Preview: What Customers See
            </CardTitle>
            <CardDescription>This is your live customer card.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerTruckCard truck={truckData} />
          </CardContent>
        </Card>

        {/* ---- INCOMPLETE PROFILE ALERT ---- */}
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

        {/* ---- DASHBOARD CARDS ---- */}
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
        </div>
      </main>
    </div>
  );
}

// ---- DashboardCard Component ----
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
    <Card className={`hover:shadow-lg transition-shadow flex flex-col ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
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
