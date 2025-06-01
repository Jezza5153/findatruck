'use client';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { FilterControls } from '@/components/FilterControls';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon, Loader2, Utensils } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, getDocs, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import dynamic from "next/dynamic";
import { FoodTruckCard } from '@/components/FoodTruckCard';

// Dynamically import map to prevent SSR errors
const FoodTruckMap = dynamic(() => import('@/components/FoodTruckMap'), {
  ssr: false,
});

export default function MapPage() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<FoodTruck[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrucks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const trucksCollectionRef = collection(db, "trucks");
        const querySnapshot = await getDocs(trucksCollectionRef);
        const fetchedTrucks: FoodTruck[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          fetchedTrucks.push({
            id: doc.id,
            name: data.name || 'Unnamed Truck',
            cuisine: data.cuisine || 'Unknown Cuisine',
            description: data.description || 'No description available.',
            imageUrl: data.imageUrl || `https://placehold.co/400x200.png?text=${encodeURIComponent(data.name || 'Food Truck')}`,
            ownerUid: data.ownerUid || '',
            // Map compatibility: lat/lng/address are top-level for this UI
            lat: typeof data.lat === 'number' ? data.lat : undefined,
            lng: typeof data.lng === 'number' ? data.lng : undefined,
            address: data.address || undefined,
            operatingHoursSummary: data.operatingHoursSummary || 'Hours not specified',
            isOpen: data.isOpen === undefined ? undefined : Boolean(data.isOpen),
            rating: typeof data.rating === 'number' ? data.rating : undefined,
            menu: Array.isArray(data.menu) ? data.menu : [],
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
          });
        });        
        setTrucks(fetchedTrucks);
        setFilteredTrucks(fetchedTrucks);
      } catch (err) {
        let errorMessage = "Could not load food truck data. Please try again later.";
        if (err instanceof Error && err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast({
          title: "Error Loading Trucks",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrucks();
  }, [toast]);

  useEffect(() => {
    let currentTrucks = [...trucks];
    if (filters.cuisine) {
      currentTrucks = currentTrucks.filter(truck =>
        truck.cuisine.toLowerCase() === filters.cuisine.toLowerCase()
      );
    }
    if (filters.openNow) {
      currentTrucks = currentTrucks.filter(truck => truck.isOpen === true);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      currentTrucks = currentTrucks.filter(truck =>
        truck.name.toLowerCase().includes(term) ||
        (truck.description && truck.description.toLowerCase().includes(term)) ||
        truck.cuisine.toLowerCase().includes(term)
      );
    }
    // Sort open trucks first
    currentTrucks.sort((a, b) => (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0));
    setFilteredTrucks(currentTrucks);
  }, [filters, trucks]);

  const handleFilterChange = (newFilters: any) => setFilters(newFilters);

  const handleLocateMe = () => {
    toast({
      title: "Locating You...",
      description: "Centering map on your current location. (Feature coming soon!)",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <FilterControls onFilterChange={handleFilterChange} onLocateMe={handleLocateMe} />
        </div>

        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-4 flex justify-end">
            <Button
              variant="outline"
              aria-label={viewMode === 'map' ? "Switch to List View" : "Switch to Map View"}
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            >
              {viewMode === 'map' ? <List className="mr-2 h-4 w-4" /> : <MapIcon className="mr-2 h-4 w-4" />}
              {viewMode === 'map' ? 'List View' : 'Map View'}
            </Button>
          </div>
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-lg">Loading food trucks...</p>
            </div>
          )}
          {error && !isLoading && (
            <Alert variant="destructive">
              <AlertTitle>Error Loading Trucks</AlertTitle>
              <AlertDescription>{error}. Please try refreshing the page or check back later.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && viewMode === 'map' && (
            <FoodTruckMap trucks={filteredTrucks} />
          )}
          {!isLoading && !error && viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrucks.length > 0 ? (
                filteredTrucks.map(truck => <FoodTruckCard key={truck.id} truck={truck} />)
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-10">
                  <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-xl font-semibold">No Food Trucks Found</p>
                  <p className="text-sm">Try adjusting your filters or check back later as new trucks join!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
