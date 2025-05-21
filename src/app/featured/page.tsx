
import { Star } from 'lucide-react';
import { FoodTruckCard } from '@/components/FoodTruckCard';
import type { FoodTruck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Placeholder data for featured trucks - replace with actual data fetching
const mockFeaturedTrucks: FoodTruck[] = [
  {
    id: "ft001",
    name: "Gourmet Grill Masters",
    cuisine: "American Fusion",
    rating: 4.9,
    imageUrl: "https://placehold.co/400x200.png?text=Gourmet+Grill",
    dataAiHint: "gourmet food",
    description: "Sizzling steaks, gourmet burgers, and unique fusion dishes. A premium experience on wheels!",
    menu: [], // Simplified for placeholder
    hours: "Mon-Fri: 11am-8pm, Sat: 12pm-10pm",
    isOpen: true,
    distance: "1.2 miles",
    location: { lat: 34.0522, lng: -118.2437, address: "123 Gourmet St, Los Angeles" },
    features: ["Online Ordering", "Accepts Cards", "Loyalty Program"],
    testimonials: [{id: "t1", name: "FoodieFan", quote: "Best steak sandwich ever!"}]
  },
  {
    id: "ft002",
    name: "The Wandering Wok",
    cuisine: "Asian Street Food",
    rating: 4.7,
    imageUrl: "https://placehold.co/400x200.png?text=Wandering+Wok",
    dataAiHint: "asian food",
    description: "Authentic noodles, flavorful rice bowls, and spicy delights from across Asia.",
    menu: [],
    hours: "Tue-Sun: 12pm-9pm",
    isOpen: false,
    distance: "3.5 miles",
    location: { lat: 34.0522, lng: -118.2437, address: "456 Spice Ln, Los Angeles" },
    features: ["Vegetarian Options", "Accepts Cards"],
  },
];


export default function FeaturedTrucksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Star className="h-16 w-16 text-yellow-400 fill-yellow-400 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Featured Food Trucks</h1>
        <p className="text-lg text-muted-foreground">
          Discover our top-rated and premium partner trucks.
        </p>
      </div>

      {mockFeaturedTrucks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockFeaturedTrucks.map(truck => (
            <FoodTruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      ) : (
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
