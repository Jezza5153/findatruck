'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Utensils, UserPlus, ArrowRight, User, ChefHat, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import { Page, PageSection, PageHeader, Container } from '@/design/layout';
import { H1 } from '@/design/typography';
// If you have a floating stats bar elsewhere, don't import MapStatsHeader here

export default function HomePage() {
  return (
    <Page className="relative">
      {/* Floating stats bar appears only as a floater, not here */}

      <PageSection className="w-full py-20 bg-gradient-to-r from-yellow-100 via-white to-green-50 shadow animate-fade-in">
        <Container className="flex flex-col items-center text-center">
          <PageHeader
            title={<H1 className="text-primary drop-shadow-lg">Find Your Next Favorite Food Truck</H1>}
            description="Discover real-time locations, menus, and exclusive deals from the best food trucks in your city."
            actions={
              <Button
                size="lg"
                asChild
                className="px-8 py-4 text-lg rounded-2xl shadow-xl bg-primary hover:bg-primary/90 transition-transform duration-150"
                aria-label="Find Food Trucks"
              >
                <Link href="/map">
                  <span>Find Food Trucks</span>
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </Button>
            }
          />
        </Container>
      </PageSection>

      {/* New User CTA Section */}
      <PageSection className="w-full py-12 bg-white/90 mb-6 shadow-sm animate-fade-in" aria-label="Get Started">
        <Container className="flex flex-col items-center gap-8">
          <h2 className="text-2xl font-semibold text-primary mb-2">Get Started</h2>
          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-lg">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg py-6 px-6 flex items-center justify-center gap-3 shadow-md"
              aria-label="Sign up as Customer"
            >
              <Link href="/signup">
                <User className="w-6 h-6" />
                I am a New Customer
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-lg py-6 px-6 flex items-center justify-center gap-3 shadow-md"
              aria-label="Sign up as Owner"
            >
              <Link href="/owner/signup">
                <ChefHat className="w-6 h-6" />
                I am a New Owner
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
        </Container>
      </PageSection>

      {/* Featured Trucks Preview */}
      <PageSection className="py-12 animate-fade-in" aria-labelledby="featured-title">
        <Container>
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
              imageUrl: "https://placehold.co/400x200/burger",
              ownerUid: "",
              address: "Main Square",
              isOpen: true,
              rating: 4.8,
              isFeatured: true,
            }}
          />
          <FoodTruckCard
            truck={{
              id: "demo2",
              name: "Sushi Street",
              cuisine: "Japanese",
              description: "Fresh hand-rolled sushi, onigiri, and Asian bowls.",
              imageUrl: "https://placehold.co/400x200/sushi",
              ownerUid: "",
              address: "Market Park",
              isOpen: false,
              rating: 4.7,
              isFeatured: true,
            }}
          />
          <FoodTruckCard
            truck={{
              id: "demo3",
              name: "Taco Town",
              cuisine: "Mexican",
              description: "Tacos, nachos, burritos, and street corn—fresh & spicy.",
              imageUrl: "https://placehold.co/400x200/taco",
              ownerUid: "",
              address: "Harbor Walk",
              isOpen: true,
              rating: 4.9,
              isFeatured: true,
            }}
          />
        </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild aria-label="See All Featured Trucks">
              <Link href="/featured">See All Featured</Link>
            </Button>
          </div>
        </Container>
      </PageSection>

      {/* How It Works */}
      <PageSection className="w-full bg-muted/60 py-14 animate-fade-in" aria-labelledby="how-it-works-title">
        <Container className="text-center">
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
        </Container>
      </PageSection>

      {/* For Food Truck Owners */}
      <PageSection className="py-14 text-center animate-fade-in" aria-labelledby="owner-cta-title">
        <Container className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center" id="owner-cta-title">
            <UserPlus className="h-7 w-7 text-accent mr-2" /> Own a Food Truck?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Join the network, reach thousands of new customers, and grow your business.
          </p>
          <Button size="lg" asChild aria-label="List Your Truck">
            <Link href="/owner/billing">List Your Truck (Owner Portal)</Link>
          </Button>
        </Container>
      </PageSection>

      {/* Fade-in Animation */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: none;}
        }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.23,1.12,.69,.88) both; }
      `}</style>
    </Page>
  );
}
