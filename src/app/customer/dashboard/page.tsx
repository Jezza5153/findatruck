'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, ShoppingBag, Heart, Bell, Edit3, Save, LogIn, Loader2, Mail, CheckCircle, CreditCard, MapPin, LocateFixed, Camera, X, Truck } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { UserProfile, NotificationPreferences, FoodTruck } from '@/lib/types';

// ---- FIXED TYPES (for safety in this file) ----
const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  truckNearbyRadius: 2,
  orderUpdates: true,
  promotionalMessages: false,
};

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Guest User',
  email: '',
  avatarUrl: '',
  savedPaymentMethods: [],
  favoriteTrucks: [],
  notificationPreferences: DEFAULT_NOTIFICATION_PREFS,
};

const DEFAULT_CENTER = { lat: -33.8688, lng: 151.2093 };

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => d * Math.PI / 180;
  const R = 6371;
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
  const [allTruckMeta, setAllTruckMeta] = useState<FoodTruck[]>([]);
  const [showSaved, setShowSaved] = useState(false);
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
            avatarUrl: user.photoURL || '',
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

  // --- Avatar upload ---
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    // Placeholder: just show preview, don't upload for now
    const url = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, avatarUrl: url }));
    toast({ title: "Profile Pic Changed", description: "Your new photo looks great!" });
  };

  // --- Notification preferences handler ---
  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean | number) => {
    const newPrefs = { ...profile.notificationPreferences, [key]: value };
    setProfile((p) => ({ ...p, notificationPreferences: newPrefs }));
  };

  const saveNotificationPreferences = async () => {
    if (!currentUser) return;
    setShowSaved(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        notificationPreferences: profile.notificationPreferences,
      });
      setTimeout(() => setShowSaved(false), 1000);
      toast({ title: "Preferences Updated", description: "Notification settings saved." });
    } catch (err: any) {
      toast({ title: "Error", description: "Could not save preferences.", variant: "destructive" });
      setShowSaved(false);
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
  }, []);

  // --- Get location (browser or default) ---
  useEffect(() => {
    if (!mapLoaded) return;
    if (location) return;
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
        setAllTruckMeta(allTrucks as FoodTruck[]);
      } catch (err: any) {
        setMapError("Couldn't load trucks.");
      }
    }
    if (mapLoaded) fetchTrucks();
  }, [mapLoaded]);

  // --- Filter trucks within radius and update map ---
  useEffect(() => {
    if (!location || !mapLoaded || !window.google?.maps || !mapRef.current) return;
    const nearby = trucks.filter((t: any) =>
      haversine(location.lat, location.lng, t.lat, t.lng) <= (profile.notificationPreferences.truckNearbyRadius || 5)
    );
    setTrucksNearby(nearby);

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

    markerRefs.current.forEach(m => m.setMap(null));
    markerRefs.current = [];

    for (const truck of nearby) {
      const marker = new window.google.maps.Marker({
        position: { lat: truck.lat, lng: truck.lng },
        map: mapInstance.current,
        icon: {
          url: truck.logoUrl || '/foodtruck-here.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
        title: truck.truckName || truck.name,
      });
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div style="min-width:210px">
          <strong>${truck.truckName || truck.name}</strong><br/>
          <span>${truck.cuisine || ''}</span><br/>
          ${truck.isOpen ? `<span style="color:green">Open Now</span>` : `<span style="color:gray">Closed</span>`}
          <br/>
          <a href="/trucks/${truck.id}" style="color:#228be6; font-weight:bold;">See Menu</a>
        </div>`
      });
      marker.addListener('click', () => infoWindow.open(mapInstance.current!, marker));
      markerRefs.current.push(marker);
    }

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

  const getFavoriteTrucks = () => {
    if (!profile.favoriteTrucks?.length) return [];
    return profile.favoriteTrucks
      .map(id => allTruckMeta.find(tr => tr.id === id))
      .filter(Boolean) as FoodTruck[];
  };

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

  return (
    <TooltipProvider>
      <div className="max-w-7xl mx-auto px-2 sm:px-8 py-10">
        {/* ... rest of your dashboard layout ... */}
      </div>
    </TooltipProvider>
  );
}
