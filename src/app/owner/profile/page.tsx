'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, User2, UploadCloud, Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image';

function ProfilePhoto({ url, onChange, loading }: { url?: string, onChange: (f: File) => void, loading?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-primary/30 shadow">
        {url ? (
          <NextImage src={url} width={112} height={112} alt="Profile" className="object-cover w-28 h-28" />
        ) : (
          <User2 className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer mt-2">
        <UploadCloud className="w-4 h-4" />
        {loading ? "Uploading..." : "Change Photo"}
        <input type="file" accept="image/*" className="hidden" disabled={loading} onChange={e => {
          if (e.target.files?.[0]) onChange(e.target.files[0]);
        }} />
      </label>
    </div>
  );
}

export default function OwnerProfilePage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truck, setTruck] = useState<any>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Local state for form fields
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [desc, setDesc] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [social, setSocial] = useState('');

  // Load auth/user/truck info
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) {
        router.push('/login?redirect=/owner/profile');
        return;
      }
      setCurrentUser(user);
      // Get truck id from user doc
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;
      const userData = userDoc.data();
      const tId = userData.truckId || user.uid;
      setTruckId(tId);
      // Get truck doc
      const tDoc = await getDoc(doc(db, 'trucks', tId));
      if (!tDoc.exists()) return;
      const t = tDoc.data();
      setTruck(t);
      setName(t.name || '');
      setCuisine(t.cuisine || '');
      setDesc(t.description || '');
      setPhoto(t.photoUrl || '');
      setSocial(t.social || '');
    });
    return () => unsub();
  }, [router]);

  // Upload new photo
  const handlePhoto = useCallback(async (file: File) => {
    if (!currentUser || !truckId) return;
    setPhotoLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `truckPhotos/${truckId}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhoto(url);
      await updateDoc(doc(db, 'trucks', truckId), { photoUrl: url });
      toast({ title: "Photo Updated", description: "Your truck profile photo is live." });
    } catch {
      toast({ title: "Upload Failed", description: "Please try a different photo.", variant: "destructive" });
    }
    setPhotoLoading(false);
  }, [currentUser, truckId, toast]);

  // Save
  const canSave = name.length >= 2 && cuisine.length >= 2 && desc.length >= 5;

  const handleSave = useCallback(async () => {
    if (!truckId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'trucks', truckId), {
        name: name.trim(),
        cuisine: cuisine.trim(),
        description: desc.trim(),
        photoUrl: photo,
        social: social.trim()
      });
      toast({ title: "Profile Saved", description: "Truck details updated." });
      setTruck({
        ...truck,
        name: name.trim(),
        cuisine: cuisine.trim(),
        description: desc.trim(),
        photoUrl: photo,
        social: social.trim()
      });
    } catch (err: any) {
      setError(err.message || 'Error saving profile.');
    }
    setSaving(false);
  }, [truck, truckId, name, cuisine, desc, photo, social, toast]);

  // ---- UI ----
  if (!currentUser || !truck) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
        <div className="font-medium">Loading your truck profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-12 pb-24 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Truck Profile</CardTitle>
          <CardDescription>
            Customers see this. A great profile gets more sales!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePhoto url={photo} onChange={handlePhoto} loading={photoLoading} />
          <div className="mb-4">
            <Label htmlFor="truck-name" className="font-medium">Truck Name *</Label>
            <Input id="truck-name" value={name} onChange={e => setName(e.target.value)} maxLength={32} placeholder="eg. Tasty Thai" autoFocus required />
          </div>
          <div className="mb-4">
            <Label htmlFor="truck-cuisine" className="font-medium">Cuisine *</Label>
            <Input id="truck-cuisine" value={cuisine} onChange={e => setCuisine(e.target.value)} maxLength={24} placeholder="eg. Thai, Burgers, Fusion..." required />
          </div>
          <div className="mb-4">
            <Label htmlFor="truck-desc" className="font-medium">Short Description *</Label>
            <Input id="truck-desc" value={desc} onChange={e => setDesc(e.target.value)} maxLength={120} placeholder="Write a short, delicious intro!" required />
          </div>
          <div className="mb-6">
            <Label htmlFor="truck-social" className="font-medium">Instagram or Social (optional)</Label>
            <Input id="truck-social" value={social} onChange={e => setSocial(e.target.value)} maxLength={40} placeholder="@yourtruck" />
          </div>
          {!canSave && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Complete Profile Required</AlertTitle>
              <AlertDescription>
                Please fill in Truck Name, Cuisine, and Description (at least 5 characters).
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSave} className="w-full gap-2" disabled={!canSave || saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
