
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Star, DollarSign, ShoppingBag, Clock, Users, Utensils, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { UserDocument } from '@/lib/types';

// Define an interface for the analytics data structure
interface AnalyticsData {
  totalRevenue: number;
  popularItems: { name: string; orders: number }[];
  averageRating: number;
  totalOrders: number;
  peakHours: string;
  customerCount?: number; // Optional: if you track unique customers
}

export default function OwnerAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserDocument;
          if (userData.role === 'owner' && userData.truckId) {
            setTruckId(userData.truckId);
          } else if (userData.role === 'owner' && !userData.truckId) {
            // This owner might not have completed their truck profile setup yet
            // or the truckId is not directly on the user doc.
            setTruckId(user.uid); // Fallback: Assuming truckId is the same as owner's uid for 'trucks' collection
            setError("Truck ID not found on user profile, analytics might be incomplete. Please complete your truck profile.");
          } else {
            setError("Access Denied: You are not an authorized owner.");
            router.push('/login');
          }
        } else {
          setError("User profile not found.");
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);
  
  useEffect(() => {
    if (!currentUser || !truckId) {
      if (currentUser && !truckId && !error) { // only set loading false if we are sure truckId won't be set
         // This case means auth is loaded, but truckId is still missing without a specific error set by auth useEffect
      } else if (!currentUser) {
        setIsLoading(false); // Not logged in or auth still loading handled by redirect
      }
      return;
    }

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null); // Clear previous errors for this fetch attempt
      try {
        // In a real app, fetch from Firestore based on truckId
        // e.g., doc(db, "trucks", truckId, "analytics", "summary")
        // For now, simulating a delay and placeholder data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate some default data (replace with actual fetched data)
        setAnalyticsData({
            totalRevenue: 1250.75,
            popularItems: [
              { name: "Gourmet Burger", orders: 75 },
              { name: "Truffle Fries", orders: 60 },
              { name: "Craft Soda", orders: 90 },
            ],
            averageRating: 4.7,
            totalOrders: 150,
            peakHours: "12 PM - 2 PM",
            customerCount: 85,
        }); 
      } catch (err: any) {
         setError(err.message || 'An unknown error occurred while fetching analytics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentUser, truckId, error]); // Add error as dependency to re-evaluate if error state clears
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4"/>
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
         <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/owner/dashboard">Back to Dashboard</Link>
            </Button>
        </div>
      </div>
    );
  }
  
  if (!analyticsData) {
     return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4"/>
          <AlertTitle>No Analytics Data</AlertTitle>
          <AlertDescription>Analytics data could not be loaded or is not yet available for your truck.</AlertDescription>
        </Alert>
         <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/owner/dashboard">Back to Dashboard</Link>
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <LineChart className="mr-3 h-8 w-8" /> Performance Analytics
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (simulated)</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180 since last week (simulated)</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageRating.toFixed(1)}/5</div>
             <p className="text-xs text-muted-foreground">Based on 50 reviews (simulated)</p>
          </CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.peakHours}</div>
             <p className="text-xs text-muted-foreground">Most active time slot (simulated)</p>
          </CardContent>
        </Card>
        {analyticsData.customerCount !== undefined && (
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.customerCount}</div>
              <p className="text-xs text-muted-foreground">+12 this week (simulated)</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl flex items-center"><Utensils className="mr-2 h-5 w-5"/>Most Popular Items</CardTitle>
            <CardDescription>Top selling items by order count.</CardDescription>
            </CardHeader>
            <CardContent>
            {analyticsData.popularItems.length > 0 ? (
                <ul className="space-y-2">
                    {analyticsData.popularItems.map(item => (
                    <li key={item.name} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                        <span>{item.name}</span>
                        <span className="font-semibold text-primary">{item.orders} orders</span>
                    </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">No popular item data available yet. Start selling to see insights!</p>
            )}
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl">Sales Over Time</CardTitle>
            <CardDescription>Visual representation of your sales trends (placeholder).</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-[250px] w-full bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground border border-dashed">
                Chart will be displayed here soon!
            </div>
            <p className="text-xs text-muted-foreground mt-2">This section will feature charts showing revenue, order volume, etc., helping you understand your business performance over selected periods.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
