
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Utensils, ChefHat } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserDocument } from "@/lib/types";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions." })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function CustomerSignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
    }
  });

  const handleSignup: SubmitHandler<SignupFormValues> = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.name });

      const userDocRef = doc(db, "users", user.uid);
      // Ensure all fields of UserDocument are covered
      const userDocumentData: UserDocument = {
        uid: user.uid,
        email: user.email,
        role: 'customer',
        name: data.name, // This is UserDocument.name for customers
        createdAt: serverTimestamp(),
        // Initialize customer-specific optional fields
        favoriteTrucks: [],
        notificationPreferences: {
            truckNearbyRadius: 2,
            orderUpdates: true,
            promotionalMessages: false,
        },
        // Owner specific fields are left undefined or explicitly set to null/empty if type demands
        ownerName: undefined, 
        truckName: undefined,
        cuisineType: undefined,
        truckId: undefined,
      };
      await setDoc(userDocRef, userDocumentData);

      toast({
        title: "Signup Successful!",
        description: "Your customer account has been created. Please login.",
      });
      router.push('/login'); 
    } catch (error: any) {
      console.error("Detailed Customer Signup Error:", JSON.stringify(error, null, 2));
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) {
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
          default:
            errorMessage = `Signup failed: ${error.message || 'Please try again.'}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Utensils className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">Create Your Customer Account</CardTitle>
          <CardDescription>Join FindATruck to discover amazing food.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleSignup)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name-customer-signup">Full Name</Label>
              <Input id="name-customer-signup" {...register("name")} placeholder="Your Name" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email-customer-signup-form">Email address</Label>
              <Input id="email-customer-signup-form" type="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password-customer-signup-form">Password</Label>
              <Input id="password-customer-signup-form" type="password" {...register("password")} placeholder="Create a strong password" />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirm-password-customer-signup-form">Confirm Password</Label>
              <Input id="confirm-password-customer-signup-form" type="password" {...register("confirmPassword")} placeholder="Confirm your password" />
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex items-start space-x-2 pt-1">
               <Controller
                name="terms"
                control={control}
                render={({ field }) => (
                    <Checkbox
                    id="terms-customer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                    />
                )}
                />
              <Label htmlFor="terms-customer" className="text-sm text-muted-foreground leading-snug">
                I agree to the FindATruck{' '}
                <Link href="/terms" className="font-medium text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="font-medium text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>
             {errors.terms && <p className="text-xs text-destructive -mt-2 pl-8">{errors.terms.message}</p>}
            <div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={isSubmitting}>
                {isSubmitting ? "Signing up..." : <><UserPlus className="mr-2 h-5 w-5" /> Sign Up</>}
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                Log in here
                </Link>
            </p>
             <p className="text-sm text-muted-foreground">
                Are you a Food Truck Owner?{' '}
                <Link href="/owner/signup" className="font-medium text-accent hover:underline">
                  <ChefHat className="inline mr-1 h-4 w-4" /> Owner Signup
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
