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

type TruckProfile = {
  name: string;
  bio: string;
  cuisineType: string;
  photoUrl?: string;
  contactEmail?: string;
  phone?: string;
};

const initialProfile: TruckProfile = {
  name: "",
  bio: "",
  cuisineType: "",
  photoUrl: undefined,
  contactEmail: "",
  phone: "",
};

export default function OwnerProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<TruckProfile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const router = useRouter();

  // Auth + Fetch Profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);

      if (firebaseUser) {
        const truckDoc = await getDoc(doc(db, "trucks", firebaseUser.uid));
        if (truckDoc.exists()) {
          setProfile(truckDoc.data() as TruckProfile);
          setPhotoPreview((truckDoc.data() as TruckProfile).photoUrl);
        } else {
          // No profile yet, use initial
          setProfile({ ...initialProfile, contactEmail: firebaseUser.email || "" });
        }
      } else {
        router.push("/owner/login");
      }
      setLoading(false);
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
    setLoading(true);
    try {
      let photoUrl = profile.photoUrl;
      if (photoFile) {
        const photoRef = ref(storage, `trucks/${user.uid}/profile.jpg`);
        await uploadBytes(photoRef, photoFile);
        photoUrl = await getDownloadURL(photoRef);
      }
      const profileData: TruckProfile = {
        ...profile,
        photoUrl,
        contactEmail: profile.contactEmail || user.email || "",
      };
      await setDoc(doc(db, "trucks", user.uid), {
        ...profileData,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setProfile(profileData);
      setEditing(false);
      toast({ title: "Profile Updated", description: "Your truck profile has been saved." });
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
    setLoading(false);
    setPhotoFile(null);
  };

  if (loadingAuth || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="mr-2 h-6 w-6 text-primary" />
            My Truck Profile
          </CardTitle>
          <CardDescription>
            Update your food truck details, branding, and contact info.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {/* Truck Photo */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                {photoPreview ? (
                  <NextImage
                    src={photoPreview}
                    alt="Truck Photo"
                    width={96}
                    height={96}
                    className="rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-xl text-muted-foreground border">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {editing && (
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute bottom-0 left-0 opacity-70 cursor-pointer"
                    onChange={handlePhotoChange}
                    style={{ width: "100%", height: "100%" }}
                    aria-label="Upload truck photo"
                  />
                )}
              </div>
              <div>
                <Label className="font-bold">{profile.name || "Truck Name"}</Label>
                <div className="text-xs text-muted-foreground">{profile.cuisineType || "Cuisine Type"}</div>
              </div>
              {!editing && (
                <Button type="button" variant="ghost" className="ml-auto" onClick={() => setEditing(true)}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Button>
              )}
            </div>
            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="truck-name">Truck Name</Label>
                <Input
                  id="truck-name"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g., Burrito Bros"
                  disabled={!editing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truck-cuisine">Cuisine Type</Label>
                <Input
                  id="truck-cuisine"
                  value={profile.cuisineType}
                  onChange={e => setProfile({ ...profile, cuisineType: e.target.value })}
                  placeholder="e.g., Mexican, Burgers, Vegan"
                  disabled={!editing}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="truck-bio">Short Description</Label>
                <Textarea
                  id="truck-bio"
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="What makes your food truck special? Your story, menu, philosophy..."
                  rows={3}
                  disabled={!editing}
                  required
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
                  disabled={!editing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truck-phone">Phone</Label>
                <Input
                  id="truck-phone"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Contact number"
                  disabled={!editing}
                />
              </div>
            </div>
            {/* Save/Cancel Buttons */}
            {editing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={() => { setEditing(false); setPhotoFile(null); setPhotoPreview(profile.photoUrl); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
