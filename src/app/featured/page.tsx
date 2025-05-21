
'use client';
import { Star, Loader2 } from 'lucide-react';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FeaturedTrucksPage() {
  const [featuredTrucks, setFeaturedTrucks] = useState<FoodTruck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedTrucks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, fetch from '/api/trucks/featured'
        // For now, simulating a delay and an empty response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeaturedTrucks([]); // Simulate no featured trucks
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedTrucks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Star className="h-16 w-16 text-yellow-400 fill-yellow-400 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Featured Food Trucks</h1>
        <p className="text-lg text-muted-foreground">
          Discover our top-rated and premium partner trucks.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading featured trucks...</p>
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Featured Trucks</AlertTitle>
          <AlertDescription>{error}. Please try again later.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && featuredTrucks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrucks.map(truck => (
            <FoodTruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}

      {!isLoading && !error && featuredTrucks.length === 0 && (
        <div className="text-center py-10">
          <Star className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
          <p className="text-xl font-semibold text-muted-foreground mb-4">No featured trucks at the moment.</p>
          <p className="text-muted-foreground mb-6">Check back soon or explore all trucks on the map!</p>
          <Button asChild>
            <Link href="/map">Explore All Trucks</Link>
          </Button>
        </div>
      )}

      <div className="mt-16 text-center p-8 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold text-primary mb-4">Are you a Food Truck Owner?</h2>
        <p className="text-muted-foreground mb-6">
          Want to get your truck featured and reach more customers? 
          Learn about our premium listing options and benefits.
        </p>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
          <Link href="/owner/portal">Owner Portal & Subscriptions</Link>
        </Button>
      </div>
    </div>
  );
}
