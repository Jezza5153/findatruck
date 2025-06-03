
'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Edit3, Image as ImageIcon, AlertTriangle, LogIn } from "lucide-react";
import NextImage from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { UserDocument, FoodTruck } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";


type TruckProfileFormData = Pick<FoodTruck, 
  'name' | 
  'description' | 
  'cuisine' | 
  'imageUrl' | 
  'contactEmail' | 
  'phone' | 
  'address' | 
  'operatingHoursSummary'
> & { imagePath?: string }; // Add imagePath for storage tracking

const initialProfileFormData: TruckProfileFormData = {
  name: "",
  description: "",
  cuisine: "",
  imageUrl: undefined,
  imagePath: undefined,
  contactEmail: "",
  phone: "",
  address: "",
  operatingHoursSummary: "e.g., Mon-Fri 11 AM - 7 PM",
};

export default function OwnerProfilePage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profileForm, setProfileForm] = useState<TruckProfileFormData>(initialProfileFormData);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false); // Start in view mode
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setIsLoading(true); // Start loading profile data
        setError(null);
        
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let currentTruckId: string | null = null;

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserDocument;
            if (userData.role !== 'owner') {
                toast({ title: "Access Denied", description: "This page is for food truck owners.", variant: "destructive" });
                router.push('/'); setIsLoading(false); return;
            }
            currentTruckId = userData.truckId || firebaseUser.uid; 
            setTruckId(currentTruckId);
        } else {
            toast({ title: "Error", description: "User profile not found.", variant: "destructive" });
            router.push('/login'); setIsLoading(false); return;
        }

        if (currentTruckId) {
          const truckDocRef = doc(db, "trucks", currentTruckId);
          const truckDocSnap = await getDoc(truckDocRef);

          if (truckDocSnap.exists()) {
            const data = truckDocSnap.data() as FoodTruck; // Use FoodTruck type
            setProfileForm({
              name: data.name || "",
              description: data.description || "",
              cuisine: data.cuisine || "",
              imageUrl: data.imageUrl,
              imagePath: data.imagePath, // Load imagePath
              contactEmail: data.contactEmail || firebaseUser.email || "",
              phone: data.phone || "",
              address: data.address || "",
              operatingHoursSummary: data.operatingHoursSummary || "e.g., Mon-Fri 11 AM - 7 PM",
            });
            setPhotoPreview(data.imageUrl);
          } else {
            // No truck profile yet for this truckId, allow creating one.
            // User is an owner, but truck doc might not exist if signup flow was interrupted or this is first setup.
            setProfileForm({ ...initialProfileFormData, contactEmail: firebaseUser.email || "" });
            setEditing(true); // Force edit mode if profile doesn't exist
            toast({ title: "New Truck Profile", description: "Please fill in your truck details to get started.", variant: "default" });
          }
        }
        setIsLoading(false);
      } else {
        router.push("/login?redirect=/owner/profile");
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [router, toast]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "Image Too Large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser || !truckId) {
      toast({ title: "Error", description: "User or Truck ID not found. Cannot save.", variant: "destructive" });
      return;
    }
    if (!profileForm.name || !profileForm.cuisine || !profileForm.contactEmail) {
      toast({ title: "Missing Required Fields", description: "Truck Name, Cuisine, and Contact Email are required.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      let imageUrlToSave = profileForm.imageUrl;
      let imagePathToSave = profileForm.imagePath;

      if (photoFile) {
        // If there was an old image and a new one is uploaded, delete the old one from storage
        if (profileForm.imagePath && profileForm.imagePath !== "") {
          try {
            await deleteObject(ref(storage, profileForm.imagePath));
          } catch (deleteError: any) {
            // Log but don't block save if old image deletion fails (it might not exist or permissions issue)
            console.warn("Could not delete old profile image:", deleteError.message);
          }
        }
        
        const newImageName = `profile_${currentUser.uid}_${Date.now()}_${photoFile.name}`;
        imagePathToSave = `trucks/${truckId}/profileImages/${newImageName}`;
        const photoRef = ref(storage, imagePathToSave);
        await uploadBytes(photoRef, photoFile);
        imageUrlToSave = await getDownloadURL(photoRef);
      }
      
      const truckDataToSave: Partial<FoodTruck> = {
        name: profileForm.name,
        description: profileForm.description,
        cuisine: profileForm.cuisine,
        imageUrl: imageUrlToSave,
        imagePath: imagePathToSave, // Save new image path
        contactEmail: profileForm.contactEmail,
        phone: profileForm.phone,
        address: profileForm.address,
        operatingHoursSummary: profileForm.operatingHoursSummary,
        ownerUid: currentUser.uid, // Ensure ownerUid is set/updated
        updatedAt: serverTimestamp(),
      };
      
      const truckDocRef = doc(db, "trucks", truckId);
      const truckDocSnap = await getDoc(truckDocRef);

      if (truckDocSnap.exists()) {
        await updateDoc(truckDocRef, truckDataToSave);
      } else {
        // Creating a new truck document if it doesn't exist
        await setDoc(truckDocRef, { ...truckDataToSave, createdAt: serverTimestamp() });
      }
      
      // Update user document if key fields like truckName or cuisineType changed
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
          truckName: profileForm.name, // This corresponds to UserDocument.truckName
          cuisineType: profileForm.cuisine, // This corresponds to UserDocument.cuisineType
          truckId: truckId, // Ensure truckId is on user doc
      });

      setProfileForm(prev => ({ ...prev, imageUrl: imageUrlToSave, imagePath: imagePathToSave }));
      setEditing(false);
      setPhotoFile(null); // Clear uploaded file state
      toast({ title: "Profile Updated", description: "Your truck profile has been saved." });
    } catch (e: any) {
      console.error("Save profile error:", e);
      toast({ title: "Error Saving Profile", description: e.message || String(e), variant: "destructive" });
    }
    setIsSaving(false);
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading profile...</p>
      </div>
    );
  }
  
  if (!currentUser) { // Should be caught by onAuthStateChanged, but as a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Alert variant="destructive" className="max-w-md mx-auto">
            <LogIn className="h-4 w-4" />
            <AlertTitle>Not Authenticated</AlertTitle>
            <AlertDescription>Please log in as an owner to manage your truck profile.</AlertDescription>
         </Alert>
         <Button asChild className="mt-4"><Link href="/login?redirect=/owner/profile">Login</Link></Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Profile Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
              My Food Truck Profile
            </div>
            {!editing && (
                <Button type="button" variant="ghost" onClick={() => setEditing(true)} aria-label="Edit profile">
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
              <div className="relative w-32 h-32 shrink-0">
                {photoPreview ? (
                  <NextImage
                    src={photoPreview}
                    alt={profileForm.name || "Truck Photo"}
                    width={128}
                    height={128}
                    className="rounded-lg object-cover border shadow-sm aspect-square"
                    data-ai-hint="food truck photo"
                    onError={() => setPhotoPreview(initialProfileFormData.imageUrl)} // Fallback to placeholder on error
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <Label htmlFor="truck-name-display" className={`font-bold text-lg ${editing ? 'hidden' : ''}`}>
                  {profileForm.name || "Your Truck Name"}
                </Label>
                <div className={`text-sm text-muted-foreground ${editing ? 'hidden' : ''}`}>{profileForm.cuisine || "Cuisine Type"}</div>
                 {editing && (
                  <>
                  <Label htmlFor="truck-photo-upload" className="block text-sm font-medium mb-1">Truck Photo</Label>
                  <Input
                    id="truck-photo-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="text-xs"
                    onChange={handlePhotoChange}
                    aria-label="Upload truck photo"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Upload a new photo for your truck (max 5MB).</p>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Label htmlFor="truck-name">Truck Name <span className="text-destructive">*</span></Label>
                <Input id="truck-name" name="name" value={profileForm.name} onChange={handleInputChange} placeholder="e.g., Burrito Bros" disabled={!editing || isSaving} required />
              </div>
              <div>
                <Label htmlFor="truck-cuisine">Cuisine Type <span className="text-destructive">*</span></Label>
                <Input id="truck-cuisine" name="cuisine" value={profileForm.cuisine} onChange={handleInputChange} placeholder="e.g., Mexican, Burgers, Vegan" disabled={!editing || isSaving} required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="truck-description">Short Description / Bio</Label>
                <Textarea id="truck-description" name="description" value={profileForm.description} onChange={handleInputChange} placeholder="What makes your food truck special? Your story, menu, philosophy..." rows={3} disabled={!editing || isSaving} />
              </div>
               <div>
                <Label htmlFor="truck-address">Operating Address (approximate if mobile)</Label>
                <Input id="truck-address" name="address" value={profileForm.address} onChange={handleInputChange} placeholder="e.g., 123 Main St, City OR General Area" disabled={!editing || isSaving} />
              </div>
               <div>
                <Label htmlFor="truck-hours-summary">Operating Hours Summary</Label>
                <Input id="truck-hours-summary" name="operatingHoursSummary" value={profileForm.operatingHoursSummary} onChange={handleInputChange} placeholder="e.g., Mon-Fri 11am-7pm, Sat 12pm-5pm" disabled={!editing || isSaving} />
              </div>
              <div>
                <Label htmlFor="truck-email">Contact Email <span className="text-destructive">*</span></Label>
                <Input id="truck-email" name="contactEmail" type="email" value={profileForm.contactEmail} onChange={handleInputChange} placeholder="youremail@example.com" disabled={!editing || isSaving} required />
              </div>
              <div>
                <Label htmlFor="truck-phone">Phone (Optional)</Label>
                <Input id="truck-phone" name="phone" type="tel" value={profileForm.phone} onChange={handleInputChange} placeholder="Contact number" disabled={!editing || isSaving} />
              </div>
            </div>
            {editing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => { setEditing(false); setPhotoFile(null); setPhotoPreview(profileForm.imageUrl); /* Reset temp form to original if needed */ }} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || !profileForm.name || !profileForm.cuisine || !profileForm.contactEmail}>
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
