'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FoodTruck, MenuItem as MenuItemType } from '@/lib/types';
import { MenuItemCard } from '@/components/MenuItemCard';
import { Clock, MapPin, Star, Utensils, Bell, ShoppingCart, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock data - in a real app, this would be fetched based on `id`
const mockTrucksData: FoodTruck[] = [
   {
    id: "1", name: "Taco 'Bout Delicious", cuisine: "Mexican", rating: 4.8,
    imageUrl: "https://placehold.co/800x400.png", description: "Authentic Mexican street tacos with a modern twist. We use locally sourced ingredients to bring you the freshest flavors. Our specialties include Al Pastor, Carnitas, and signature spicy salsas.",
    menu: [
      { id: "m1", name: "Al Pastor Taco", price: 3.50, description: "Marinated pork, pineapple, onion, cilantro.", category: "Tacos", imageUrl: "https://placehold.co/200x200.png" },
      { id: "m2", name: "Carnitas Taco", price: 3.75, description: "Slow-cooked pork, onion, cilantro.", category: "Tacos", imageUrl: "https://placehold.co/200x200.png" },
      { id: "m3", name: "Chicken Quesadilla", price: 8.00, description: "Grilled chicken, cheese, flour tortilla.", category: "Quesadillas", imageUrl: "https://placehold.co/200x200.png" },
      { id: "m4", name: "Jarritos", price: 2.50, description: "Assorted flavors.", category: "Drinks", imageUrl: "https://placehold.co/200x200.png" },
    ], 
    hours: "Mon-Sat: 11am - 8pm, Sun: Closed", 
    location: { lat: 34.0522, lng: -118.2437, address: "123 Main St, Los Angeles, CA" },
    isOpen: true,
    testimonials: [
        { id: "t1", name: "Carlos R.", quote: "Best Al Pastor tacos in the city!"},
        { id: "t2", name: "Linda G.", quote: "The quesadillas are huge and so cheesy."}
    ]
  },
  // Add more mock trucks if needed for testing different IDs
];

export default function FoodTruckProfilePage() {
  const params = useParams();
  const { toast } = useToast();
  const [truck, setTruck] = useState<FoodTruck | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [cart, setCart] = useState< { item: MenuItemType, quantity: number }[] >([]);

  useEffect(() => {
    setIsClient(true);
    if (params.id) {
      const foundTruck = mockTrucksData.find(t => t.id === params.id);
      setTruck(foundTruck || null);
    }
  }, [params.id]);

  const handleNotifyNearby = () => {
    toast({
      title: "Notifications Enabled!",
      description: `We'll let you know when ${truck?.name} is nearby. (Feature coming soon!)`,
    });
  };

  const handleOrderNow = () => {
    toast({
      title: "Starting Your Order!",
      description: `Proceed to checkout for ${truck?.name}. (Feature coming soon!)`,
    });
  };
  
  const handleAddToCart = (item: MenuItemType, quantity: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.item.id === item.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      }
      return [...prevCart, { item, quantity }];
    });
    toast({
      title: "Added to Cart!",
      description: `${quantity} x ${item.name} added to your order.`,
    });
  };

  if (!isClient) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading truck details...</div>;
  }

  if (!truck) {
    return <div className="container mx-auto px-4 py-8 text-center">Food truck not found.</div>;
  }

  const menuCategories = Array.from(new Set(truck.menu.map(item => item.category)));

  const totalCartItems = cart.reduce((sum, current) => sum + current.quantity, 0);
  const totalCartPrice = cart.reduce((sum, current) => sum + (current.item.price * current.quantity), 0);


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative h-64 md:h-96">
          <Image
            src={truck.imageUrl}
            alt={truck.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${truck.cuisine} food truck`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{truck.name}</h1>
            <Badge variant="secondary" className="text-lg bg-white/20 text-white backdrop-blur-sm">{truck.cuisine}</Badge>
          </div>
        </div>

        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
                <Info className="mr-2 h-6 w-6" /> About Us
              </h2>
              <p className="text-muted-foreground mb-4">{truck.description}</p>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" /> {truck.rating} stars
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-secondary" /> {truck.location?.address || 'Location not available'}
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-secondary" /> {truck.hours}
                </div>
                {truck.isOpen !== undefined && (
                  <Badge variant={truck.isOpen ? "default" : "destructive"} className={`mt-2 ${truck.isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {truck.isOpen ? "Open Now" : "Currently Closed"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="md:col-span-1 space-y-3">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90" onClick={handleOrderNow} disabled={!truck.isOpen}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Order Now
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleNotifyNearby}>
                <Bell className="mr-2 h-5 w-5" /> Notify Me When Nearby
              </Button>
            </div>
          </div>

          <Separator className="my-8" />
          
          <Tabs defaultValue={menuCategories[0] || 'all'} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-2xl font-semibold text-primary flex items-center mb-4 sm:mb-0">
                    <Utensils className="mr-2 h-6 w-6" /> Menu
                </h2>
                <TabsList>
                {menuCategories.map(category => (
                    <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
                </TabsList>
            </div>

            {menuCategories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {truck.menu.filter(item => item.category === category).map(item => (
                    <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {truck.testimonials && truck.testimonials.length > 0 && (
            <>
              <Separator className="my-8" />
              <h2 className="text-2xl font-semibold mb-6 text-primary">
                What Customers Say
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {truck.testimonials.map(testimonial => (
                  <Card key={testimonial.id} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <p className="italic text-foreground mb-2">"{testimonial.quote}"</p>
                      <p className="text-right font-medium text-primary">- {testimonial.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {cart.length > 0 && (
             <Card className="mt-8 fixed bottom-4 right-4 w-80 shadow-2xl z-50 bg-background border-primary">
                <CardHeader>
                    <CardTitle className="text-lg text-primary flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5"/> Your Order ({totalCartItems})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 max-h-40 overflow-y-auto mb-3">
                        {cart.map(cartItem => (
                            <li key={cartItem.item.id} className="flex justify-between text-sm">
                                <span>{cartItem.quantity} x {cartItem.item.name}</span>
                                <span>${(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <Separator />
                    <div className="flex justify-between font-semibold mt-2 text-md">
                        <span>Total:</span>
                        <span>${totalCartPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleOrderNow}>
                        Checkout
                    </Button>
                </CardFooter>
             </Card>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
