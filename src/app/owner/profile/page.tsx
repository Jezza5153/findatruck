
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Utensils, Image as ImageIcon, Info, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const availableCuisines = ["Mexican", "Italian", "Indian", "Burgers", "BBQ", "Dessert", "Asian Fusion", "Seafood", "Vegan"];


export default function OwnerProfilePage() {
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
            Update your truck's name, description, cuisine type, photos, contact information, and other settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="truckName"><Info className="inline mr-1 h-4 w-4"/>Truck Name</Label>
                    <Input id="truckName" placeholder="e.g., Bob's Burgers" className="mt-1" defaultValue="My Awesome Food Truck" />
                </div>
                <div>
                    <Label htmlFor="cuisineType"><Utensils className="inline mr-1 h-4 w-4"/>Cuisine Type</Label>
                    <Select defaultValue="Burgers">
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
                <Textarea id="description" placeholder="Tell customers about your truck..." className="mt-1" rows={4} defaultValue="Serving the best food on wheels!"/>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="phoneNumber"><Phone className="inline mr-1 h-4 w-4"/>Contact Phone (Optional)</Label>
                    <Input id="phoneNumber" type="tel" placeholder="e.g., (555) 123-4567" className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="operatingHours"><Clock className="inline mr-1 h-4 w-4"/>General Operating Hours (Display Text)</Label>
                    <Input id="operatingHours" placeholder="e.g., Mon-Fri 11AM-8PM, Sat 12PM-10PM" className="mt-1" defaultValue="Typically Mon-Fri, 11 AM - 7 PM"/>
                     <p className="text-xs text-muted-foreground mt-1">Note: Detailed schedule is managed on the <Link href="/owner/schedule" className="underline text-primary">Schedule page</Link>.</p>
                </div>
            </div>

            <div>
                <Label htmlFor="truckImage"><ImageIcon className="inline mr-1 h-4 w-4"/>Truck Image / Logo</Label>
                <Input id="truckImage" type="file" className="mt-1" accept="image/*"/>
                <p className="text-xs text-muted-foreground mt-1">Upload a high-quality photo of your truck or your logo.</p>
                {/* Placeholder for current image preview */}
                <Image src="https://placehold.co/300x200.png" alt="Current truck image placeholder" width={300} height={200} className="mt-2 rounded-md border" data-ai-hint="food truck" />
            </div>
            
            <div className="flex justify-end">
                <Button size="lg">Save Profile Changes</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
