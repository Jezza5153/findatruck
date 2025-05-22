
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Utensils, Image as ImageIcon, Info, Phone, Clock, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NextImage from "next/image";
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, updateDoc, collection, serverTimestamp, FieldValue } from 'firebase/firestore';
import type { UserDocument, FoodTruck } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const availableCuisines = ["Mexican", "Italian", "Indian", "Burgers", "BBQ", "Dessert", "Asian Fusion", "Seafood", "Vegan", "Coffee", "Sandwiches", "Other"];

export default function OwnerProfilePage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [truckProfile, setTruckProfile] = useState<Partial<FoodTruck>>({
    name: '',
    cuisine: '',
    description: '',
    phoneNumber: '',
    operatingHoursSummary: '',
    imageUrl: '',
  });
  const [truckImagePreview, setTruckImagePreview] = useState<string | null>(null);
  // const [truckImageFile, setTruckImageFile] = useState<File | null>(null); // File upload deferred
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user document to check role and get truckId
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const fetchedUserDoc = userDocSnap.data() as UserDocument;
          setUserDoc(fetchedUserDoc);
          if (fetchedUserDoc.role === 'owner') {
            if (fetchedUserDoc.truckId) {
              // Fetch existing truck profile
              const truckDocRef = doc(db, "trucks", fetchedUserDoc.truckId);
              const truckDocSnap = await getDoc(truckDocRef);
              if (truckDocSnap.exists()) {
                const fetchedTruckProfile = truckDocSnap.data() as FoodTruck;
                setTruckProfile(fetchedTruckProfile);
                if (fetchedTruckProfile.imageUrl) {
                  setTruckImagePreview(fetchedTruckProfile.imageUrl);
                }
              } else {
                // TruckId exists but truck doc doesn't - could be an error state or new profile needed
                console.warn("User has truckId but truck document not found. Allowing profile creation.");
                setTruckProfile(prev => ({ ...prev, name: fetchedUserDoc.truckName || '', cuisine: fetchedUserDoc.cuisineType || '' }));
              }
            } else {
              // No truckId, new owner or profile not created yet
              // Pre-fill from userDoc if available (from signup)
              setTruckProfile(prev => ({ ...prev, name: fetchedUserDoc.truckName || '', cuisine: fetchedUserDoc.cuisineType || '' }));
            }
          } else {
            // Not an owner, redirect or show error (handled by page access logic typically)
            toast({ title: "Access Denied", description: "You must be a truck owner to access this page.", variant: "destructive" });
            // router.push('/'); // Or appropriate redirect
          }
        } else {
          // User doc not found, critical error or new user flow issue
          toast({ title: "Error", description: "User profile not found. Please contact support.", variant: "destructive" });
        }
      } else {
        setCurrentUser(null);
        setUserDoc(null);
        setTruckProfile({ name: '', cuisine: '', description: '' }); // Reset form
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTruckProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleCuisineChange = (value: string) => {
    setTruckProfile(prev => ({ ...prev, cuisine: value }));
  };

  // Image file upload is deferred. This handles URL input for now.
  const handleImageURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setTruckProfile(prev => ({ ...prev, imageUrl: url }));
    setTruckImagePreview(url); // Show preview from URL
  };


  const handleSaveChanges = async () => {
    if (!currentUser || !userDoc || userDoc.role !== 'owner') {
      toast({ title: "Error", description: "You must be logged in as an owner to save.", variant: "destructive" });
      return;
    }
    if (!truckProfile.name?.trim() || !truckProfile.cuisine?.trim()) {
        toast({ title: "Missing Information", description: "Truck Name and Cuisine Type are required.", variant: "destructive"});
        return;
    }

    setIsSaving(true);
    try {
      const dataToSave: Partial<FoodTruck> & { updatedAt: FieldValue } = {
        name: truckProfile.name,
        cuisine: truckProfile.cuisine,
        description: truckProfile.description || '',
        imageUrl: truckProfile.imageUrl || '', // If using URL input
        phoneNumber: truckProfile.phoneNumber || '',
        operatingHoursSummary: truckProfile.operatingHoursSummary || '', 
        ownerUid: currentUser.uid, // Always ensure ownerUid is set
        updatedAt: serverTimestamp(),
      };

      if (userDoc.truckId) {
        // Update existing truck profile
        const truckDocRef = doc(db, "trucks", userDoc.truckId);
        await setDoc(truckDocRef, dataToSave, { merge: true });
        toast({ title: "Profile Updated", description: "Your truck profile has been saved." });
      } else {
        // Create new truck profile
        const dataToCreate: Partial<FoodTruck> & { createdAt: FieldValue, updatedAt: FieldValue } = { ...dataToSave, createdAt: serverTimestamp() };
        const truckCollectionRef = collection(db, "trucks");
        const newTruckDocRef = await addDoc(truckCollectionRef, dataToSave);
        
        // Update user document with the new truckId
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { truckId: newTruckDocRef.id });
        setUserDoc(prev => ({ ...prev!, truckId: newTruckDocRef.id })); // Update local userDoc state
        setTruckProfile(prev => ({ ...prev, id: newTruckDocRef.id })); // Set ID on local truck profile state

        toast({ title: "Profile Created", description: "Your truck profile has been created successfully." });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Save Failed", description: "Could not save your profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You need to be logged in to manage your truck profile.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/owner/login">Login as Owner</Link>
        </Button>
      </div>
    );
  }
  
  if (userDoc && userDoc.role !== 'owner') {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Incorrect Role</AlertTitle>
          <AlertDescription>This page is for truck owners. Please check your account type.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <Settings className="mr-3 h-8 w-8" /> Truck Profile & Settings
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Your Truck's Profile</CardTitle>
          <CardDescription>
            Update your truck's name, description, cuisine type, photos, contact information, and other settings that customers will see.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="truckName"><Info className="inline mr-1 h-4 w-4"/>Truck Name</Label>
                    <Input id="truckName" name="name" placeholder="e.g., Bob's Burgers" className="mt-1" value={truckProfile.name || ''} onChange={handleInputChange} />
                </div>
                <div>
                    <Label htmlFor="cuisineType"><Utensils className="inline mr-1 h-4 w-4"/>Cuisine Type</Label>
                    <Select value={truckProfile.cuisine || ''} onValueChange={handleCuisineChange}>
                        <SelectTrigger id="cuisineType" className="w-full mt-1">
                        <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                        {availableCuisines.map(cuisine => (
                            <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div>
                <Label htmlFor="description"><Info className="inline mr-1 h-4 w-4"/>Truck Description</Label>
                <Textarea id="description" name="description" placeholder="Tell customers about your truck..." className="mt-1" rows={4} value={truckProfile.description || ''} onChange={handleInputChange}/>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="phoneNumber"><Phone className="inline mr-1 h-4 w-4"/>Contact Phone (Optional)</Label>
                    <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="e.g., (555) 123-4567" className="mt-1" value={truckProfile.phoneNumber || ''} onChange={handleInputChange}/>
                </div>
                 <div>
                    <Label htmlFor="operatingHoursSummary"><Clock className="inline mr-1 h-4 w-4"/>General Operating Hours (Display Text)</Label>
                    <Input id="operatingHoursSummary" name="operatingHoursSummary" placeholder="e.g., Mon-Fri 11AM-8PM, Sat 12PM-10PM" className="mt-1" value={truckProfile.operatingHoursSummary || ''} onChange={handleInputChange}/>
                     <p className="text-xs text-muted-foreground mt-1">This is a summary for customers. Detailed daily/special hours are managed on the <Link href="/owner/schedule" className="underline text-primary">Schedule page</Link>.</p>
                </div>
            </div>

            <div>
                <Label htmlFor="truckImageURL"><ImageIcon className="inline mr-1 h-4 w-4"/>Truck Image / Logo URL</Label>
                <Input id="truckImageURL" name="imageUrl" type="url" placeholder="https://example.com/image.png" className="mt-1" value={truckProfile.imageUrl || ''} onChange={handleImageURLChange}/>
                {/* <Input id="truckImageFile" type="file" className="mt-1" accept="image/*" onChange={handleImageFileUpload} disabled/> */}
                {/* <p className="text-xs text-muted-foreground mt-1">Image file upload coming soon. For now, please provide a URL.</p> */}
                {truckImagePreview && (
                    <NextImage src={truckImagePreview} alt="Truck image preview" width={300} height={200} className="mt-2 rounded-md border object-cover" data-ai-hint="food truck photo"/>
                )}
            </div>
            
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5"/>}
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
