
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Utensils, Image as ImageIcon, Info, Phone, Clock, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NextImage from "next/image"; // Renamed to avoid conflict with Lucide icon
import { useToast } from '@/hooks/use-toast';

const availableCuisines = ["Mexican", "Italian", "Indian", "Burgers", "BBQ", "Dessert", "Asian Fusion", "Seafood", "Vegan", "Coffee", "Sandwiches"];

export default function OwnerProfilePage() {
  const { toast } = useToast();
  const [truckName, setTruckName] = useState("My Awesome Food Truck");
  const [cuisineType, setCuisineType] = useState("Burgers");
  const [description, setDescription] = useState("Serving the best food on wheels!");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [operatingHoursSummary, setOperatingHoursSummary] = useState("Typically Mon-Fri, 11 AM - 7 PM");
  const [truckImagePreview, setTruckImagePreview] = useState<string | null>("https://placehold.co/300x200.png");
  const [truckImageFile, setTruckImageFile] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setTruckImageFile(file);
      setTruckImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = () => {
    // In a real app, this would send data to the backend, including uploading the image file
    console.log({
      truckName,
      cuisineType,
      description,
      phoneNumber,
      operatingHoursSummary,
      truckImageFile: truckImageFile?.name // Just logging file name for now
    });
    toast({
      title: "Profile Saved!",
      description: "Your truck profile has been updated successfully.",
    });
  };

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
                    <Input id="truckName" placeholder="e.g., Bob's Burgers" className="mt-1" value={truckName} onChange={(e) => setTruckName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="cuisineType"><Utensils className="inline mr-1 h-4 w-4"/>Cuisine Type</Label>
                    <Select value={cuisineType} onValueChange={setCuisineType}>
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
                <Textarea id="description" placeholder="Tell customers about your truck..." className="mt-1" rows={4} value={description} onChange={(e) => setDescription(e.target.value)}/>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="phoneNumber"><Phone className="inline mr-1 h-4 w-4"/>Contact Phone (Optional)</Label>
                    <Input id="phoneNumber" type="tel" placeholder="e.g., (555) 123-4567" className="mt-1" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
                </div>
                 <div>
                    <Label htmlFor="operatingHoursSummary"><Clock className="inline mr-1 h-4 w-4"/>General Operating Hours (Display Text)</Label>
                    <Input id="operatingHoursSummary" placeholder="e.g., Mon-Fri 11AM-8PM, Sat 12PM-10PM" className="mt-1" value={operatingHoursSummary} onChange={(e) => setOperatingHoursSummary(e.target.value)}/>
                     <p className="text-xs text-muted-foreground mt-1">This is a summary for customers. Detailed daily/special hours are managed on the <Link href="/owner/schedule" className="underline text-primary">Schedule page</Link>.</p>
                </div>
            </div>

            <div>
                <Label htmlFor="truckImage"><ImageIcon className="inline mr-1 h-4 w-4"/>Truck Image / Logo</Label>
                <Input id="truckImage" type="file" className="mt-1" accept="image/*" onChange={handleImageUpload}/>
                <p className="text-xs text-muted-foreground mt-1">Upload a high-quality photo of your truck or your logo. Recommended: Landscape (e.g., 600x400px).</p>
                {truckImagePreview && (
                    <NextImage src={truckImagePreview} alt="Truck image preview" width={300} height={200} className="mt-2 rounded-md border object-cover" data-ai-hint="food truck photo" />
                )}
            </div>
            
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges}>
                    <Save className="mr-2 h-5 w-5"/>Save Profile Changes
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
