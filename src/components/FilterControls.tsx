
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { IconFilter, IconNavigation, IconRotateCcw } from '@/components/ui/branded-icons';
import type { Cuisine } from '@/lib/types';

const availableCuisinesData: Cuisine[] = [
  { id: 'american', name: 'American' },
  { id: 'bbq', name: 'BBQ' },
  { id: 'burgers', name: 'Burgers' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'coffee', name: 'Coffee & Tea' },
  { id: 'dessert', name: 'Desserts' },
  { id: 'indian', name: 'Indian' },
  { id: 'italian', name: 'Italian' },
  { id: 'japanese', name: 'Japanese' },
  { id: 'korean', name: 'Korean' },
  { id: 'latin-american', name: 'Latin American' },
  { id: 'mediterranean', name: 'Mediterranean' },
  { id: 'mexican', name: 'Mexican' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'sandwiches', name: 'Sandwiches' },
  { id: 'seafood', name: 'Seafood' },
  { id: 'thai', name: 'Thai' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'vietnamese', name: 'Vietnamese' },
  { id: 'other', name: 'Other' },
].sort((a, b) => a.name.localeCompare(b.name));


interface FilterControlsProps {
  onFilterChange: (filters: { cuisine?: string; distance?: number; openNow?: boolean; searchTerm?: string }) => void;
  onLocateMe: () => void;
}

export function FilterControls({ onFilterChange, onLocateMe }: FilterControlsProps) {
  const [cuisine, setCuisine] = useState<string>('');
  const [distance, setDistance] = useState<number[]>([10]); // Default to 10 miles
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on client
  }, []);

  // Debounce filter changes to avoid rapid updates
  useEffect(() => {
    if (!isClient) return; // Don't run on server or before mount

    const handler = setTimeout(() => {
      onFilterChange({ cuisine, distance: distance[0], openNow, searchTerm });
    }, 500); // Debounce by 500ms

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuisine, distance, openNow, searchTerm, isClient]); // onFilterChange excluded to prevent infinite loops if parent re-renders

  const resetFilters = () => {
    setCuisine('');
    setDistance([10]);
    setOpenNow(false);
    setSearchTerm('');
    // onFilterChange will be called by the useEffect due to state changes
  };

  const handleCuisineChange = (value: string) => {
    if (value === 'all') {
      setCuisine('');
    } else {
      setCuisine(value);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-card rounded-lg shadow-md border">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center">
          <IconFilter className="mr-2 h-5 w-5 text-primary" />
          Filter Trucks
        </h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} aria-label="Reset filters">
          <IconRotateCcw className="h-4 w-4 mr-1" /> Reset
        </Button>
      </div>

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
        <Select value={cuisine === '' ? 'all' : cuisine} onValueChange={handleCuisineChange}>
          <SelectTrigger id="cuisine-select" className="w-full mt-1">
            <SelectValue placeholder="Any Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Cuisine</SelectItem>
            {availableCuisinesData.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isClient && (
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
            aria-label={`Distance filter, current value ${distance[0]} miles`}
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="open-now"
          checked={openNow}
          onCheckedChange={(checked) => setOpenNow(Boolean(checked))}
        />
        <Label htmlFor="open-now" className="text-sm font-medium cursor-pointer">
          Open Now
        </Label>
      </div>

      <Button onClick={onLocateMe} variant="outline" className="w-full">
        <IconNavigation className="mr-2 h-4 w-4" /> Locate Me
      </Button>
    </div>
  );
}
