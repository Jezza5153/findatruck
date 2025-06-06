'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { User, ShoppingBag, Heart, Bell, Edit3, Save, LogIn, Loader2, Mail, CheckCircle, CreditCard, MapPin, LocateFixed } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { UserProfile, NotificationPreferences } from '@/lib/types';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  truckNearbyRadius: 2,
  orderUpdates: true,
  promotionalMessages: false,
};
const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Guest User',
  email: '',
  savedPaymentMethods: [],
  favoriteTrucks: [],
  notificationPreferences: DEFAULT_NOTIFICATION_PREFS,
};

const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 }; // Sydney fallback

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  // Returns distance in kilometers
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CustomerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Map state
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [trucks, setTrucks] = useState<any[]>([]);
  const [trucksNearby, setTrucksNearby] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const { toast } = useToast();

  // --- Load user & Firestore profile ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (user) {
        setIsLoadingProfile(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          let mergedProfile: UserProfile = {
            ...DEFAULT_USER_PROFILE,
            name: user.displayName || 'User',
            email: user.email || '',
          };
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            mergedProfile = {
              ...mergedProfile,
              ...data,
              notificationPreferences: {
                ...DEFAULT_NOTIFICATION_PREFS,
                ...(data.notificationPreferences || {}),
              },
            };
          } else {
            await setDoc(userDocRef, mergedProfile, { merge: true });
            toast({ title: "Profile Created", description: "Welcome! Your profile is ready." });
          }
          setProfile(mergedProfile);
          setNameInput(mergedProfile.name);
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
        setProfile(DEFAULT_USER_PROFILE);
        setNameInput('');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Inline edit for name ---
  const handleNameSave = async () => {
    if (!currentUser || !nameInput.trim()) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { name: nameInput });
      setProfile((p) => ({ ...p, name: nameInput }));
      setIsEditingName(false);
      toast({ title: "Profile Updated", description: "Name updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: "Could not update name.", variant: "destructive" });
    }
  };

  // --- Notification preferences handler ---
  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean | number) => {
    const newPrefs = { ...profile.notificationPreferences, [key]: value };
    setProfile((p) => ({ ...p, notificationPreferences: newPrefs }));
  };

  const saveNotificationPreferences = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        notificationPreferences: profile.notificationPreferences,
      });
      toast({ title: "Preferences Updated", description: "Notification settings saved." });
    } catch (err: any) {
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
    }
  };

  // --- Load Google Maps Script ---
  useEffect(() => {
    if (typeof window === "undefined" || window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setMapError('Failed to load map. Please refresh.');
    document.head.appendChild(script);
    // eslint-disable-next-line
  }, []);

  // --- Get location (browser or default) ---
  useEffect(() => {
    if (!mapLoaded) return;
    if (location) return; // already set
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation(DEFAULT_CENTER),
        { timeout: 4000 }
      );
    } else {
      setLocation(DEFAULT_CENTER);
    }
  }, [mapLoaded, location]);

  // --- Fetch trucks from Firestore ---
  useEffect(() => {
    async function fetchTrucks() {
      try {
        const q = collection(db, 'trucks');
        const qs = await getDocs(q);
        const allTrucks = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrucks(allTrucks.filter((t: any) => t.lat && t.lng));
      } catch (err: any) {
        setMapError("Couldn't load trucks.");
      }
    }
    if (mapLoaded) fetchTrucks();
  }, [mapLoaded]);

  // --- Filter trucks within radius and update map ---
  useEffect(() => {
    if (!location || !mapLoaded || !window.google?.maps || !mapRef.current) return;
    // 1. Filter trucks
    const nearby = trucks.filter((t: any) =>
      haversine(location.lat, location.lng, t.lat, t.lng) <= (profile.notificationPreferences.truckNearbyRadius || 5)
    );
    setTrucksNearby(nearby);

    // 2. Setup/center map
    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      geocoderRef.current = new window.google.maps.Geocoder();
    } else {
      mapInstance.current.setCenter(location);
    }

    // 3. Remove old markers
    markerRefs.current.forEach(m => m.setMap(null));
    markerRefs.current = [];

    // 4. Add truck markers
    for (const truck of nearby) {
      const marker = new window.google.maps.Marker({
        position: { lat: truck.lat, lng: truck.lng },
        map: mapInstance.current,
        icon: {
          url: truck.logoUrl || 'https://cdn-icons-png.flaticon.com/512/2815/2815428.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: truck.truckName || truck.name,
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="min-width:200px">
          <strong>${truck.truckName || truck.name}</strong><br/>
          <span>${truck.cuisine || ''}</span><br/>
          ${truck.isOpen ? `<span style="color:green">Open Now</span>` : `<span style="color:gray">Closed</span>`}
        </div>`
      });
      marker.addListener('click', () => infoWindow.open(mapInstance.current!, marker));
      markerRefs.current.push(marker);
    }

    // 5. Show user marker
    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    userMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstance.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: "#4285f4",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
        scale: 10,
      },
      title: "Your location"
    });

    // eslint-disable-next-line
  }, [location, mapLoaded, trucks, profile.notificationPreferences.truckNearbyRadius]);

  // --- Address search handler ---
  const handleAddressSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!geocoderRef.current || !addressInput) return;
    geocoderRef.current.geocode({ address: addressInput }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setLocation({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        });
      } else {
        toast({ title: "Not found", description: "Couldn't locate that address.", variant: "destructive" });
      }
    });
  };

  // --- Use my location ---
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast({ title: "Error", description: "Could not get your location.", variant: "destructive" }),
        { timeout: 5000 }
      );
    }
  };

  // --- UI states ---
  if (isLoadingAuth || (currentUser && isLoadingProfile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-20">
        <Loader2 className="h-14 w-14 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
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

  // --- MAIN DASHBOARD ---
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-8 py-10">
      {/* MAP SECTION */}
      <div className="mb-10 w-full flex flex-col items-center gap-5">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <form onSubmit={handleAddressSearch} className="flex gap-2 w-full md:w-auto">
            <Input
              type="text"
              placeholder="Enter your address or suburb"
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              className="w-full md:w-80"
            />
            <Button type="submit" variant="outline" className="shrink-0" aria-label="Search address">
              <MapPin className="h-5 w-5" /> Search
            </Button>
          </form>
          <Button variant="ghost" onClick={handleUseLocation} className="shrink-0">
            <LocateFixed className="h-5 w-5" /> Use my location
          </Button>
          <div className="text-muted-foreground text-sm">
            Showing trucks within <b>{profile.notificationPreferences.truckNearbyRadius}</b> mile(s)
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden border shadow-lg bg-white" style={{ height: 400 }}>
          {mapError && <div className="flex items-center justify-center h-full text-destructive">{mapError}</div>}
          {!mapLoaded && !mapError && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary mr-2" />
              Loading map...
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>

      {/* PROFILE HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="flex-shrink-0 bg-gradient-to-br from-green-300 to-blue-400 rounded-full p-2 shadow-xl">
          <User className="h-20 w-20 text-white" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold text-primary mb-0 flex items-center gap-3 animate-in fade-in">
            {isEditingName ? (
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-64 text-2xl"
                  autoFocus
                />
                <Button size="icon" className="h-8 w-8" onClick={handleNameSave}><CheckCircle className="h-5 w-5" /></Button>
                <Button size="icon" className="h-8 w-8" variant="ghost" onClick={() => { setIsEditingName(false); setNameInput(profile.name); }}>✖️</Button>
              </div>
            ) : (
              <>
                {profile.name}
                <Button variant="ghost" size="icon" className="ml-1" onClick={() => setIsEditingName(true)} aria-label="Edit Name"><Edit3 className="h-5 w-5" /></Button>
              </>
            )}
          </h1>
          <span className="text-base flex items-center gap-1 text-muted-foreground">
            <Mail className="h-4 w-4 mr-1" />
            {profile.email}
          </span>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
        {/* Profile Card */}
        <Card className="shadow-xl transition-all hover:scale-[1.02] border-2 border-blue-100">
          <CardHeader className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Label>Name</Label>
              <div className="font-medium text-lg">{profile.name}</div>
            </div>
            <div className="mb-2">
              <Label>Email</Label>
              <div className="font-mono text-base">{profile.email}</div>
            </div>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-muted-foreground">Edit name above. Email is managed by your login provider.</span>
          </CardFooter>
        </Card>
        {/* Notifications */}
        <Card className="shadow-xl transition-all hover:scale-[1.02] border-2 border-green-100">
          <CardHeader className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-green-600" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Truck Nearby Radius: <span className="font-bold">{profile.notificationPreferences.truckNearbyRadius} miles</span></Label>
              <Slider
                min={1} max={10} step={1}
                value={[profile.notificationPreferences.truckNearbyRadius]}
                onValueChange={([v]) => handleNotificationChange('truckNearbyRadius', v)}
                aria-label="Truck nearby radius"
                className="mt-1"
              />
            </div>
            <div className="flex justify-between items-center">
              <Label>Order Updates</Label>
              <Switch
                checked={profile.notificationPreferences.orderUpdates}
                onCheckedChange={v => handleNotificationChange('orderUpdates', v)}
              />
            </div>
            <div className="flex justify-between items-center">
              <Label>Promotional Messages</Label>
              <Switch
                checked={profile.notificationPreferences.promotionalMessages}
                onCheckedChange={v => handleNotificationChange('promotionalMessages', v)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveNotificationPreferences} className="w-full mt-2">Save Preferences</Button>
          </CardFooter>
        </Card>
        {/* Payment Methods */}
        <Card className="shadow-xl transition-all hover:scale-[1.02] border-2 border-yellow-100">
          <CardHeader className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-yellow-600" />
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              {profile.savedPaymentMethods?.length ? (
                profile.savedPaymentMethods.map(method =>
                  <div key={method} className="text-muted-foreground mb-1">{method}</div>
                )
              ) : (
                <span className="text-muted-foreground">No saved payment methods.</span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0 h-auto text-primary" onClick={() => toast({ title: "Coming Soon!", description: "Payment method management will be available here." })}>Manage Methods</Button>
          </CardFooter>
        </Card>
        {/* Favorites */}
        <Card className="shadow-xl transition-all hover:scale-[1.02] border-2 border-pink-100">
          <CardHeader className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <CardTitle>Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.favoriteTrucks?.length ? (
              profile.favoriteTrucks.map(truckId => (
                <div key={truckId} className="mt-1 p-2 rounded bg-accent/10 font-mono">
                  Truck: <span className="font-semibold">{truckId}</span>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">No favorite trucks yet.</span>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Orders card row (below grid on mobile, right on desktop) */}
      <div className="max-w-4xl mx-auto mt-10">
        <Card className="shadow-xl border-2 border-gray-100">
          <CardHeader className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            <CardTitle>Past Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-muted-foreground">Your past orders will appear here. (Coming soon!)</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
