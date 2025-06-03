
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Star, DollarSign, ShoppingBag, Clock, Users, Utensils, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define an interface for the analytics data structure
interface AnalyticsData {
  totalRevenue: number;
  popularItems: { name: string; orders: number }[];
  averageRating: number;
  totalOrders: number;
  peakHours: string;
  // Add other fields as needed, e.g., customerCount: number;
}

export default function OwnerAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, fetch from '/api/owner/analytics' (requires auth)
        // For now, simulating a delay and an empty/default response
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simulate some default data or an error if backend is not ready
        setAnalyticsData({
            totalRevenue: 0,
            popularItems: [],
            averageRating: 0,
            totalOrders: 0,
            peakHours: "N/A",
        }); 
      } catch (err) {
         if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);
  
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
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>{error}. Please ensure you are logged in and try again.</AlertDescription>
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
          <AlertTitle>No Analytics Data</AlertTitle>
          <AlertDescription>Analytics data could not be loaded or is not yet available.</AlertDescription>
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
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalRevenue.toFixed(2)}</div>
            {/* <p className="text-xs text-muted-foreground">+20.1% from last month (simulated)</p> */}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            {/* <p className="text-xs text-muted-foreground">+150 since last week (simulated)</p> */}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageRating.toFixed(1)}/5</div>
             {/* <p className="text-xs text-muted-foreground">Based on 50 reviews (simulated)</p> */}
          </CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.peakHours}</div>
             {/* <p className="text-xs text-muted-foreground">Most active time slot (simulated)</p> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl flex items-center"><Utensils className="mr-2 h-5 w-5"/>Most Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
            {analyticsData.popularItems.length > 0 ? (
                <ul className="space-y-2">
                    {analyticsData.popularItems.map(item => (
                    <li key={item.name} className="flex justify-between text-sm p-2 bg-muted/30 rounded-md">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.orders} orders</span>
                    </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">No popular item data available yet.</p>
            )}
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl">Sales Over Time</CardTitle>
            <CardDescription>Visual representation of sales trends.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Chart will be displayed here (Requires Charting Library & Data)
            </div>
            <p className="text-xs text-muted-foreground mt-2">This section will feature charts showing revenue, order volume, etc.</p>
            </CardContent>
        </Card>
      </div>
      {/*
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Further Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More detailed reports on customer demographics, item performance, and peak times will be available here.
          </p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
