
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Edit, Eye, MapPinIcon, MenuSquare, Power, LocateFixed, CalendarClock } from "lucide-react"; // Removed DollarSign, Settings
import { useToast } from "@/hooks/use-toast";

export default function OwnerDashboardPage() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const updateCurrentLocation = () => {
    if (!isClient || !navigator.geolocation) {
      toast({ 
          title: "Geolocation Error", 
          description: "Geolocation is not supported by your browser or not available. Please set location manually or try a different browser.", 
          variant: "destructive" 
      });
      // Fallback to mock location if real geolocation fails or is denied/unavailable
      const mockLat = 34.0522 + (Math.random() - 0.5) * 0.01;
      const mockLng = -118.2437 + (Math.random() - 0.5) * 0.01;
      const mockLocation = { lat: parseFloat(mockLat.toFixed(4)), lng: parseFloat(mockLng.toFixed(4)) };
      setCurrentLocation(mockLocation);
      toast({ 
        title: "Location Updated (Simulated)!", 
        description: `Using simulated location: ${mockLocation.lat}, ${mockLocation.lng}. Customers will see this.`,
        variant: "default"
      });
      return;
    }

    toast({ title: "Fetching Location...", description: "Attempting to get your current location." });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = { 
          lat: parseFloat(position.coords.latitude.toFixed(4)), 
          lng: parseFloat(position.coords.longitude.toFixed(4)) 
        };
        setCurrentLocation(newLocation);
        toast({ 
          title: "Location Updated!", 
          description: `Current location set to: ${newLocation.lat}, ${newLocation.lng}. Customers will see this location.` 
        });
        // Here, you would send `newLocation` to your backend.
      },
      (error) => {
          console.warn("Geolocation error:", error.message, "Falling back to mock location.");
          const mockLat = 34.0522 + (Math.random() - 0.5) * 0.01; // LA coordinates
          const mockLng = -118.2437 + (Math.random() - 0.5) * 0.01;
          const mockLocation = { lat: parseFloat(mockLat.toFixed(4)), lng: parseFloat(mockLng.toFixed(4)) };
          setCurrentLocation(mockLocation);
          toast({ 
            title: "Location Updated (Simulated)!", 
            description: `Could not get precise location. Using simulated location: ${mockLocation.lat}, ${mockLocation.lng}.`,
            variant: "default" // Consider 'warning' or custom variant if available
          });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
  
  const handleSetManualLocation = () => {
    toast({
        title: "Set Manual Location",
        description: "This feature would allow you to pinpoint your location on a map or enter an address. (Not implemented yet)"
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your food truck's presence and operations.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {/* This would ideally come from backend state */}
            <span className="text-sm font-medium text-green-600">Status: Open (Simulated)</span>
            <Button variant="outline" size="sm">
                <Power className="mr-2 h-4 w-4"/> Toggle Open/Closed
            </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MapPinIcon className="mr-2 h-5 w-5 text-primary" /> Location Management
            </CardTitle>
            <CardDescription>Share your current location with customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={updateCurrentLocation} className="w-full bg-primary hover:bg-primary/90">
              <LocateFixed className="mr-2 h-4 w-4" /> Update My Current Location
            </Button>
            <Button onClick={handleSetManualLocation} className="w-full" variant="outline">Set Location Manually</Button>
            {isClient && currentLocation && (
              <p className="text-sm text-green-600 text-center">
                Current Shared Location: {currentLocation.lat}, {currentLocation.lng}
              </p>
            )}
             {isClient && !currentLocation && (
              <p className="text-sm text-muted-foreground text-center">
                Share your location to appear on the map.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MenuSquare className="mr-2 h-5 w-5 text-primary" /> Manage Menu
            </CardTitle>
            <CardDescription>Update items, prices, and availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/menu">Edit Menu</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Eye className="mr-2 h-5 w-5 text-primary" /> View Live Orders
            </CardTitle>
            <CardDescription>Track incoming orders and update statuses.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button className="w-full" asChild>
              <Link href="/owner/orders">See Orders (Simulated 3 New)</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CalendarClock className="mr-2 h-5 w-5 text-primary" /> Schedule Hours
            </CardTitle>
            <CardDescription>Set your regular and special operating hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/schedule">Set Hours</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <LineChart className="mr-2 h-5 w-5 text-primary" /> View Analytics
            </CardTitle>
            <CardDescription>Track popular items, revenue, and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
             <Edit className="mr-2 h-5 w-5 text-primary" /> Truck Profile {/* Changed Icon to Edit, as Settings was removed */}
            </CardTitle>
            <CardDescription>Manage truck profile, photos, and description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/owner/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
