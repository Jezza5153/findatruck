
import type { MenuItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlusCircle, MinusCircle, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem, quantity: number) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const placeholderImage = `https://placehold.co/300x200.png?text=${encodeURIComponent(item.name || 'Menu Item')}`;

  useEffect(() => {
    setIsClient(true); 
  }, []);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleDirectQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
        setQuantity(val);
    } else if (e.target.value === '') {
        // Allow clearing for new input, but might default to 1 on blur or add
        setQuantity(1); // Or handle empty state more gracefully
    }
  };


  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity);
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col md:flex-row overflow-hidden bg-card">
      {item.imageUrl && (
        <div className="md:w-1/3 relative h-48 md:h-auto min-h-[150px] bg-muted"> {/* Added min-h and bg-muted */}
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-md md:rounded-l-md md:rounded-tr-none"
            data-ai-hint={`${item.category} food dish`}
            onError={(e) => e.currentTarget.src = placeholderImage}
          />
        </div>
      )}
      <div className="flex flex-col flex-grow p-4 md:w-2/3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg">{item.name || "Unnamed Item"}</CardTitle>
          <CardDescription className="text-sm text-primary font-semibold">
            ${item.price ? item.price.toFixed(2) : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-3 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[40px]">{item.description || "No description available."}</p>
        </CardContent>
        <CardFooter className="p-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-auto">
          {isClient && onAddToCart && (
            <div className="flex items-center space-x-1.5">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} className="h-9 w-9 shrink-0" aria-label="Decrease quantity">
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Input 
                type="number" 
                value={quantity} 
                onChange={handleDirectQuantityInput}
                className="h-9 w-14 text-center px-1 appearance-none [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Item quantity"
                min="1"
              />
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} className="h-9 w-9 shrink-0" aria-label="Increase quantity">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          {onAddToCart && (
             <Button onClick={handleAddToCart} className="w-full sm:w-auto bg-accent hover:bg-accent/90 flex-grow sm:flex-grow-0 h-9">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
