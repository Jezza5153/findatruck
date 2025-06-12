'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Loader2, AlertTriangle, Edit, MenuSquare, CalendarClock, Eye, LineChart, CreditCard, LogIn, Trophy, Home, CheckCircle2, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import type { UserDocument, FoodTruck, MenuItem } from '@/lib/types';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

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
    <div className="flex flex-wrap gap-4 mb-6 mt-2">
      <div className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-green-50 text-green-800 font-bold">
        <CheckCircle2 className="w-4 h-4" /> Orders: {orders}
      </div>
      <div className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-yellow-50 text-yellow-800 font-bold">
        <CreditCard className="w-4 h-4" /> Sales: ${sales.toFixed(2)}
      </div>
      {topItem && (
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-blue-50 text-blue-800 font-bold">
          <Star className="w-4 h-4" /> Top Item: {topItem}
        </div>
      )}
    </div>
  );
}

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

  const updateTruck = useCallback(async (updates: Partial<FoodTruck>) => {
    if (!truckId) return;
    const sanitizedUpdates: Partial<FoodTruck> = { ...updates };
    if ('lat' in sanitizedUpdates && sanitizedUpdates.lat === null) delete sanitizedUpdates.lat;
    if ('lng' in sanitizedUpdates && sanitizedUpdates.lng === null) delete sanitizedUpdates.lng;
    await updateDoc(doc(db, "trucks", truckId), sanitizedUpdates);
    setTruckData(prev => ({ ...prev, ...sanitizedUpdates }));
  }, [truckId]);

  const dashboardDisabled = !truckData?.name;

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* --- SIDEBAR (Collapsible, real, mobile responsive) --- */}
        <Sidebar collapsible="offcanvas" variant="sidebar" side="left">
          <SidebarHeader className="flex items-center justify-between px-4 py-2">
            <span className="font-bold text-xl tracking-tight">🍔 FoodieTruck</span>
            <SidebarTrigger className="ml-auto" />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/dashboard"><Home className="w-4 h-4 mr-2" /> Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/profile"><Edit className="w-4 h-4 mr-2" /> Profile</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/menu"><MenuSquare className="w-4 h-4 mr-2" /> Menu</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/schedule"><CalendarClock className="w-4 h-4 mr-2" /> Hours</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/orders"><Eye className="w-4 h-4 mr-2" /> Orders</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/analytics"><LineChart className="w-4 h-4 mr-2" /> Analytics</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/billing"><CreditCard className="w-4 h-4 mr-2" /> Billing</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/owner/leaderboard"><Trophy className="w-4 h-4 mr-2" /> Leaderboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* --- MAIN DASHBOARD AREA --- */}
        <SidebarInset>
          <main className="flex-1 px-4 py-8 md:px-10 max-w-[1200px] mx-auto w-full">
            {/* --- Analytics (discreet row) --- */}
            <AnalyticsWidgets truckId={truckId} />

            {/* --- Owner Dashboard Header & Truck Status --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
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

            {/* --- Dashboard Cards (as before) --- */}
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
