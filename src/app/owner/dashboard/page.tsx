
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Edit, Eye, MapPinIcon, MenuSquare, DollarSign, Settings, Power, LocateFixed, Router } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Added useToast

export default function OwnerDashboardPage() {
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleLiveTracking = () => {
    if (!isClient) return;

    if (isLiveTracking) {
      setIsLiveTracking(false);
      setLiveLocation(null);
      // In a real app, you'd stop watching position (e.g., clear watchId from navigator.geolocation.watchPosition)
      // and notify the backend that live tracking has stopped.
      toast({ title: "Live Tracking Stopped", description: "Your location is no longer being shared live." });
    } else {
      if (navigator.geolocation) {
        setIsLiveTracking(true);
        toast({ title: "Starting Live Tracking...", description: "Attempting to get your location. This is a simulation." });
        // Simulate getting location and sending updates
        // In a real app, you'd use navigator.geolocation.watchPosition to get continuous updates
        // and send them to your backend service.
        setTimeout(() => {
          // Mock location for simulation
          const mockLat = 34.0522 + (Math.random() - 0.5) * 0.01;
          const mockLng = -118.2437 + (Math.random() - 0.5) * 0.01;
          const newLocation = { lat: parseFloat(mockLat.toFixed(4)), lng: parseFloat(mockLng.toFixed(4)) };
          setLiveLocation(newLocation);
          toast({ 
            title: "Live Tracking Active!", 
            description: `Simulated location: ${newLocation.lat}, ${newLocation.lng}. In a real app, this would update continuously.` 
          });
          // Here, you would send `newLocation` to your backend.
        }, 2000);
      } else {
        toast({ 
            title: "Geolocation Error", 
            description: "Geolocation is not supported by your browser or permission was denied.", 
            variant: "destructive" 
        });
      }
    }
  };
  
  // Placeholder for manual location set function
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
            <span className="text-sm font-medium text-green-600">Status: Open</span>
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
            <CardDescription>Manually set location or enable live GPS tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleSetManualLocation} className="w-full" variant="outline">Set Location Manually</Button>
            <Button onClick={toggleLiveTracking} className="w-full bg-primary hover:bg-primary/90">
              {isLiveTracking ? <Router className="mr-2 h-4 w-4 animate-pulse" /> : <LocateFixed className="mr-2 h-4 w-4" />}
              {isLiveTracking ? "Stop Live Tracking" : "Start Live Tracking"}
            </Button>
            {isClient && isLiveTracking && liveLocation && (
              <p className="text-sm text-green-600 text-center">
                Live Tracking Active: {liveLocation.lat}, {liveLocation.lng}
              </p>
            )}
             {isClient && isLiveTracking && !liveLocation && (
              <p className="text-sm text-orange-500 text-center">
                Live Tracking: Acquiring location...
              </p>
            )}
            {isClient && !isLiveTracking && (
              <p className="text-sm text-muted-foreground text-center">
                Live Tracking: Inactive
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
            <Button className="w-full">Edit Menu</Button>
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
            <Button className="w-full">See Orders (3 New)</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Edit className="mr-2 h-5 w-5 text-primary" /> Schedule Hours
            </CardTitle>
            <CardDescription>Set your regular and special operating hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Set Hours</Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChart className="mr-2 h-5 w-5 text-primary" /> View Analytics
            </CardTitle>
            <CardDescription>Track popular items, revenue, and ratings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">View Analytics</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Settings className="mr-2 h-5 w-5 text-primary" /> Truck Settings
            </CardTitle>
            <CardDescription>Manage truck profile, photos, and description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
