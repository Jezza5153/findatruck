
'use client'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ChefHat } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { z as zod } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { UserDocument } from "@/lib/types";

import * as zGlobal from 'zod';
const ownerLoginSchema = zGlobal.object({
  email: zGlobal.string().email({ message: "Invalid email address." }),
  password: zGlobal.string().min(1, { message: "Password is required." }),
});

type OwnerLoginFormValues = zod.infer<typeof ownerLoginSchema>;

export default function OwnerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OwnerLoginFormValues>({
    resolver: zodResolver(ownerLoginSchema),
  });

  const handleLogin: SubmitHandler<OwnerLoginFormValues> = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserDocument;
        if (userData.role === 'owner') {
          toast({
            title: "Owner Login Successful!",
            description: "Redirecting to your owner dashboard...",
          });
          router.push('/owner/dashboard'); 
        } else {
          await signOut(auth);
          toast({
            title: "Login Failed",
            description: "This is not an owner account. Please use the Customer Login.",
            variant: "destructive",
          });
        }
      } else {
        await signOut(auth);
        toast({
          title: "Login Failed",
          description: "Account details not found. Please try signing up.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Owner Login error:", error);
      let errorMessage = "Invalid email or password. Please try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many login attempts. Please try again later or reset your password.";
      }
      toast({
        title: "Owner Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight text-accent">Food Truck Owner Login</CardTitle>
          <CardDescription>Log in to manage your truck on FindATruck.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleLogin)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-owner">Email address</Label>
              <Input id="email-owner" type="email" {...register("email")} placeholder="owner@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password-owner">Password</Label>
                <Link href="#" passHref className="text-sm font-medium text-accent hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password-owner" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : <><LogIn className="mr-2 h-5 w-5" /> Log In to Owner Dashboard</>}
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="text-center block">
            <p className="mt-2 text-sm text-muted-foreground">
                Don&apos;t have an owner account?{' '}
                <Link href="/owner/signup" className="font-medium text-accent hover:underline">
                Sign up your truck here
                </Link>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                Not an owner?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                Customer Login
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
