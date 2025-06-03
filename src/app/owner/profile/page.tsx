'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Edit3, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { auth, db, storage } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { UserDocument } from "@/lib/types";

type TruckProfileData = { // Renamed from TruckProfile to avoid conflict with a potential page component name
  name: string;
  description: string; // Renamed from bio for clarity with FoodTruck type
  cuisine: string; // Renamed from cuisineType
  imageUrl?: string; // Renamed from photoUrl
  contactEmail?: string;
  phone?: string;
  ownerUid: string; // Added to store owner relationship
  address?: string; // Added for location
  operatingHoursSummary?: string; // Added for hours
};

const initialProfileState: TruckProfileData = {
  name: "",
  description: "",
  cuisine: "",
  imageUrl: undefined,
  contactEmail: "",
  phone: "",
  ownerUid: "",
  address: "",
  operatingHoursSummary: "9 AM - 5 PM (Default)",
};

export default function OwnerProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<TruckProfileData>(initialProfileState);
  const [editing, setEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const { toast } = useToast();
  const router = useRouter();

  // Auth + Fetch Profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoadingAuth(false);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoadingProfile(true);
        // Determine truckId. This assumes truckId might be the user's UID or stored in their user document.
        // For a robust system, truckId should ideally be definitively linked, e.g., in the user's custom claims or user document.
        // For now, we'll attempt to fetch truck data using firebaseUser.uid as the truck's document ID.
        const truckIdForProfile = firebaseUser.uid; 

        const truckDocRef = doc(db, "trucks", truckIdForProfile);
        const truckDocSnap = await getDoc(truckDocRef);

        if (truckDocSnap.exists()) {
          const data = truckDocSnap.data() as Partial<TruckProfileData>;
          setProfile({
            name: data.name || "",
            description: data.description || "",
            cuisine: data.cuisine || "",
            imageUrl: data.imageUrl,
            contactEmail: data.contactEmail || firebaseUser.email || "",
            phone: data.phone || "",
            ownerUid: data.ownerUid || firebaseUser.uid,
            address: data.address || "",
            operatingHoursSummary: data.operatingHoursSummary || "9 AM - 5 PM (Default)",
          });
          setPhotoPreview(data.imageUrl);
        } else {
          // No profile yet, initialize with defaults and ownerUid
          setProfile({ ...initialProfileState, ownerUid: firebaseUser.uid, contactEmail: firebaseUser.email || "" });
        }
        setIsLoadingProfile(false);
      } else {
        router.push("/login"); // Redirect to unified login
      }
    });
    return () => unsub();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Not Logged In", description: "Please log in to edit your profile.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl = profile.imageUrl;
      const truckIdForProfile = user.uid; // Consistent with fetching

      if (photoFile) {
        const photoRef = ref(storage, `trucks/${truckIdForProfile}/profileImage/${photoFile.name}_${Date.now()}`);
        await uploadBytes(photoRef, photoFile);
        imageUrl = await getDownloadURL(photoRef);
      }
      
      const profileDataToSave: TruckProfileData = {
        ...profile,
        imageUrl: imageUrl, // Use the potentially updated imageUrl
        ownerUid: user.uid, // Ensure ownerUid is set
        contactEmail: profile.contactEmail || user.email || "",
      };
      
      // This assumes the truck document ID is the owner's UID.
      // If you have a separate truckId stored elsewhere (e.g., in user's document), use that.
      const truckDocRef = doc(db, "trucks", truckIdForProfile);

      // Firestore specific data for UserDocument (under /users/{uid})
      const userDocRef = doc(db, "users", user.uid);
      const userSpecificData: Partial<UserDocument> = {
        truckName: profileDataToSave.name,
        cuisineType: profileDataToSave.cuisine,
        truckId: truckIdForProfile, // Link user to their truck document ID
      };

      await setDoc(truckDocRef, {
        ...profileDataToSave,
        updatedAt: serverTimestamp(),
        // Ensure core fields from FoodTruck type are present for map/listing
        lat: profile.lat || undefined, // Assuming lat/lng might be managed elsewhere or added
        lng: profile.lng || undefined,
        isOpen: profile.isOpen === undefined ? true : profile.isOpen, // Default to open if not set
      }, { merge: true });
      
      await updateDoc(userDocRef, userSpecificData); // Update user document with truck info

      setProfile(profileDataToSave); // Update local state
      setEditing(false);
      toast({ title: "Profile Updated", description: "Your truck profile has been saved." });
    } catch (e: any) {
      console.error("Save profile error:", e);
      toast({ title: "Error Saving Profile", description: e.message || String(e), variant: "destructive" });
    }
    setIsSaving(false);
    setPhotoFile(null);
  };


  if (loadingAuth || isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ImageIcon className="mr-2 h-6 w-6 text-primary" />
              My Truck Profile
            </div>
            {!editing && (
                <Button type="button" variant="ghost" onClick={() => setEditing(true)}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
              )}
          </CardTitle>
          <CardDescription>
            Update your food truck details, branding, and contact info. This information will be visible to customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {/* Truck Photo */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="relative w-32 h-32">
                {photoPreview ? (
                  <NextImage
                    src={photoPreview}
                    alt={profile.name || "Truck Photo"}
                    width={128}
                    height={128}
                    className="rounded-lg object-cover border shadow-sm"
                    data-ai-hint="food truck photo"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Label htmlFor="truck-photo-upload" className={`font-bold text-lg ${editing ? 'cursor-pointer hover:text-primary' : ''}`}>
                  {profile.name || "Your Truck Name"}
                </Label>
                <div className="text-sm text-muted-foreground">{profile.cuisine || "Cuisine Type"}</div>
                 {editing && (
                  <>
                  <Input
                    id="truck-photo-upload"
                    type="file"
                    accept="image/*"
                    className="mt-2 text-xs"
                    onChange={handlePhotoChange}
                    aria-label="Upload truck photo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a new photo for your truck.</p>
                  </>
                )}
              </div>
            </div>
            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Label htmlFor="truck-name">Truck Name</Label>
                <Input
                  id="truck-name"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g., Burrito Bros"
                  disabled={!editing || isSaving}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truck-cuisine">Cuisine Type</Label>
                <Input
                  id="truck-cuisine"
                  value={profile.cuisine}
                  onChange={e => setProfile({ ...profile, cuisine: e.target.value })}
                  placeholder="e.g., Mexican, Burgers, Vegan"
                  disabled={!editing || isSaving}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="truck-bio">Short Description / Bio</Label>
                <Textarea
                  id="truck-bio"
                  value={profile.description}
                  onChange={e => setProfile({ ...profile, description: e.target.value })}
                  placeholder="What makes your food truck special? Your story, menu, philosophy..."
                  rows={3}
                  disabled={!editing || isSaving}
                  required
                />
              </div>
               <div>
                <Label htmlFor="truck-address">Operating Address (approximate if mobile)</Label>
                <Input
                  id="truck-address"
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  placeholder="e.g., 123 Main St, City OR General Area"
                  disabled={!editing || isSaving}
                />
              </div>
               <div>
                <Label htmlFor="truck-hours-summary">Operating Hours Summary</Label>
                <Input
                  id="truck-hours-summary"
                  value={profile.operatingHoursSummary}
                  onChange={e => setProfile({ ...profile, operatingHoursSummary: e.target.value })}
                  placeholder="e.g., Mon-Fri 11am-7pm, Sat 12pm-5pm"
                  disabled={!editing || isSaving}
                />
              </div>
              <div>
                <Label htmlFor="truck-email">Contact Email</Label>
                <Input
                  id="truck-email"
                  type="email"
                  value={profile.contactEmail}
                  onChange={e => setProfile({ ...profile, contactEmail: e.target.value })}
                  placeholder="youremail@example.com"
                  disabled={!editing || isSaving}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truck-phone">Phone (Optional)</Label>
                <Input
                  id="truck-phone"
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Contact number"
                  disabled={!editing || isSaving}
                />
              </div>
            </div>
            {/* Save/Cancel Buttons */}
            {editing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => { setEditing(false); setPhotoFile(null); setPhotoPreview(profile.imageUrl); }} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
