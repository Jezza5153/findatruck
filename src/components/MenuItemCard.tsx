import type { MenuItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlusCircle, MinusCircle, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react'; // useEffect and useState for client-side quantity
import { Input } from '@/components/ui/input';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem, quantity: number) => void;
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure quantity logic runs only on client
  }, []);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity);
    }
    // console.log(`Added ${quantity} of ${item.name} to cart`); // Placeholder action
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col md:flex-row">
      {item.imageUrl && (
        <div className="md:w-1/3 relative">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={200}
            height={200}
            className="object-cover w-full h-48 md:h-full md:rounded-l-md md:rounded-r-none rounded-t-md"
            data-ai-hint={`${item.category} food dish`}
          />
        </div>
      )}
      <div className="flex flex-col flex-grow p-4 md:w-2/3">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          <CardDescription className="text-sm text-primary">
            ${item.price.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-2 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </CardContent>
        <CardFooter className="p-0 flex flex-col sm:flex-row items-center justify-between gap-2">
          {isClient && onAddToCart && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} className="h-8 w-8">
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Input 
                type="number" 
                value={quantity} 
                readOnly 
                className="h-8 w-12 text-center px-1" 
              />
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} className="h-8 w-8">
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
          {onAddToCart && (
             <Button onClick={handleAddToCart} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  );
}
