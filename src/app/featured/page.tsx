
'use client';

import { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function FeaturedTrucksPage() {
  const [featuredTrucks, setFeaturedTrucks] = useState<FoodTruck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchFeaturedTrucks() {
      setIsLoading(true);
      setError(null);
      try {
        const trucksCollectionRef = collection(db, "trucks");
        const q = query(trucksCollectionRef, where("isFeatured", "==", true));
        const querySnapshot = await getDocs(q);

        const fetchedTrucks: FoodTruck[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() || {};
          fetchedTrucks.push({
            id: doc.id,
            name: data.name || 'Unnamed Truck',
            cuisine: data.cuisine || 'Unknown Cuisine',
            description: data.description || 'No description provided.',
            imageUrl: data.imageUrl || `https://placehold.co/400x200.png?text=${encodeURIComponent(data.name || 'Food Truck')}`,
            ownerUid: data.ownerUid || '',
            address: data.address || '',
            lat: typeof data.lat === "number" ? data.lat : undefined,
            lng: typeof data.lng === "number" ? data.lng : undefined,
            operatingHoursSummary: data.operatingHoursSummary || '',
            isOpen: typeof data.isOpen === "boolean" ? data.isOpen : undefined,
            isVisible: typeof data.isVisible === "boolean" ? data.isVisible : undefined,
            rating: typeof data.rating === "number" ? data.rating : undefined,
            numberOfRatings: typeof data.numberOfRatings === "number" ? data.numberOfRatings : undefined,
            features: Array.isArray(data.features) ? data.features : [],
            currentLocation: data.currentLocation,
            todaysMenu: Array.isArray(data.todaysMenu) ? data.todaysMenu : [],
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
            isFeatured: true,
          });
        });
        setFeaturedTrucks(fetchedTrucks);
      } catch (err: any) {
        setError(err?.message || 'Could not load featured food trucks.');
        toast({
          title: "Error Loading Trucks",
          description: err?.message || "Could not load featured food trucks.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeaturedTrucks();
  }, [toast]);

  return (
    <main className="container mx-auto px-4 py-8" role="main" aria-labelledby="featured-trucks-heading">
      <div className="text-center mb-12">
        <Star className="h-16 w-16 text-yellow-400 fill-yellow-400 mx-auto mb-4" aria-hidden="true" />
        <h1 id="featured-trucks-heading" className="text-4xl md:text-5xl font-bold text-primary mb-2">
          Featured Food Trucks
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover top-rated and premium partner trucks—curated for your next food adventure.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-10" aria-busy="true">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading" />
          <span className="ml-4 text-lg">Loading featured trucks...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex justify-center">
          <Alert variant="destructive" className="max-w-lg w-full">
            <AlertTitle>Error Loading Featured Trucks</AlertTitle>
            <AlertDescription>{error}. Please try again later.</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Trucks List */}
      {!isLoading && !error && featuredTrucks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Featured Trucks">
          {featuredTrucks.map(truck => (
            <FoodTruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}

      {/* No Trucks */}
      {!isLoading && !error && featuredTrucks.length === 0 && (
        <div className="text-center py-10" aria-label="No featured trucks">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-5" />
          <p className="text-xl font-semibold text-muted-foreground mb-3">No featured trucks yet.</p>
          <p className="text-muted-foreground mb-6">
            Check back soon or browse all trucks on the map!
          </p>
          <Button asChild>
            <Link href="/map"><span>Explore All Trucks</span></Link>
          </Button>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center p-8 bg-muted rounded-2xl shadow-md mb-8" aria-label="Owner Call To Action">
        <h2 className="text-2xl font-semibold text-primary mb-3">Are you a Food Truck Owner?</h2>
        <p className="text-muted-foreground mb-5">
          Want to get featured and reach more hungry customers?
          Learn about premium listing options and owner benefits!
        </p>
        <Button size="lg" asChild>
          <Link href="/owner/billing"><span>Owner Portal &amp; Subscriptions</span></Link>
        </Button>
      </div>
    </main>
  );
}
