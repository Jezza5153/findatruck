
import type { FoodTruck } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FoodTruckCardProps {
  truck: FoodTruck;
}

export function FoodTruckCard({ truck }: FoodTruckCardProps) {
  const placeholderImage = `https://placehold.co/400x200.png?text=${encodeURIComponent(truck.name || 'Food Truck')}`;
  
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card">
      <Link href={`/trucks/${truck.id}`} className="block hover:opacity-90 transition-opacity" aria-label={`View details for ${truck.name}`}>
        <div className="relative w-full h-48 bg-muted">
          <Image
            src={truck.imageUrl || placeholderImage}
            alt={truck.name || 'Food truck image'}
            layout="fill"
            objectFit="cover"
            className="w-full h-full"
            data-ai-hint={`${truck.cuisine || 'food'} truck photo`}
            onError={(e) => (e.currentTarget.src = placeholderImage)}
          />
        </div>
      </Link>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl truncate">
          <Link href={`/trucks/${truck.id}`} className="hover:text-primary transition-colors">
            {truck.name || "Unnamed Truck"}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-primary flex items-center pt-1">
            <Utensils className="w-4 h-4 mr-1.5 inline-block" /> {truck.cuisine || "Various"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1.5 text-sm">
        <p className="text-muted-foreground mb-3 line-clamp-3 min-h-[3.75rem]">{truck.description || "No description available."}</p>
        {(truck.rating !== undefined && truck.rating > 0) && (
          <div className="flex items-center text-muted-foreground">
            <Star className="w-4 h-4 mr-1.5 text-yellow-400 fill-yellow-400" /> {truck.rating.toFixed(1)} stars {truck.numberOfRatings ? `(${truck.numberOfRatings})` : ''}
          </div>
        )}
        {truck.address && (
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1.5 text-secondary" /> {truck.distance ? `${truck.distance} away` : truck.address}
          </div>
        )}
        {truck.operatingHoursSummary && (
            <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-1.5 text-secondary" /> {truck.operatingHoursSummary}
            </div>
        )}
        {truck.isOpen !== undefined && (
          <Badge variant={truck.isOpen ? "default" : "destructive"} className={`mt-2 ${truck.isOpen ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
            {truck.isOpen ? "Open Now" : "Closed"}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/trucks/${truck.id}`}>View Details & Menu</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
