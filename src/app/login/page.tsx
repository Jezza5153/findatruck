
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Utensils, UserPlus, ChefHat } from "lucide-react";
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
const loginSchema = zGlobal.object({
  email: zGlobal.string().email({ message: "Invalid email address." }),
  password: zGlobal.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserDocument;
        if (userData.role === 'customer') {
          toast({
            title: "Login Successful!",
            description: "Redirecting to your dashboard...",
          });
          router.push('/customer/dashboard');
        } else if (userData.role === 'owner') {
          toast({
            title: "Owner Login Successful!",
            description: "Redirecting to your owner dashboard...",
          });
          router.push('/owner/dashboard');
        } else {
          await signOut(auth);
          toast({
            title: "Login Failed",
            description: "User role not recognized. Please contact support.",
            variant: "destructive",
          });
        }
      } else {
        await signOut(auth);
        toast({
          title: "Login Failed",
          description: "Account details not found. Please try signing up or contact support if you believe this is an error.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Invalid email or password. Please try again.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many login attempts. Please try again later or reset your password.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-primary/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Utensils className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome to FindATruck!</CardTitle>
          <CardDescription>Log in to continue to your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(handleLogin)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email-login">Email address</Label>
              <Input id="email-login" type="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password-login">Password</Label>
                <Link href="#" passHref className="text-sm font-medium text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password-login" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                 {isSubmitting ? "Logging in..." : <><LogIn className="mr-2 h-5 w-5" /> Log In</>}
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button variant="outline" asChild className="w-full">
                    <Link href="/customer/signup" className="flex items-center justify-center">
                        <UserPlus className="mr-2 h-4 w-4" /> Customer Signup
                    </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                     <Link href="/owner/signup" className="flex items-center justify-center text-accent border-accent hover:bg-accent/10 hover:text-accent">
                        <ChefHat className="mr-2 h-4 w-4" /> Owner Signup
                    </Link>
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
