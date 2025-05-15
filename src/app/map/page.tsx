'use client';
import { useState, useEffect } from 'react';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { FilterControls } from '@/components/FilterControls';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockTrucksData: FoodTruck[] = [
  {
    id: "1", name: "Taco 'Bout Delicious", cuisine: "Mexican", rating: 4.8,
    imageUrl: "https://placehold.co/400x200.png", description: "Authentic Mexican street tacos with a modern twist. Best carnitas in town!",
    menu: [], hours: "11am - 8pm", isOpen: true, distance: "0.5 miles",
    location: { lat: 34.0522, lng: -118.2437, address: "123 Main St, Los Angeles" }
  },
  {
    id: "2", name: "Pizza Wheels", cuisine: "Italian", rating: 4.5,
    imageUrl: "https://placehold.co/400x200.png", description: "Wood-fired pizzas made with fresh, local ingredients. Try our margherita!",
    menu: [], hours: "12pm - 9pm", isOpen: false, distance: "1.2 miles",
    location: { lat: 34.0550, lng: -118.2500, address: "456 Oak Ave, Los Angeles" }
  },
  {
    id: "3", name: "Curry Up Now", cuisine: "Indian", rating: 4.7,
    imageUrl: "https://placehold.co/400x200.png", description: "Flavorful Indian curries and street food delights. Butter chicken is a must!",
    menu: [], hours: "11:30am - 7:30pm", isOpen: true, distance: "2.5 miles",
    location: { lat: 34.0600, lng: -118.2450, address: "789 Pine Ln, Los Angeles" }
  },
  {
    id: "4", name: "Burger Bliss", cuisine: "Burgers", rating: 4.2,
    imageUrl: "https://placehold.co/400x200.png", description: "Gourmet burgers with all the fixings. Don't miss the truffle fries.",
    menu: [], hours: "10am - 10pm", isOpen: true, distance: "0.8 miles",
    location: { lat: 34.0480, lng: -118.2400, address: "321 Elm Rd, Los Angeles" }
  },
];


export default function MapPage() {
  const [filteredTrucks, setFilteredTrucks] = useState<FoodTruck[]>(mockTrucksData);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { toast } = useToast();

  // Effect to apply filters when filters or mockTrucksData change
  useEffect(() => {
    let trucks = mockTrucksData;
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
                  No food trucks match your current filters. Try expanding your search!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
