
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ChefHat, Utensils } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const availableCuisines = ["Mexican", "Italian", "Indian", "Burgers", "BBQ", "Dessert", "Asian Fusion", "Seafood", "Vegan", "Coffee", "Sandwiches", "Other"];


export default function OwnerSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  // Add state for cuisine if needed for form handling
  // const [cuisineType, setCuisineType] = useState("");


  const handleOwnerSignup = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you would register the owner and their truck here.
    // Backend should:
    // 1. Ensure email uniqueness across ALL users (customers and owners).
    // 2. Create the user account and assign an "owner" role.
    // 3. Potentially create an initial truck profile.
    // For simulation, we'll just show a toast and redirect.
    toast({
      title: "Owner Signup Successful (Simulated)",
      description: "Redirecting to your owner dashboard...",
    });
    // Redirect to owner dashboard or login page after signup
    router.push('/owner/dashboard'); 
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/10">
      <Card className="w-full max-w-lg shadow-2xl"> {/* Increased max-width for more fields */}
        <CardHeader className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight text-accent">Register Your Food Truck</CardTitle>
          <CardDescription>Join FindATruck and connect with hungry customers.</CardDescription>
        </CardHeader>
        {/* Backend must enforce that one email cannot be used for multiple accounts (customer or owner). */}
        {/* Backend will assign the 'owner' role upon successful registration through this form. */}
        <form onSubmit={handleOwnerSignup}>
          <CardContent className="space-y-4"> {/* Reduced general space-y slightly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="ownerName">Your Full Name</Label>
                    <Input id="ownerName" name="ownerName" type="text" autoComplete="name" required placeholder="Your Name" />
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="truckName">Food Truck Name</Label>
                    <Input id="truckName" name="truckName" type="text" required placeholder="e.g., Bob's Burgers" />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="cuisineType">Primary Cuisine Type</Label>
                <Select name="cuisineType" required>
                    <SelectTrigger id="cuisineType">
                    <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                    {availableCuisines.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email address (for login)</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="owner@example.com" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Create a strong password" />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required placeholder="Confirm your password" />
                </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the FindATruck{' '}
                <Link href="/terms-owner" className="font-medium text-accent hover:underline" target="_blank"> {/* Placeholder for owner terms page */}
                  Owner Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-medium text-accent hover:underline" target="_blank"> {/* Placeholder for privacy page */}
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
            <div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
                <UserPlus className="mr-2 h-5 w-5" /> Sign Up My Truck
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="text-center block">
            <p className="mt-2 text-sm text-muted-foreground">
                Already have an owner account?{' '}
                <Link href="/owner/login" className="font-medium text-accent hover:underline">
                Log in here
                </Link>
            </p>
             <p className="mt-1 text-sm text-muted-foreground">
                Not a Food Truck Owner?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                Customer Signup
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
