'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { User, ShoppingBag, Heart, Bell, Edit3, Save, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// You may want to refine your type imports for better typing
import type { NotificationPreferences } from '@/lib/types';

// Initial User Profile State for a new user or guest
interface UserProfile {
  name: string;
  email: string;
  savedPaymentMethods: string[]; // Placeholder
  favoriteTrucks: string[]; // Array of truck IDs
  notificationPreferences: NotificationPreferences;
}

const initialUserProfileState: UserProfile = {
  name: 'Guest User',
  email: '',
  savedPaymentMethods: [],
  favoriteTrucks: [],
  notificationPreferences: {
    truckNearbyRadius: 2,
    orderUpdates: true,
    promotionalMessages: false,
  },
};

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(initialUserProfileState);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(initialUserProfileState);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { toast } = useToast();

  // Fetch user and Firestore profile on login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setIsLoadingProfile(true);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Defensive fallback for new fields
            const fetchedProfile: UserProfile = {
              ...initialUserProfileState,
              name: data.ownerName || data.name || user.displayName || "User",
              email: data.email || user.email || "",
              savedPaymentMethods: data.savedPaymentMethods || [],
              favoriteTrucks: data.favoriteTrucks || [],
              notificationPreferences: data.notificationPreferences || initialUserProfileState.notificationPreferences,
            };
            setProfile(fetchedProfile);
            setTempProfile(fetchedProfile);
          } else {
            // No profile doc found, initialize with default
            const newProfile: UserProfile = {
              ...initialUserProfileState,
              name: user.displayName || "User",
              email: user.email || "",
            };
            setProfile(newProfile);
            setTempProfile(newProfile);
            // Save default profile to Firestore
            await setDoc(doc(db, "users", user.uid), newProfile, { merge: true });
          }
        } catch (err) {
          toast({
            title: "Profile Load Error",
            description: "Could not fetch your profile data. Please reload.",
            variant: "destructive",
          });
        }
        setIsLoadingProfile(false);
      } else {
        setProfile(initialUserProfileState);
        setTempProfile(initialUserProfileState);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTempProfile(profile);
  }, [profile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean | number) => {
    setTempProfile(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value,
      },
    }));
  };

  const saveProfile = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in or sign up to save your profile changes.",
        variant: "destructive",
        action: <Button asChild variant="outline" size="sm"><Link href="/login">Login / Sign Up</Link></Button>,
      });
      setIsEditingProfile(false);
      setTempProfile(profile);
      return;
    }
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        name: tempProfile.name,
        // Add any other editable fields here
      });
      setProfile(prev => ({
        ...prev,
        name: tempProfile.name,
      }));
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save profile changes.",
        variant: "destructive",
      });
    }
  };

  const saveNotificationPreferences = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in or sign up to save notification preferences.",
        variant: "destructive",
        action: <Button asChild variant="outline" size="sm"><Link href="/login">Login / Sign Up</Link></Button>,
      });
      return;
    }
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        notificationPreferences: tempProfile.notificationPreferences,
      });
      setProfile(prev => ({
        ...prev,
        notificationPreferences: tempProfile.notificationPreferences,
      }));
      toast({
        title: "Preferences Updated",
        description: "Notification settings saved.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save notification preferences.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingAuth || isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in to view your dashboard.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Login / Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">My Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <Card className="lg:col-span-1 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="mr-2 h-6 w-6 text-primary" /> Profile Information
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                {isEditingProfile ? <Save className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
              </Button>
            </CardTitle>
            <CardDescription>
              Manage your personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={isEditingProfile ? tempProfile.name : profile.name}
                readOnly={!isEditingProfile}
                onChange={handleProfileChange}
                className={!isEditingProfile ? "border-none px-0 bg-transparent" : ""}
                placeholder="Your Name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                readOnly
                className="border-none px-0 bg-transparent"
                placeholder="your.email@example.com"
              />
            </div>
            {isEditingProfile && (
              <Button onClick={saveProfile} className="w-full">Save Profile Changes</Button>
            )}
            <div>
              <p className="text-sm font-medium">Saved Payment Methods:</p>
              {profile.savedPaymentMethods?.length ? (
                profile.savedPaymentMethods.map(method => <p key={method} className="text-sm text-muted-foreground">{method}</p>)
              ) : (
                <p className="text-sm text-muted-foreground">
                  No saved payment methods. Add one for faster checkout!
                </p>
              )}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => {
                  toast({ title: "Coming Soon!", description: "Payment management will be available here." });
                }}
              >
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-6 w-6 text-primary" /> Notification Preferences
            </CardTitle>
            <CardDescription>
              Customize how you receive updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="truckNearbyRadius" className="text-sm font-medium">
                Notify when a favorite truck is within: {tempProfile.notificationPreferences.truckNearbyRadius} miles
              </Label>
              <Slider
                id="truckNearbyRadius"
                min={1}
                max={10}
                step={1}
                value={[tempProfile.notificationPreferences.truckNearbyRadius]}
                onValueChange={(value) => handleNotificationChange('truckNearbyRadius', value[0])}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="orderUpdates" className="text-sm font-medium">Order Updates</Label>
              <Switch
                id="orderUpdates"
                checked={tempProfile.notificationPreferences.orderUpdates}
                onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="promotionalMessages" className="text-sm font-medium">Promotional Messages</Label>
              <Switch
                id="promotionalMessages"
                checked={tempProfile.notificationPreferences.promotionalMessages}
                onCheckedChange={(checked) => handleNotificationChange('promotionalMessages', checked)}
              />
            </div>
            <Button onClick={saveNotificationPreferences} className="w-full">Save Notification Preferences</Button>
          </CardContent>
        </Card>

        {/* Past Orders Placeholder */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingBag className="mr-2 h-6 w-6 text-primary" /> Past Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace this with a real Firestore orders query */}
            <p className="text-muted-foreground">Your past orders will appear here.</p>
            <div className="mt-4 p-3 border rounded-md text-center">
              <p className="text-sm text-muted-foreground">No orders found yet.</p>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Trucks Placeholder */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Heart className="mr-2 h-6 w-6 text-primary" /> Favorite Trucks</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace this with a Firestore subcollection or lookup */}
            {profile.favoriteTrucks?.length ? (
              profile.favoriteTrucks.map(truckId => (
                <div key={truckId} className="mt-4 p-3 border rounded-md">
                  <p className="font-semibold">Truck ID: {truckId} (Details coming soon)</p>
                  <Button variant="link" className="p-0 h-auto text-destructive">Remove</Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No favorite trucks yet. Start exploring and add some!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
