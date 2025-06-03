
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, LogIn, UserPlus, Map } from "lucide-react";
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
            onClick={() => router.push('/login')} // Points to unified login
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
        <CardContent className="mt-0 pt-0 text-center">
            <Link href="/map" className="text-sm font-medium text-primary hover:underline flex items-center justify-center">
                <Map className="mr-1 h-4 w-4" /> Not an owner? Find Food Trucks
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
