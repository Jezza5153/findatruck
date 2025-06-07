'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import MapStatsHeader from '@/components/MapStatsHeader';
import AnimatedLoader from '@/components/AnimatedLoader';
import { FilterControls } from '@/components/FilterControls';
import type { FoodTruck, MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { List, Map as MapIcon, Utensils, AlertTriangle, CircleCheck, Clock, MapPin, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import FoodTruckMap from '@/components/FoodTruckMap';
import Image from 'next/image';

type FiltersState = {
  cuisine?: string;
  distance?: number;
  openNow?: boolean;
  searchTerm?: string;
};

type TruckWithMenu = FoodTruck & {
  todaysMenuItems: MenuItem[];
  isHere: boolean;
};

function getLatLng(truck: FoodTruck): { lat?: number, lng?: number } {
  // Accepts top-level lat/lng OR inside currentLocation
  if (typeof truck.lat === 'number' && typeof truck.lng === 'number') {
    return { lat: truck.lat, lng: truck.lng };
  }
  if (
    truck.currentLocation &&
    typeof truck.currentLocation.lat === 'number' &&
    typeof truck.currentLocation.lng === 'number'
  ) {
    return { lat: truck.currentLocation.lat, lng: truck.currentLocation.lng };
  }
  return {};
}

function getTodaysHours(truck: FoodTruck): string {
  if (typeof truck.todaysHours === 'string') return truck.todaysHours;
  if (typeof truck.todaysHours === 'object' && truck.todaysHours) {
    if (truck.todaysHours.open && truck.todaysHours.close)
      return `${truck.todaysHours.open}–${truck.todaysHours.close}`;
  }
  return '';
}

function getRatingStars(rating?: number, count?: number) {
  if (!rating || !count) return null;
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-1 ml-2">
      {[...Array(rounded)].map((_, i) => (
        <Star key={i} className="h-3 w-3 text-yellow-400" fill="yellow" />
      ))}
      <span className="text-xs text-muted-foreground">({count})</span>
    </span>
  );
}

function getTruckImageUrl(truck: FoodTruck) {
  return truck.imageUrl ||
    `https://placehold.co/400x200.png?text=${encodeURIComponent(truck.name || 'Food Truck')}`;
}

function TruckListCard({ truck }: { truck: TruckWithMenu }) {
  const { lat, lng } = getLatLng(truck);
  return (
    <div className="relative group border rounded-xl bg-card shadow-lg overflow-hidden hover:ring-2 hover:ring-primary/60 transition-all duration-200">
      <div className="w-full h-40 bg-muted flex items-center justify-center relative">
        <Image
          src={getTruckImageUrl(truck)}
          alt={truck.name}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-truck.jpg'; }}
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-lg">{truck.name}</span>
          {truck.isOpen ? (
            <span className="inline-flex items-center px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              <CircleCheck className="h-4 w-4 mr-1" /> Open Now
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
              Closed
            </span>
          )}
          {truck.isHere && typeof lat === 'number' && typeof lng === 'number' && (
            <span className="inline-flex items-center ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full animate-pulse">
              <MapPin className="h-3 w-3 mr-1" /> I’m Here!
            </span>
          )}
          {getRatingStars(truck.rating, truck.numberOfRatings)}
        </div>
        <div className="text-muted-foreground text-xs">{truck.cuisine || 'Cuisine unknown'}</div>
        <div className="text-muted-foreground text-sm">
          {truck.currentLocation?.address || truck.address || <span className="italic text-xs">Location not set</span>}
        </div>
        <div className="flex items-center text-xs gap-1 text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {getTodaysHours(truck) || truck.operatingHoursSummary || <span className="italic">Hours not set</span>}
        </div>
        {Array.isArray(truck.features) && truck.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {truck.features.map((f, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{f}</span>
            ))}
          </div>
        )}
        <div className="mt-3">
          <span className="font-medium text-primary">Today’s Menu:</span>
          {truck.todaysMenuItems.length ? (
            <ul className="pl-4 mt-1">
              {truck.todaysMenuItems.map(item => (
                <li key={item.id} className="text-sm leading-tight">
                  {item.name} <span className="text-muted-foreground">${item.price?.toFixed(2) || ''}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground italic">Not published for today</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [trucks, setTrucks] = useState<TruckWithMenu[]>([]);
  const [filters, setFilters] = useState<FiltersState>({});
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch trucks and today's menu items
  useEffect(() => {
    let ignore = false;
    async function fetchTrucks() {
      setIsLoading(true);
      setError(null);
      try {
        const trucksCollectionRef = collection(db, "trucks");
        const trucksSnap = await getDocs(trucksCollectionRef);

        const baseTrucks: FoodTruck[] = trucksSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed Truck',
            cuisine: data.cuisine || 'Unknown Cuisine',
            description: data.description || '',
            imageUrl: data.imageUrl,
            address: data.address,
            lat: typeof data.lat === 'number' ? data.lat : undefined,
            lng: typeof data.lng === 'number' ? data.lng : undefined,
            operatingHoursSummary: data.operatingHoursSummary || '',
            isOpen: typeof data.isOpen === 'boolean' ? data.isOpen : undefined,
            isVisible: typeof data.isVisible === 'boolean' ? data.isVisible : true,
            rating: typeof data.rating === 'number' ? data.rating : undefined,
            numberOfRatings: typeof data.numberOfRatings === 'number' ? data.numberOfRatings : undefined,
            features: Array.isArray(data.features) ? data.features : [],
            currentLocation: data.currentLocation,
            todaysMenu: Array.isArray(data.todaysMenu) ? data.todaysMenu : [],
            todaysHours: typeof data.todaysHours === 'string'
              ? data.todaysHours
              : typeof data.todaysHours === 'object' && data.todaysHours
                ? { open: data.todaysHours.open, close: data.todaysHours.close }
                : undefined,
            testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
          };
        });

        // Fetch today's menu items for each truck
        const fullTrucks: TruckWithMenu[] = await Promise.all(
          baseTrucks.map(async (truck) => {
            let todaysMenuItems: MenuItem[] = [];
            if (truck.todaysMenu && truck.todaysMenu.length) {
              const itemsSnap = await getDocs(collection(db, "trucks", truck.id, "menuItems"));
              todaysMenuItems = itemsSnap.docs
                .filter(itemDoc => truck.todaysMenu!.includes(itemDoc.id))
                .map(itemDoc => ({
                  id: itemDoc.id,
                  ...(itemDoc.data() as MenuItem),
                }));
            }
            const { lat, lng } = getLatLng(truck);
            const isHere = Boolean(
              truck.isOpen === true &&
              truck.isVisible !== false &&
              typeof lat === 'number' &&
              typeof lng === 'number'
            );
            return {
              ...truck,
              todaysMenuItems,
              isHere,
            };
          })
        );

        if (!ignore) {
          setTrucks(fullTrucks);
        }
      } catch (err: any) {
        setError("Could not load food truck data. Please try again later.");
        toast({
          title: "Error Loading Trucks",
          description: err.message || "Unknown error occurred.",
          variant: "destructive"
        });
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    fetchTrucks();
    return () => { ignore = true; };
  }, [toast]);

  // --- Memoized filtering ---
  const filteredTrucks = useMemo(() => {
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
    return currentTrucks;
  }, [filters, trucks]);

  // --- Filter/locate me handlers ---
  const handleFilterChange = useCallback((newFilters: FiltersState) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
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
                filteredTrucks.map(truck => <TruckListCard key={truck.id} truck={truck} />)
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
