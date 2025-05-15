'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Filter, LocateFixed, Utensils,Navigation } from 'lucide-react';
import type { Cuisine } from '@/lib/types';

const availableCuisines: Cuisine[] = [
  { id: 'mexican', name: 'Mexican' },
  { id: 'italian', name: 'Italian' },
  { id: 'indian', name: 'Indian' },
  { id: 'burgers', name: 'Burgers' },
  { id: 'bbq', name: 'BBQ' },
  { id: 'dessert', name: 'Dessert' },
];

interface FilterControlsProps {
  onFilterChange: (filters: any) => void; // Replace any with specific filter type
  onLocateMe: () => void;
}

export function FilterControls({ onFilterChange, onLocateMe }: FilterControlsProps) {
  const [cuisine, setCuisine] = useState<string>('');
  const [distance, setDistance] = useState<number[]>([5]);
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) { // Only call onFilterChange on client-side after initial mount
        onFilterChange({ cuisine, distance: distance[0], openNow, searchTerm });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisine, distance, openNow, searchTerm, isClient]); // isClient dependency ensures it runs after mount

  return (
    <div className="p-4 space-y-6 bg-card rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold flex items-center">
        <Filter className="mr-2 h-5 w-5 text-primary" />
        Filter Trucks
      </h3>
      
      <div>
        <Label htmlFor="search-term" className="text-sm font-medium">Search by Name or Keyword</Label>
        <Input 
          id="search-term"
          type="text"
          placeholder="e.g., Tacos, Pizza Place"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="cuisine-select" className="text-sm font-medium">Cuisine</Label>
        <Select value={cuisine} onValueChange={setCuisine}>
          <SelectTrigger id="cuisine-select" className="w-full mt-1">
            <SelectValue placeholder="Any Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Cuisine</SelectItem>
            {availableCuisines.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isClient && ( // Render Slider only on client
        <div>
            <Label htmlFor="distance-slider" className="text-sm font-medium">
                Distance: {distance[0]} miles
            </Label>
            <Slider
                id="distance-slider"
                min={1}
                max={25}
                step={1}
                value={distance}
                onValueChange={setDistance}
                className="mt-2"
            />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="open-now" 
          checked={openNow}
          onCheckedChange={(checked) => setOpenNow(Boolean(checked))}
        />
        <Label htmlFor="open-now" className="text-sm font-medium">
          Open Now
        </Label>
      </div>

      <Button onClick={onLocateMe} variant="outline" className="w-full">
        <Navigation className="mr-2 h-4 w-4" /> Locate Me
      </Button>
    </div>
  );
}
