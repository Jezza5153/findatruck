
'use client';
import { useState, useEffect } from 'react';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { FilterControls } from '@/components/FilterControls';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
        // In a real app, you'd fetch from your actual API endpoint
        // For now, simulating a delay and an empty response
        // const response = await fetch('/api/trucks'); // Replace with your actual API
        // if (!response.ok) {
        //   throw new Error('Failed to fetch trucks');
        // }
        // const data = await response.json();
        // setTrucks(data);

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setTrucks([]); // Simulate fetching and getting no trucks initially

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        toast({
          title: "Error",
          description: "Could not load food truck data. Please try again later.",
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
      currentTrucks = currentTrucks.filter(truck => truck.cuisine.toLowerCase() === filters.cuisine.toLowerCase());
    }
    if (filters.openNow) {
      currentTrucks = currentTrucks.filter(truck => truck.isOpen);
    }
    if (filters.searchTerm) {
      currentTrucks = currentTrucks.filter(truck => 
        truck.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (truck.description && truck.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
        truck.cuisine.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    setFilteredTrucks(currentTrucks);
  }, [filters, trucks]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

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
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
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
             <MapPlaceholder /> // In a real app, pass `filteredTrucks` to your actual map component
          )}
          
          {!isLoading && !error && viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrucks.length > 0 ? (
                filteredTrucks.map(truck => <FoodTruckCard key={truck.id} truck={truck} />)
              ) : (
                <p className="col-span-full text-center text-muted-foreground py-10">
                  No food trucks match your current filters or are available in your area.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
