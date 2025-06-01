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
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative w-full h-48">
        <Image
          src={truck.imageUrl || `https://placehold.co/400x200.png?text=${encodeURIComponent(truck.name)}`}
          alt={truck.name}
          layout="fill"
          objectFit="cover"
          className="w-full h-full"
          data-ai-hint={`${truck.cuisine || 'food'} truck photo`}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">{truck.name}</CardTitle>
        <CardDescription className="text-sm text-primary flex items-center">
            <Utensils className="w-4 h-4 mr-1 inline-block" /> {truck.cuisine}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-1.5">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3 min-h-[3.75rem]">{truck.description}</p>
        {truck.rating !== undefined && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" /> {truck.rating.toFixed(1)} stars
          </div>
        )}
        {truck.address && (
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1 text-secondary" /> {truck.distance ? `${truck.distance} away` : truck.address}
          </div>
        )}
        {truck.operatingHoursSummary && (
            <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-1 text-secondary" /> {truck.operatingHoursSummary}
            </div>
        )}
        {truck.isOpen !== undefined && (
          <Badge variant={truck.isOpen ? "default" : "destructive"} className={`mt-2 ${truck.isOpen ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
            {truck.isOpen ? "Open Now" : "Closed"}
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/trucks/${truck.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
