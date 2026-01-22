import type { MenuItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlusCircle, MinusCircle, ShoppingCart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import clsx from 'clsx';

// -- TAG COLORS --
const TAG_COLORS: Record<string, string> = {
  'Vegan': 'bg-green-200 text-green-900',
  'Vegetarian': 'bg-yellow-100 text-yellow-900',
  'Spicy': 'bg-red-100 text-red-800',
  'Gluten-free': 'bg-blue-100 text-blue-800',
  'Dairy-free': 'bg-orange-100 text-orange-900',
  'Nut-free': 'bg-pink-100 text-pink-900',
};

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart?: (item: MenuItem, quantity: number) => void;
  isLoading?: boolean;
  size?: 'default' | 'compact';
}

export function MenuItemCard({
  item,
  onAddToCart,
  isLoading = false,
  size = 'default'
}: MenuItemCardProps) {
  // State
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mobile FAB
  const [isMobile, setIsMobile] = useState(false);

  // Placeholder
  const placeholderImage = `https://placehold.co/300x200.png?text=${encodeURIComponent(item.name || 'Menu Item')}`;

  // Lazy-load image, client check
  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth <= 640);
  }, []);

  // Ensure quantity stays valid
  useEffect(() => {
    if (item.outOfStock) setQuantity(1);
  }, [item.outOfStock]);

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleDirectQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setQuantity(val);
    } else if (e.target.value === '') {
      setQuantity(1);
    }
  };

  // Select input on focus for faster editing
  const handleQuantityFocus = () => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart && !item.outOfStock) {
      onAddToCart(item, quantity);
    }
  };

  // Tag rendering
  const renderTags = () => {
    if (!item.tags || item.tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2" aria-label="tags">
        {item.tags.map(tag => (
          <span
            key={tag}
            className={clsx(
              "px-2 py-0.5 rounded text-xs font-semibold",
              TAG_COLORS[tag] || "bg-gray-200 text-gray-700"
            )}
            aria-label={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Out of stock overlay
  const OutOfStockOverlay = () => (
    <div className="absolute inset-0 z-10 bg-black/50 flex flex-col items-center justify-center">
      <span className="text-white text-xl font-bold drop-shadow">Out of Stock</span>
    </div>
  );

  // Card sizing
  const cardSizeClasses = size === 'compact'
    ? 'p-2 md:p-3 max-w-xs'
    : 'p-4 md:p-6';

  // Skeleton loader
  if (isLoading) {
    return (
      <Card className={clsx("relative overflow-hidden", cardSizeClasses, "animate-pulse bg-gray-50 min-h-[190px]")}>
        <div className="bg-gray-200 h-40 w-full mb-3 rounded" />
        <div className="h-6 bg-gray-300 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="absolute bottom-3 left-0 w-full flex gap-2 justify-center">
          <div className="h-10 w-24 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  // Main render
  return (
    <Card
      className={clsx(
        "relative flex flex-col overflow-hidden bg-card shadow-md hover:shadow-lg transition-shadow",
        cardSizeClasses,
        item.outOfStock && "opacity-70"
      )}
      tabIndex={0}
      aria-label={`${item.name}${item.outOfStock ? ' (Out of stock)' : ''}`}
      role="region"
    >
      {/* IMAGE */}
      <div className="relative w-full h-40 min-h-[150px] bg-muted">
        <Image
          src={!showFallback && item.imageUrl ? item.imageUrl : placeholderImage}
          alt={item.name}
          fill
          className="object-cover"
          loading="lazy"
          onError={() => setShowFallback(true)}
          sizes="(max-width: 640px) 100vw, 33vw"
          aria-hidden="false"
        />
        {item.outOfStock && <OutOfStockOverlay />}
      </div>

      <div className="flex flex-col flex-grow">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-lg font-semibold">{item.name || "Unnamed Item"}</CardTitle>
          <CardDescription className="text-sm text-primary font-semibold">
            {typeof item.price === "number" ? `$${item.price.toFixed(2)}` : 'N/A'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 pb-2 flex-grow">
          <p className="text-sm text-muted-foreground min-h-[38px]" aria-label="description">
            {item.description || "No description available."}
          </p>
          {renderTags()}
        </CardContent>

        {/* Footer actions */}
        <CardFooter className="p-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-auto">
          {/* Quantity controls */}
          {isClient && onAddToCart && (
            <div className="flex items-center space-x-2 w-full sm:w-auto" aria-label="quantity controls">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                className="h-9 w-9"
                aria-label="Decrease quantity"
                disabled={quantity <= 1 || !!item.outOfStock}
                tabIndex={item.outOfStock ? -1 : 0}
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              <Input
                ref={inputRef}
                type="number"
                value={quantity}
                onChange={handleDirectQuantityInput}
                onFocus={handleQuantityFocus}
                className="h-9 w-14 text-center px-1 appearance-none"
                aria-label="Item quantity"
                min={1}
                inputMode="numeric"
                disabled={!!item.outOfStock}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                className="h-9 w-9"
                aria-label="Increase quantity"
                disabled={!!item.outOfStock}
                tabIndex={item.outOfStock ? -1 : 0}
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Add to cart button */}
          {onAddToCart && (
            <Button
              onClick={handleAddToCart}
              className={clsx(
                "w-full sm:w-auto flex-grow sm:flex-grow-0 h-9 text-base",
                item.outOfStock && "pointer-events-none opacity-60"
              )}
              disabled={!!item.outOfStock}
              aria-disabled={!!item.outOfStock}
              tabIndex={item.outOfStock ? -1 : 0}
              aria-label={`Add ${item.name} to cart`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {item.outOfStock ? "Not Available" : "Add to Cart"}
            </Button>
          )}
        </CardFooter>
      </div>

      {/* MOBILE FAB */}
      {isClient && onAddToCart && isMobile && !item.outOfStock && (
        <button
          className="fixed z-30 bottom-6 right-6 rounded-full bg-primary shadow-lg p-4 flex items-center gap-2 text-white text-lg font-bold focus:outline-none active:scale-95 transition-transform sm:hidden"
          style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.18)' }}
          aria-label={`Quick add ${item.name} to cart`}
          onClick={handleAddToCart}
        >
          <PlusCircle className="h-6 w-6 mr-1" />
          Add
        </button>
      )}
    </Card>
  );
}
