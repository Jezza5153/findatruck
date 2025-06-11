'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, LogIn, UserPlus, MapPin, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";

export default function OwnerPortalPage() {
  return (
    <div
      className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-accent/5"
      aria-label="Food Truck Owner Portal"
    >
      <Card className="w-full max-w-md shadow-2xl" tabIndex={-1} role="region" aria-labelledby="owner-portal-title">
        <CardHeader className="text-center">
          <ChefHat className="mx-auto h-16 w-16 text-accent mb-4" aria-hidden="true" />
          <CardTitle
            className="text-3xl font-bold tracking-tight text-accent"
            id="owner-portal-title"
          >
            Food Truck Owner Portal
          </CardTitle>
          <CardDescription>
            Welcome! Manage your food truck, access your dashboard, or get started with Truck Tracker.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7">
          <div className="flex flex-col gap-4">
            <Button
              asChild
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 rounded-xl shadow-md transition-all"
              aria-label="Owner Login"
            >
              <Link href="/owner/login" prefetch>
                <span>
                  <LogIn className="mr-2 h-6 w-6" aria-hidden="true" />
                  Owner Login
                </span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent text-lg py-6 rounded-xl transition-all"
              aria-label="Register Your Truck"
            >
              <Link href="/owner/signup" prefetch>
                <span>
                  <UserPlus className="mr-2 h-6 w-6" aria-hidden="true" />
                  Register Your Truck
                </span>
              </Link>
            </Button>
          </div>
          <div className="border-t border-border/30 pt-6 text-center">
            <div className="mb-3 text-muted-foreground font-medium flex items-center justify-center gap-2">
              <ArrowLeftCircle className="inline-block h-5 w-5 text-primary" aria-hidden="true" />
              Not an owner? Start exploring or join as a customer!
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
              <Button
                asChild
                variant="outline"
                className="w-full"
                aria-label="Find Food Trucks"
              >
                <Link href="/map" prefetch>
                <span>
                  <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
                  Find Food Trucks
                </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                className="w-full"
                aria-label="Customer Signup"
              >
                <Link href="/signup" prefetch>
                <span>
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Customer Signup
                </span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
