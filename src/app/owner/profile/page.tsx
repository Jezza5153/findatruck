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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { UserDocument, FoodTruck } from "@/lib/types"; // Added FoodTruck to type import

type TruckProfileFormData = { // Renamed to avoid conflict and be specific for form
  name: string;
  description: string;
  cuisine: string;
  imageUrl?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  operatingHoursSummary?: string;
};

const initialProfileFormData: TruckProfileFormData = {
  name: "",
  description: "",
  cuisine: "",
  imageUrl: undefined,
  contactEmail: "",
  phone: "",
  address: "",
  operatingHoursSummary: "9 AM - 5 PM (Default)",
};

export default function OwnerProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profileForm, setProfileForm] = useState<TruckProfileFormData>(initialProfileFormData);
  const [truckId, setTruckId] = useState<string | null>(null);
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
        
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let currentTruckId = null;

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserDocument;
            if (userData.role !== 'owner') {
                toast({ title: "Access Denied", description: "You are not an authorized owner.", variant: "destructive" });
                router.push('/');
                return;
            }
            currentTruckId = userData.truckId || firebaseUser.uid; // Prefer truckId from user doc, fallback to uid
            setTruckId(currentTruckId);
        } else {
            toast({ title: "Error", description: "User profile not found. Cannot load truck details.", variant: "destructive" });
            router.push('/login'); // Or owner dashboard
            setIsLoadingProfile(false);
            return;
        }

        const truckDocRef = doc(db, "trucks", currentTruckId);
        const truckDocSnap = await getDoc(truckDocRef);

        if (truckDocSnap.exists()) {
          const data = truckDocSnap.data() as Partial<FoodTruck>;
          setProfileForm({
            name: data.name || "",
            description: data.description || "",
            cuisine: data.cuisine || "",
            imageUrl: data.imageUrl,
            contactEmail: data.contactEmail || firebaseUser.email || "",
            phone: data.phone || "",
            address: data.address || "",
            operatingHoursSummary: data.operatingHoursSummary || "9 AM - 5 PM (Default)",
          });
          setPhotoPreview(data.imageUrl);
        } else {
          // No truck profile yet for this truckId, initialize with defaults
          setProfileForm({ ...initialProfileFormData, contactEmail: firebaseUser.email || "" });
        }
        setIsLoadingProfile(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router, toast]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user || !truckId) {
      toast({ title: "Error", description: "User or Truck ID not found. Cannot save.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      let imageUrl = profileForm.imageUrl;

      if (photoFile) {
        const photoRef = ref(storage, `trucks/${truckId}/profileImage/${photoFile.name}_${Date.now()}`);
        await uploadBytes(photoRef, photoFile);
        imageUrl = await getDownloadURL(photoRef);
      }
      
      const truckDataToSave: Partial<FoodTruck> = {
        ...profileForm,
        imageUrl: imageUrl,
        ownerUid: user.uid,
        contactEmail: profileForm.contactEmail || user.email || "",
        updatedAt: serverTimestamp(),
      };
      
      const truckDocRef = doc(db, "trucks", truckId);
      await setDoc(truckDocRef, truckDataToSave, { merge: true });
      
      // Update user document as well if truck name or cuisine changed
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
          truckName: profileForm.name,
          cuisineType: profileForm.cuisine,
      });

      setProfileForm(prev => ({ ...prev, imageUrl })); // Update local state with new image URL
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
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <div className="relative w-32 h-32">
                {photoPreview ? (
                  <NextImage
                    src={photoPreview}
                    alt={profileForm.name || "Truck Photo"}
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
                  {profileForm.name || "Your Truck Name"}
                </Label>
                <div className="text-sm text-muted-foreground">{profileForm.cuisine || "Cuisine Type"}</div>
                 {editing && (
                  <>
                  <Input
                    id="truck-photo-upload"
                    type="file"
                    accept="image/*"
                    className="mt-2 text-xs"
                    onChange={handlePhotoChange}
                    aria-label="Upload truck photo"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a new photo for your truck.</p>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Label htmlFor="truck-name">Truck Name</Label>
                <Input
                  id="truck-name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Burrito Bros"
                  disabled={!editing || isSaving}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truck-cuisine">Cuisine Type</Label>
                <Input
                  id="truck-cuisine"
                  name="cuisine"
                  value={profileForm.cuisine}
                  onChange={handleInputChange}
                  placeholder="e.g., Mexican, Burgers, Vegan"
                  disabled={!editing || isSaving}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="truck-description">Short Description / Bio</Label>
                <Textarea
                  id="truck-description"
                  name="description"
                  value={profileForm.description}
                  onChange={handleInputChange}
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
                  name="address"
                  value={profileForm.address}
                  onChange={handleInputChange}
                  placeholder="e.g., 123 Main St, City OR General Area"
                  disabled={!editing || isSaving}
                />
              </div>
               <div>
                <Label htmlFor="truck-hours-summary">Operating Hours Summary</Label>
                <Input
                  id="truck-hours-summary"
                  name="operatingHoursSummary"
                  value={profileForm.operatingHoursSummary}
                  onChange={handleInputChange}
                  placeholder="e.g., Mon-Fri 11am-7pm, Sat 12pm-5pm"
                  disabled={!editing || isSaving}
                />
              </div>
              <div>
                <Label htmlFor="truck-email">Contact Email</Label>
                <Input
                  id="truck-email"
                  name="contactEmail"
                  type="email"
                  value={profileForm.contactEmail}
                  onChange={handleInputChange}
                  placeholder="youremail@example.com"
                  disabled={!editing || isSaving}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truck-phone">Phone (Optional)</Label>
                <Input
                  id="truck-phone"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleInputChange}
                  placeholder="Contact number"
                  disabled={!editing || isSaving}
                />
              </div>
            </div>
            {editing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => { setEditing(false); setPhotoFile(null); setPhotoPreview(profileForm.imageUrl); }} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || !profileForm.name || !profileForm.cuisine || !profileForm.description || !profileForm.contactEmail}>
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
