'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Edit, MenuSquare, CalendarClock, Eye, LineChart, CreditCard, LogIn } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { UserDocument, FoodTruck } from '@/lib/types';

import { OwnerSidebar } from '@/components/OwnerSidebar'; // <-- You'll need this component!
import '@/app/globals.css'; // Import your global styles once (usually in layout.tsx)

export default function OwnerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckData, setTruckData] = useState<Partial<FoodTruck> | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Load user and truck data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
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

        // Fetch truck data
        const truckDocRef = doc(db, "trucks", resolvedTruckId);
        const truckDocSnap = await getDoc(truckDocRef);
        if (truckDocSnap.exists()) {
          setTruckData(truckDocSnap.data() as Partial<FoodTruck>);
        } else {
          setError("Truck profile not found. Please complete your profile.");
          setTruckData({ name: "Your Truck (Setup Incomplete)", isOpen: false });
        }
      } else {
        router.push('/login?redirect=/owner/dashboard');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  // Toggle open/closed status
  const handleToggleOpenClosed = async (isOpen: boolean) => {
    if (!currentUser || !truckId) {
      toast({ title: "Error", description: "Cannot update status. Not logged in or truck ID missing.", variant: "destructive" });
      return;
    }
    try {
      const truckDocRef = doc(db, "trucks", truckId);
      await updateDoc(truckDocRef, { isOpen });
      setTruckData(prev => ({ ...prev, isOpen }));
      toast({
        title: "Status Updated",
        description: `Your truck is now marked as ${isOpen ? "Open" : "Closed"}.`,
      });
    } catch (err: any) {
      toast({ title: "Error Updating Status", description: err.message || "Could not update truck status.", variant: "destructive" });
    }
  };

  // LOADING
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-xl">Loading owner dashboard...</span>
      </div>
    );
  }

  // NOT LOGGED IN (extra guard)
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

  // SHOW ERRORS (not for incomplete setup, which is handled below)
  if (error && !truckData?.name?.includes("Setup Incomplete")) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dashboard Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        {error.includes("profile not found") && (
          <Button asChild className="mt-4">
            <Link href="/owner/profile">Complete Your Profile</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* --- Sidebar --- */}
      <OwnerSidebar active="dashboard" />

      {/* --- Main Content --- */}
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage {truckData?.name || "your food truck"}'s presence and operations.</p>
          </div>
          {truckData && truckId && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-3 p-3 border rounded-lg shadow-sm bg-card">
              <Label htmlFor="truck-status-toggle" className={`text-sm font-medium ${truckData.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                Truck Status: {truckData.isOpen ? "Open" : "Closed"}
              </Label>
              <Switch
                id="truck-status-toggle"
                checked={!!truckData.isOpen}
                onCheckedChange={handleToggleOpenClosed}
                aria-label={`Toggle truck status to ${truckData.isOpen ? "closed" : "open"}`}
              />
            </div>
          )}
        </div>

        {error && truckData?.name?.includes("Setup Incomplete") && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Profile Incomplete</AlertTitle>
            <AlertDescription>
              {error} Some dashboard features may be limited.
              <Button asChild variant="link" className="p-0 h-auto ml-1 text-destructive hover:underline">
                <Link href="/owner/profile">Go to Profile Setup</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Truck Profile"
            description="Manage name, cuisine, photos, and description."
            link="/owner/profile"
            icon={<Edit className="text-primary" />}
            buttonText="Edit Profile"
          />
          <DashboardCard
            title="Manage Menu"
            description="Update items, prices, categories, and availability."
            link="/owner/menu"
            icon={<MenuSquare className="text-primary" />}
            buttonText="Edit Menu"
          />
          <DashboardCard
            title="Set Schedule"
            description="Define your regular and special operating hours."
            link="/owner/schedule"
            icon={<CalendarClock className="text-primary" />}
            buttonText="Set Hours"
          />
          <DashboardCard
            title="View Live Orders"
            description="Track incoming orders and update their statuses."
            link="/owner/orders"
            icon={<Eye className="text-primary" />}
            buttonText="See Orders"
          />
          <DashboardCard
            title="Performance Analytics"
            description="Track sales, popular items, revenue, and ratings."
            link="/owner/analytics"
            icon={<LineChart className="text-primary" />}
            buttonText="View Analytics"
          />
          <DashboardCard
            title="Billing & Subscription"
            description="Manage premium features, payments, and invoices."
            link="/owner/billing"
            icon={<CreditCard className="text-primary" />}
            buttonText="Manage Billing"
          />
        </div>
      </main>
    </div>
  );
}

// --- Card for dashboard quick nav ---
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
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <span className="mr-2 h-6 w-6">{icon}</span> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow" />
      <CardContent className="pt-0">
        <Button className="w-full" asChild disabled={disabled}>
          <Link href={disabled ? "#" : link}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
