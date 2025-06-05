'use client';
import { useState, useEffect, useCallback } from 'react';
import MapStatsHeader from '@/components/MapStatsHeader';
import AnimatedLoader from '@/components/AnimatedLoader';
import { FilterControls } from '@/components/FilterControls';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon, Utensils, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, getDocs, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import FoodTruckMap from '@/components/FoodTruckMap';
import { FoodTruckCard } from '@/components/FoodTruckCard';

type FiltersState = {
  cuisine?: string;
  distance?: number;
  openNow?: boolean;
  searchTerm?: string;
};

export default function MapPage() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<FoodTruck[]>([]);
  const [filters, setFilters] = useState<FiltersState>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch trucks from Firestore
  useEffect(() => {
    let ignore = false;
    const fetchTrucks = async () => {
      if (!db) {
        setError("Database service is not available. Please try again later.");
        setIsLoading(false);
        toast({ title: "Database Error", description: "Could not connect to the database.", variant: "destructive"});
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const trucksCollectionRef = collection(db, "trucks");
        const querySnapshot = await getDocs(trucksCollectionRef);
        const fetchedTrucks: FoodTruck[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data() as Partial<FoodTruck>;
          fetchedTrucks.push({
            id: doc.id,
            name: data.name || 'Unnamed Truck',
            cuisine: data.cuisine || 'Unknown Cuisine',
            description: data.description || 'No description available.',
            imageUrl: data.imageUrl || `https://placehold.co/400x200.png?text=${encodeURIComponent(data.name || 'Food Truck')}`,
            ownerUid: data.ownerUid || '',
            lat: typeof data.lat === 'number' ? data.lat : undefined,
            lng: typeof data.lng === 'number' ? data.lng : undefined,
            address: data.address || undefined,
            operatingHoursSummary: data.operatingHoursSummary || 'Hours not specified',
            isOpen: typeof data.isOpen === 'boolean' ? data.isOpen : undefined,
            rating: typeof data.rating === 'number' ? data.rating : undefined,
            menu: Array.isArray(data.menu) ? data.menu : [],
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
            isFeatured: typeof data.isFeatured === 'boolean' ? data.isFeatured : undefined,
          });
        });
        if (!ignore) {
          setTrucks(fetchedTrucks);
          setFilteredTrucks(fetchedTrucks);
        }
      } catch (err: any) {
        console.error("Error fetching trucks:", err);
        let errorMessage = "Could not load food truck data. Please try again later.";
        if (err.message) errorMessage = err.message;
        setError(errorMessage);
        toast({
          title: "Error Loading Trucks",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchTrucks();
    return () => { ignore = true; };
  }, [toast]);

  // Filter trucks when filters or truck list changes
  useEffect(() => {
    let currentTrucks = [...trucks];
    if (filters.cuisine && filters.cuisine !== '') {
      currentTrucks = currentTrucks.filter(truck =>
        truck.cuisine.toLowerCase() === filters.cuisine?.toLowerCase()
      );
    }
    if (filters.openNow) {
      currentTrucks = currentTrucks.filter(truck => truck.isOpen === true);
    }
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const term = filters.searchTerm.toLowerCase().trim();
      currentTrucks = currentTrucks.filter(truck =>
        truck.name.toLowerCase().includes(term) ||
        (truck.description && truck.description.toLowerCase().includes(term)) ||
        truck.cuisine.toLowerCase().includes(term)
      );
    }
    setFilteredTrucks(currentTrucks);
  }, [filters, trucks]);

  const handleFilterChange = useCallback((newFilters: FiltersState) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);
  
  const handleLocateMe = useCallback(() => {
    toast({
      title: "Locating You...",
      description: "Map will attempt to center on your current location.",
    });
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <MapStatsHeader />
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 md:sticky md:top-20 h-fit">
          <FilterControls 
            onFilterChange={handleFilterChange} 
            onLocateMe={handleLocateMe}
          />
        </aside>
        <main className="w-full md:w-3/4 lg:w-4/5">
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
          {isLoading && <AnimatedLoader />}
          {error && !isLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
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
        </main>
      </div>
    </div>
  );
}
