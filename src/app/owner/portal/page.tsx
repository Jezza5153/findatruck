
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, LogIn, UserPlus, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function OwnerPortalPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/5">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <ChefHat className="mx-auto h-16 w-16 text-accent mb-4" />
          <CardTitle className="text-3xl font-bold tracking-tight text-accent">Food Truck Owner Portal</CardTitle>
          <CardDescription>Welcome! Manage your truck or get started with FindATruck.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={() => router.push('/login?role=owner')} // Use unified login, hint role if needed for specific logic
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6"
            size="lg"
          >
            <LogIn className="mr-2 h-6 w-6" /> Owner Login
          </Button>
          <Button
            onClick={() => router.push('/owner/signup')}
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent text-lg py-6"
            size="lg"
          >
            <UserPlus className="mr-2 h-6 w-6" /> Register Your Truck
          </Button>
        </CardContent>
        <CardContent className="mt-2 pt-0 text-center border-t border-border/50">
             <p className="mt-4 text-sm text-muted-foreground">
                Not an owner?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                <Button variant="outline" asChild className="w-full">
                    <Link href="/map" className="flex items-center justify-center">
                        <MapPin className="mr-2 h-4 w-4" /> Find Food Trucks
                    </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                    <Link href="/customer/signup" className="flex items-center justify-center">
                        <UserPlus className="mr-2 h-4 w-4" /> Customer Signup
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
