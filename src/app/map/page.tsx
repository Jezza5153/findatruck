'use client';
import { useState, useEffect } from 'react';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { FilterControls } from '@/components/FilterControls';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockTrucksData: FoodTruck[] = []; // No more mock data

export default function MapPage() {
  const [filteredTrucks, setFilteredTrucks] = useState<FoodTruck[]>([]); // Start with empty
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { toast } = useToast();

  // Effect to apply filters when filters or mockTrucksData change
  useEffect(() => {
    let trucks = mockTrucksData; // Will be empty initially
    if (filters.cuisine) {
      trucks = trucks.filter(truck => truck.cuisine.toLowerCase() === filters.cuisine.toLowerCase());
    }
    if (filters.openNow) {
      trucks = trucks.filter(truck => truck.isOpen);
    }
    if (filters.searchTerm) {
      trucks = trucks.filter(truck => 
        truck.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        truck.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        truck.cuisine.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }
    // Placeholder for distance filtering - actual implementation would require truck.distance to be a number
    // and user's location. For now, we assume truck.distance is a string and don't filter by it.
    // If `filters.distance` (max distance from slider) is set:
    // trucks = trucks.filter(truck => parseFloat(truck.distance) <= filters.distance);

    setFilteredTrucks(trucks);
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleLocateMe = () => {
    // Placeholder for geolocation logic
    toast({
      title: "Locating You...",
      description: "Centering map on your current location. (Feature coming soon!)",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4 lg:w-1/5">
          <FilterControls onFilterChange={handleFilterChange} onLocateMe={handleLocateMe} />
        </div>

        {/* Map/List View */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="mb-4 flex justify-end">
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
              {viewMode === 'map' ? <List className="mr-2 h-4 w-4" /> : <MapIcon className="mr-2 h-4 w-4" />}
              {viewMode === 'map' ? 'List View' : 'Map View'}
            </Button>
          </div>

          {viewMode === 'map' && <MapPlaceholder />}
          
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrucks.length > 0 ? (
                filteredTrucks.map(truck => <FoodTruckCard key={truck.id} truck={truck} />)
              ) : (
                <p className="col-span-full text-center text-muted-foreground">
                  No food trucks match your current filters. Try expanding your search or check back later!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
