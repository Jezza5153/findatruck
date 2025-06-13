
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Star, MapPin, Utensils, UserPlus, ArrowRight, User, ChefHat, LogIn
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section
        className="w-full py-20 bg-gradient-to-r from-yellow-100 via-white to-green-50 shadow animate-fade-in"
        aria-labelledby="hero-title"
      >
        <div className="container mx-auto flex flex-col items-center text-center">
          <h1
            id="hero-title"
            className="text-5xl md:text-6xl font-extrabold mb-3 text-primary drop-shadow-lg"
          >
            Find Your Next Favorite Food Truck
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-xl mx-auto">
            Discover real-time locations, menus, and exclusive deals from the best food trucks in your city.
          </p>
          <Button
            size="lg"
            asChild
            className="px-8 py-4 text-lg rounded-2xl shadow-xl bg-primary hover:bg-primary/90 transition-transform duration-150"
            aria-label="Find Food Trucks"
          >
            <Link href="/map">
              <span className="flex items-center justify-center"> {/* Ensures single child */}
                Find Food Trucks
                <ArrowRight className="ml-3 w-5 h-5" />
              </span>
            </Link>
          </Button>
        </div>
      </section>

      {/* New User CTA Section */}
      <section className="w-full py-12 bg-white/90 mb-6 shadow-sm animate-fade-in" aria-label="Get Started">
        <div className="container mx-auto flex flex-col items-center gap-8">
          <h2 className="text-2xl font-semibold text-primary mb-2">Get Started</h2>
          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg py-6 px-6 flex items-center justify-center gap-3 shadow-md"
              aria-label="Sign up as Customer"
            >
              <Link href="/signup">
                <span className="flex items-center justify-center gap-3"> {/* Ensures single child */}
                  <User className="w-6 h-6" /> I am a New Customer
                </span>
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-lg py-6 px-6 flex items-center justify-center gap-3 shadow-md"
              aria-label="Sign up as Owner"
            >
              <Link href="/owner/signup">
                <span className="flex items-center justify-center gap-3"> {/* Ensures single child */}
                  <ChefHat className="w-6 h-6" /> I am a New Owner
                </span>
              </Link>
            </Button>
          </div>
          <div className="mt-2 text-base text-muted-foreground flex items-center gap-2">
            Already have an account?
            <Link
              href="/login"
              className="inline-flex items-center text-primary font-semibold hover:underline ml-1"
              aria-label="Login"
            >
              <LogIn className="w-4 h-4 mr-1" />
              Log in here
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Trucks Preview */}
      <section className="container mx-auto py-12 animate-fade-in" aria-labelledby="featured-title">
        <h2
          id="featured-title"
          className="text-3xl font-bold mb-8 text-primary flex items-center"
        >
          <Star className="h-7 w-7 text-yellow-400 fill-yellow-400 mr-2" />
          Featured Trucks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FoodTruckCard
            truck={{
              id: "demo1",
              name: "Burger Bros",
              cuisine: "American",
              description: "Juicy burgers, loaded fries, cold shakes. The best on four wheels.",
              imageUrl: "https://placehold.co/400x200.png",
              ownerUid: "",
              address: "Main Square",
              isOpen: true,
              rating: 4.8,
              isFeatured: true,
              imagePath: "burger food", 
            }}
          />
          <FoodTruckCard
            truck={{
              id: "demo2",
              name: "Sushi Street",
              cuisine: "Japanese",
              description: "Fresh hand-rolled sushi, onigiri, and Asian bowls.",
              imageUrl: "https://placehold.co/400x200.png",
              ownerUid: "",
              address: "Market Park",
              isOpen: false,
              rating: 4.7,
              isFeatured: true,
              imagePath: "sushi japanese", 
            }}
          />
          <FoodTruckCard
            truck={{
              id: "demo3",
              name: "Taco Town",
              cuisine: "Mexican",
              description: "Tacos, nachos, burritos, and street corn—fresh & spicy.",
              imageUrl: "https://placehold.co/400x200.png",
              ownerUid: "",
              address: "Harbor Walk",
              isOpen: true,
              rating: 4.9,
              isFeatured: true,
              imagePath: "taco mexican", 
            }}
          />
        </div>
        <div className="text-center mt-8">
          <Link href="/featured" className={cn(buttonVariants({ variant: "outline" }))}>
            <span>See All Featured</span>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-muted/60 py-14 animate-fade-in" aria-labelledby="how-it-works-title">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-primary" id="how-it-works-title">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row justify-center gap-10">
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <MapPin className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">1. Find Nearby Trucks</h3>
              <p className="text-muted-foreground">
                Browse the live map, check menus and hours.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <Utensils className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">2. Order & Enjoy</h3>
              <p className="text-muted-foreground">
                Order online or at the truck, skip the queue.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <Star className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">3. Rate & Share</h3>
              <p className="text-muted-foreground">
                Review your favorites and help others find great eats!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Food Truck Owners */}
      <section className="container mx-auto py-14 text-center animate-fade-in" aria-labelledby="owner-cta-title">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center" id="owner-cta-title">
            <UserPlus className="h-7 w-7 text-accent mr-2" /> Own a Food Truck?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Join the network, reach thousands of new customers, and grow your business.
          </p>
          <Link href="/owner/billing" className={cn(buttonVariants({ size: "lg" }))}>
            <span>List Your Truck (Owner Portal)</span>
          </Link>
        </div>
      </section>

      {/* Fade-in Animation */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.23,1.12,.69,.88) both; }
      `}</style>
    </div>
  );
}
