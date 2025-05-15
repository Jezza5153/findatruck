
'use client'; // Required for useRouter and onClick handlers

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Utensils } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Import useRouter
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you would authenticate the user here.
    // For simulation, we'll just show a toast and redirect.
    toast({
      title: "Login Successful (Simulated)",
      description: "Redirecting to your dashboard...",
    });
    // Simulate successful customer login
    router.push('/dashboard'); 
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Utensils className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back, Customer!</CardTitle>
          <CardDescription>Log in to manage your FindATruck profile.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" passHref className="text-sm font-medium text-primary hover:underline">
                  {/* In a real app, this would link to a password reset page */}
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </div>
            <div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <LogIn className="mr-2 h-5 w-5" /> Log In
              </Button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div>
              {/* Placeholder for OAuth buttons */}
              <Button variant="outline" className="w-full mb-2" type="button" onClick={() => toast({ title: "Feature Coming Soon", description: "Google Sign-In is not yet implemented."})}>
                Sign in with Google
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={() => toast({ title: "Feature Coming Soon", description: "Facebook Sign-In is not yet implemented."})}>
                Sign in with Facebook
              </Button>
            </div>
          </CardContent>
        </form>
        <CardFooter className="text-center block">
            <p className="mt-2 text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up here
                </Link>
            </p>
             <p className="mt-1 text-sm text-muted-foreground">
                Are you a Food Truck Owner?{' '}
                <Link href="/owner/login" className="font-medium text-accent hover:underline">
                Owner Login
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
