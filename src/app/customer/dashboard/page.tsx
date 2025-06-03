
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
import type { UserProfile, NotificationPreferences } from '@/lib/types';

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

export default function CustomerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(initialUserProfileState);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(initialUserProfileState);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setIsLoadingProfile(true);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const fetchedProfile: UserProfile = {
              ...initialUserProfileState,
              name: data.name || user.displayName || "User",
              email: data.email || user.email || "",
              savedPaymentMethods: data.savedPaymentMethods || [],
              favoriteTrucks: data.favoriteTrucks || [],
              notificationPreferences: data.notificationPreferences || initialUserProfileState.notificationPreferences,
            };
            setProfile(fetchedProfile);
            setTempProfile(fetchedProfile);
          } else {
            // User exists in Auth, but no profile in Firestore. Create one.
            const newProfile: UserProfile = {
              ...initialUserProfileState,
              name: user.displayName || "User",
              email: user.email || "",
            };
            await setDoc(userDocRef, newProfile, { merge: true });
            setProfile(newProfile);
            setTempProfile(newProfile);
            toast({ title: "Profile Created", description: "Welcome! Your basic profile has been set up."});
          }
        } catch (err: any) {
          console.error("Profile load error:", err);
          toast({
            title: "Profile Load Error",
            description: err.message || "Could not fetch your profile data. Please reload.",
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
  }, [toast]);

  useEffect(() => {
    // Ensure tempProfile updates when profile changes (e.g., after initial load or save)
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

  const saveProfileChanges = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to save profile changes.",
        variant: "destructive",
        action: <Button asChild variant="outline" size="sm"><Link href="/login">Login</Link></Button>,
      });
      return;
    }
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      // Only update fields that are directly editable in this section.
      // For a customer, this is typically just 'name'. Email is usually read-only.
      await updateDoc(userDocRef, {
        name: tempProfile.name,
        // Add other fields here if they become editable in this section
      });
      // Update local state to reflect saved changes
      setProfile(prev => ({ ...prev, name: tempProfile.name }));
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (err: any) {
      console.error("Save profile error:", err);
      toast({
        title: "Error Saving Profile",
        description: err.message || "Could not save profile changes.",
        variant: "destructive",
      });
    }
  };

  const saveNotificationPreferences = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to save notification preferences.",
        variant: "destructive",
        action: <Button asChild variant="outline" size="sm"><Link href="/login">Login</Link></Button>,
      });
      return;
    }
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
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
    } catch (err: any) {
      console.error("Save notification prefs error:", err);
      toast({
        title: "Error Saving Preferences",
        description: err.message || "Could not save notification preferences.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingAuth || (currentUser && isLoadingProfile)) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <Bell className="h-4 w-4" />
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
        <Card className="lg:col-span-1 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="mr-2 h-6 w-6 text-primary" /> Profile Information
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsEditingProfile(!isEditingProfile)} aria-label={isEditingProfile ? "Cancel edit" : "Edit profile"}>
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
                className={!isEditingProfile ? "border-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0" : ""}
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
                className="border-none px-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="your.email@example.com"
              />
            </div>
            {isEditingProfile && (
              <Button onClick={saveProfileChanges} className="w-full">Save Profile Changes</Button>
            )}
            <div>
              <p className="text-sm font-medium mt-4">Saved Payment Methods:</p>
              {profile.savedPaymentMethods?.length ? (
                profile.savedPaymentMethods.map(method => <p key={method} className="text-sm text-muted-foreground">{method}</p>)
              ) : (
                <p className="text-sm text-muted-foreground">
                  No saved payment methods.
                </p>
              )}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => {
                  toast({ title: "Coming Soon!", description: "Payment method management will be available here." });
                }}
              >
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-6 w-6 text-primary" /> Notification Preferences
            </CardTitle>
            <CardDescription>
              Customize how you receive updates from FindATruck.
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
                aria-label="Truck nearby radius slider"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="orderUpdates" className="text-sm font-medium">Order Updates</Label>
              <Switch
                id="orderUpdates"
                checked={tempProfile.notificationPreferences.orderUpdates}
                onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                aria-label="Toggle order updates notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="promotionalMessages" className="text-sm font-medium">Promotional Messages</Label>
              <Switch
                id="promotionalMessages"
                checked={tempProfile.notificationPreferences.promotionalMessages}
                onCheckedChange={(checked) => handleNotificationChange('promotionalMessages', checked)}
                aria-label="Toggle promotional messages notifications"
              />
            </div>
            <Button onClick={saveNotificationPreferences} className="w-full">Save Notification Preferences</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><ShoppingBag className="mr-2 h-6 w-6 text-primary" /> Past Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Your past orders will appear here.</p>
            <div className="mt-4 p-3 border rounded-md text-center">
              <p className="text-sm text-muted-foreground">No orders found yet.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Heart className="mr-2 h-6 w-6 text-primary" /> Favorite Trucks</CardTitle>
          </CardHeader>
          <CardContent>
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
