
'use client';
import { useEffect, useState } from 'react'; // Added useState for cuisineType if not already present

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, ChefHat } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Ensure db is imported
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserDocument } from "@/lib/types";

const availableCuisines = ["Mexican", "Italian", "Indian", "Burgers", "BBQ", "Dessert", "Asian Fusion", "Seafood", "Vegan", "Coffee", "Sandwiches", "Other"];

import * as zGlobal from 'zod';
const ownerSignupSchema = zGlobal.object({
  ownerName: zGlobal.string().min(2, { message: "Owner name must be at least 2 characters." }),
  truckName: zGlobal.string().min(2, { message: "Truck name must be at least 2 characters." }),
  cuisineType: zGlobal.string().min(1, { message: "Please select a cuisine type." }),
  email: zGlobal.string().email({ message: "Invalid email address." }),
  password: zGlobal.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: zGlobal.string(),
  terms: zGlobal.boolean().refine(val => val === true, { message: "You must accept the terms and conditions." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type OwnerSignupFormValues = zod.infer<typeof ownerSignupSchema>;

export default function OwnerSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cuisineType, setCuisineType] = useState(""); // For controlled Select component

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<OwnerSignupFormValues>({
    resolver: zodResolver(ownerSignupSchema),
    defaultValues: {
        terms: false,
        cuisineType: "",
    }
  });

  // Register cuisineType for react-hook-form and sync with local state
  useEffect(() => {
    register("cuisineType");
    setValue("cuisineType", cuisineType, { shouldValidate: true });
  }, [register, cuisineType, setValue]);


  const handleOwnerSignup: SubmitHandler<OwnerSignupFormValues> = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Update Firebase Auth profile (optional)
      await updateProfile(user, { displayName: data.ownerName });
      
      // Create user document in Firestore for the owner
      const userDocRef = doc(db, "users", user.uid);
      const userDocumentData: Partial<UserDocument> = {
        uid: user.uid,
        email: user.email,
        role: 'owner',
        ownerName: data.ownerName, 
        truckName: data.truckName, 
        cuisineType: data.cuisineType, 
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, userDocumentData);
      
      toast({
        title: "Owner Signup Successful!",
        description: "Your owner account has been created. Please login and complete your truck profile.",
      });
      router.push('/owner/login'); 
    } catch (error: any) {
      console.error("Detailed Owner Signup Error:", JSON.stringify(error, null, 2)); // Log the entire error object clearly
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) { // Check if error object has a code property
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered. Please login or use a different email.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. Please choose a stronger password.";
            break;
          case 'auth/invalid-email':
            errorMessage = "The email address is not valid.";
            break;
          // Add more Firebase specific error codes here if needed
          default:
            errorMessage = `Owner signup failed: ${error.message || 'Please try again.'}`;
        }
      } else if (error.message) {
          errorMessage = error.message;
      }
      toast({
        title: "Owner Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/10">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight text-accent">Register Your Food Truck</CardTitle>
          <CardDescription>Join FindATruck and connect with hungry customers.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleOwnerSignup)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="ownerName">Your Full Name (or Business Contact)</Label>
                    <Input id="ownerName" {...register("ownerName")} placeholder="Your Name" />
                    {errors.ownerName && <p className="text-xs text-destructive mt-1">{errors.ownerName.message}</p>}
                </div>
                 <div className="space-y-1">
                    <Label htmlFor="truckName">Food Truck Name</Label>
                    <Input id="truckName" {...register("truckName")} placeholder="e.g., Bob's Burgers" />
                    {errors.truckName && <p className="text-xs text-destructive mt-1">{errors.truckName.message}</p>}
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="cuisineType">Primary Cuisine Type</Label>
                <Select 
                  value={cuisineType} // Control Select with local state
                  onValueChange={(value) => {
                    setCuisineType(value); // Update local state
                    setValue("cuisineType", value, { shouldValidate: true }); // Update RHF state
                  }}
                >
                    <SelectTrigger id="cuisineTypeInput-owner-signup"> 
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                    {availableCuisines.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                {errors.cuisineType && <p className="text-xs text-destructive mt-1">{errors.cuisineType.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email-owner-signup">Email address (for login)</Label>
              <Input id="email-owner-signup" type="email" {...register("email")} placeholder="owner@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="password-owner-signup">Password</Label>
                    <Input id="password-owner-signup" type="password" {...register("password")} placeholder="Create a strong password" />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="confirm-password-owner-signup">Confirm Password</Label>
                    <Input id="confirm-password-owner-signup" type="password" {...register("confirmPassword")} placeholder="Confirm your password" />
                    {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
                </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms-owner" {...register("terms")} />
              <Label htmlFor="terms-owner" className="text-sm text-muted-foreground">
                I agree to the FindATruck{' '}
                <Link href="/terms-owner" className="font-medium text-accent hover:underline" target="_blank">
                  Owner Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-medium text-accent hover:underline" target="_blank">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
            {errors.terms && <p className="text-xs text-destructive -mt-2">{errors.terms.message}</p>}
            <div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2" disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : <><UserPlus className="mr-2 h-5 w-5" /> Sign Up My Truck</>}
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
