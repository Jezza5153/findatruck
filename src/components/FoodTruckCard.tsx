import type { FoodTruck } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FoodTruckCardProps {
  truck: FoodTruck;
}

export function FoodTruckCard({ truck }: FoodTruckCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Image
        src={truck.imageUrl}
        alt={truck.name}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
        data-ai-hint={`${truck.cuisine} food`}
      />
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">{truck.name}</CardTitle>
        <CardDescription className="text-sm text-primary">{truck.cuisine}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{truck.description}</p>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" /> {truck.rating} stars
        </div>
        {truck.location?.address && (
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <MapPin className="w-4 h-4 mr-1 text-secondary" /> {truck.distance ? `${truck.distance} away` : truck.location.address}
          </div>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1 text-secondary" /> {truck.hours}
        </div>
        {truck.isOpen !== undefined && (
          <Badge variant={truck.isOpen ? "default" : "destructive"} className={`mt-2 ${truck.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
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
