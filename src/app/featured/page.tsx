
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
import { makeSerializable } from '@/lib/makeSerializable';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';


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
          const rawData = doc.data() || {};
          const serializableData = makeSerializable(rawData); // Make data serializable

          fetchedTrucks.push({
            id: doc.id,
            name: serializableData.name || 'Unnamed Truck',
            cuisine: serializableData.cuisine || 'Unknown Cuisine',
            description: serializableData.description || 'No description provided.',
            imageUrl: serializableData.imageUrl || `https://placehold.co/400x200.png?text=${encodeURIComponent(serializableData.name || 'Food Truck')}`,
            ownerUid: serializableData.ownerUid || '',
            address: serializableData.address || '',
            lat: typeof serializableData.lat === "number" ? serializableData.lat : undefined,
            lng: typeof serializableData.lng === "number" ? serializableData.lng : undefined,
            operatingHoursSummary: serializableData.operatingHoursSummary || '',
            isOpen: typeof serializableData.isOpen === "boolean" ? serializableData.isOpen : undefined,
            isVisible: typeof serializableData.isVisible === "boolean" ? serializableData.isVisible : undefined,
            rating: typeof serializableData.rating === "number" ? serializableData.rating : undefined,
            numberOfRatings: typeof serializableData.numberOfRatings === "number" ? serializableData.numberOfRatings : undefined,
            features: Array.isArray(serializableData.features) ? serializableData.features : [],
            currentLocation: serializableData.currentLocation,
            todaysMenu: Array.isArray(serializableData.todaysMenu) ? serializableData.todaysMenu : [],
            testimonials: Array.isArray(serializableData.testimonials) ? serializableData.testimonials : [],
            isFeatured: true,
            // Ensure all other FoodTruck fields are mapped from serializableData
            imagePath: serializableData.imagePath,
            imageGallery: Array.isArray(serializableData.imageGallery) ? serializableData.imageGallery : [],
            todaysHours: serializableData.todaysHours,
            regularHours: serializableData.regularHours,
            specialHours: Array.isArray(serializableData.specialHours) ? serializableData.specialHours : [],
            isTruckOpenOverride: serializableData.isTruckOpenOverride === undefined ? null : serializableData.isTruckOpenOverride,
            tags: Array.isArray(serializableData.tags) ? serializableData.tags : [],
            socialMediaLinks: serializableData.socialMediaLinks || {},
            websiteUrl: serializableData.websiteUrl || '',
            contactEmail: serializableData.contactEmail || '',
            phone: serializableData.phone || '',
            subscriptionTier: serializableData.subscriptionTier || 'free',
            isFavorite: typeof serializableData.isFavorite === "boolean" ? serializableData.isFavorite : false,
            createdAt: serializableData.createdAt, // Will be string | null
            updatedAt: serializableData.updatedAt, // Will be string | null
            distance: serializableData.distance || '',
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

      {isLoading && (
        <div className="flex justify-center items-center py-10" aria-busy="true">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-label="Loading" />
          <span className="ml-4 text-lg">Loading featured trucks...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex justify-center">
          <Alert variant="destructive" className="max-w-lg w-full">
            <AlertTitle>Error Loading Featured Trucks</AlertTitle>
            <AlertDescription>{error}. Please try again later.</AlertDescription>
          </Alert>
        </div>
      )}

      {!isLoading && !error && featuredTrucks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Featured Trucks">
          {featuredTrucks.map(truck => (
            <FoodTruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}

      {!isLoading && !error && featuredTrucks.length === 0 && (
        <div className="text-center py-10" aria-label="No featured trucks"> {/* Keep the outer div for layout */}
          <> {/* Wrap inner elements in a fragment */}
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-5" />
            <p className="text-xl font-semibold text-muted-foreground mb-3">No featured trucks yet.</p>
            <p className="text-muted-foreground mb-6">
              Check back soon or browse all trucks on the map!
            </p>
            <Link href="/map" className={cn(buttonVariants())}>
               <span>Explore All Trucks</span>
            </Link>
          </>
        </div>
      )}

      <div className="mt-16 text-center p-8 bg-muted rounded-2xl shadow-md mb-8" aria-label="Owner Call To Action">
        <h2 className="text-2xl font-semibold text-primary mb-3">Are you a Food Truck Owner?</h2>
        <p className="text-muted-foreground mb-5">
          Want to get featured and reach more hungry customers?
          Learn about premium listing options and owner benefits!
        </p>
        <> {/* Wrap inner elements in a fragment */}
          <Link href="/owner/billing" className={cn(buttonVariants({ size: "lg" }))}>
              <span>Owner Portal &amp; Subscriptions</span>
          </Link>
        </>
      </div>
    </main>
  );
}
