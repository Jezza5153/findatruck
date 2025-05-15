import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Utensils } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/10">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Utensils className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight">Create Your Account</CardTitle>
          <CardDescription>Join Truck Tracker to discover amazing food.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required placeholder="Your Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Create a strong password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required placeholder="Confirm your password" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </Label>
          </div>
          <div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-5 w-5" /> Sign Up
            </Button>
          </div>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <div>
            {/* Placeholder for OAuth buttons */}
            <Button variant="outline" className="w-full mb-2">
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full">
              Sign up with Facebook
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center block">
            <p className="mt-2 text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                Log in here
                </Link>
            </p>
             <p className="mt-1 text-sm text-muted-foreground">
                Signing up as a Food Truck Owner?{' '}
                <Link href="/owner/signup" className="font-medium text-accent hover:underline">
                Owner Signup
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
