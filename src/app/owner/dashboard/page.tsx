'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
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

import { OwnerSidebar } from '@/components/OwnerSidebar';
import '@/app/globals.css';

export default function OwnerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckData, setTruckData] = useState<Partial<FoodTruck> | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchingTruck, setFetchingTruck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch and re-fetch truck doc, retry if missing after signup.
  const fetchTruckData = useCallback(async (uid: string, allowRetry = true) => {
    setFetchingTruck(true);
    const truckDocRef = doc(db, "trucks", uid);
    for (let i = 0; i < (allowRetry ? 10 : 1); i++) {
      const snap = await getDoc(truckDocRef);
      if (snap.exists()) {
        setTruckData(snap.data() as Partial<FoodTruck>);
        setFetchingTruck(false);
        setError(null);
        return true;
      }
      await new Promise(res => setTimeout(res, 700 + i * 150));
    }
    setFetchingTruck(false);
    setTruckData(null);
    setError("Your truck profile is still being set up in the background. Most dashboard actions will be unavailable until this completes.");
    return false;
  }, []);

  // Load user + truck data (with robust truck retry)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setError(null);
      setTruckData(null);

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

      // Fetch truck doc, retry in case signup created it in background
      await fetchTruckData(resolvedTruckId, true);

      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast, fetchTruckData]);

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

  // If just loading (first load or user switch)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-xl">Loading owner dashboard...</span>
      </div>
    );
  }

  // Not logged in guard
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

  // Show if truck setup is still pending (from signup background process)
  if (fetchingTruck || (!truckData && error)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <div className="text-lg font-medium">Setting up your truck profile...</div>
        <div className="text-muted-foreground mt-2 mb-6">This can take 10–20 seconds after signup. <br />You can refresh this page.</div>
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Truck Not Ready</AlertTitle>
          <AlertDescription>
            {error}
            <Button variant="link" className="ml-2 p-0 h-auto" onClick={() => { setTruckData(null); setError(null); setIsLoading(true); fetchTruckData(truckId!, true).then(()=>setIsLoading(false)); }}>
              Retry Now
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Robust fallback if truckData exists but is missing essentials
  const dashboardDisabled = !truckData?.name; // Only check .name

  return (
    <div className="flex min-h-screen bg-background">
      <OwnerSidebar />

      <main className="flex-1 px-4 py-8 md:px-8">
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
                onCheckedChange={dashboardDisabled ? undefined : handleToggleOpenClosed}
                aria-label={`Toggle truck status to ${truckData.isOpen ? "closed" : "open"}`}
                disabled={dashboardDisabled}
              />
            </div>
          )}
        </div>

        {/* Incomplete profile alert */}
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

// --- DashboardCard ---
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
      <CardContent className="flex-grow" />
      <CardContent className="pt-0">
        <Button className="w-full" asChild disabled={disabled}>
          <Link href={disabled ? "#" : link}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
