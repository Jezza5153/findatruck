'use client';

import Link from 'next/link';
import { Star, MapPin, Utensils, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapStatsHeader from '@/components/MapStatsHeader'; // <- This is your stats bar!
import { FoodTruckCard } from '@/components/FoodTruckCard';
// If you want to fetch featured trucks, import db and run a fetch in useEffect
// Or pass in demo data for now!

export default function HomePage() {
  return (
    <div>
      {/* Live stats bar */}
      <section className="mb-6">
        <MapStatsHeader />
      </section>

      {/* Hero Section */}
      <section className="w-full py-16 bg-gradient-to-r from-yellow-200 via-white to-green-100 mb-6 shadow-md">
        <div className="container mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-3 text-primary drop-shadow-lg">
            Find Your Next Favorite Food Truck
          </h1>
          <p className="text-lg md:text-2xl mb-6 text-muted-foreground max-w-xl">
            Discover real-time locations, menus, and exclusive deals from the best food trucks in your city.
          </p>
          <Button size="lg" asChild className="mt-3 px-8 py-4 text-lg rounded-xl shadow-xl bg-primary hover:bg-primary/90">
            <Link href="/map">
              <span>Find Food Trucks</span>
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Trucks Preview */}
      <section className="container mx-auto py-10">
        <h2 className="text-3xl font-bold mb-8 text-primary flex items-center">
          <Star className="h-7 w-7 text-yellow-400 fill-yellow-400 mr-2" /> Featured Trucks
        </h2>
        {/* Replace below with actual featured trucks from Firestore if you want */}
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
          <Button variant="outline" asChild>
            <Link href="/featured">See All Featured</Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full bg-muted py-14">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-primary">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center gap-10">
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">1. Find Nearby Trucks</h3>
              <p className="text-muted-foreground">Browse the live map, check menus and hours.</p>
            </div>
            <div className="flex flex-col items-center">
              <Utensils className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">2. Order & Enjoy</h3>
              <p className="text-muted-foreground">Order online or at the truck, skip the queue.</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">3. Rate & Share</h3>
              <p className="text-muted-foreground">Review your favorites and help others find great eats!</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Food Truck Owners */}
      <section className="container mx-auto py-14 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-accent mr-2" /> Own a Food Truck?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Join the network, reach thousands of new customers, and grow your business.
          </p>
          <Button size="lg" asChild>
            <Link href="/owner/billing">List Your Truck (Owner Portal)</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
