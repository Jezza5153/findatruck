
'use client'; // Required for useRouter and onClick handlers

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ChefHat } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter
import { useToast } from "@/hooks/use-toast";

export default function OwnerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you would authenticate the owner here.
    // Backend would verify credentials and role.
    // For simulation, we'll just show a toast and redirect.
    toast({
      title: "Owner Login Successful (Simulated)",
      description: "Redirecting to your owner dashboard...",
    });
    // Simulate successful owner login
    router.push('/owner/dashboard'); 
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <ChefHat className="mx-auto h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight text-accent">Food Truck Owner Login</CardTitle>
          <CardDescription>Log in to manage your truck on FindATruck.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="owner@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" passHref className="text-sm font-medium text-accent hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </div>
            <div>
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <LogIn className="mr-2 h-5 w-5" /> Log In to Owner Dashboard
              </Button>
            </div>
            {/* OAuth for owners could also be an option */}
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
