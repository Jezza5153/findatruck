
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FoodTruck, MenuItem as MenuItemType } from '@/lib/types';
import { MenuItemCard } from '@/components/MenuItemCard';
import { Clock, MapPin, Star, Utensils, Bell, ShoppingCart, Info, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db } from '@/lib/firebase';
import { doc, getDoc, type DocumentSnapshot, type DocumentData } from 'firebase/firestore';

export default function FoodTruckProfilePage() {
  const params = useParams();
  const { toast } = useToast();
  const [truck, setTruck] = useState<FoodTruck | null>(null);
  const [cart, setCart] = useState< { item: MenuItemType, quantity: number }[] >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const truckId = params.id as string;

    if (truckId) {
      const fetchTruckDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const truckDocRef = doc(db, "trucks", truckId);
          const docSnap: DocumentSnapshot<DocumentData> = await getDoc(truckDocRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<FoodTruck>; // Cast to allow partial data
            // Ensure all required fields have defaults to prevent runtime errors
            const fetchedTruck: FoodTruck = {
              id: docSnap.id,
              name: data.name || 'Unnamed Truck',
              cuisine: data.cuisine || 'Unknown Cuisine',
              description: data.description || 'No description available.',
              imageUrl: data.imageUrl || `https://placehold.co/800x400.png?text=${encodeURIComponent(data.name || 'Food Truck')}`,
              ownerUid: data.ownerUid || '',
              location: data.location, // Can be undefined
              operatingHoursSummary: data.operatingHoursSummary || 'Hours not specified',
              isOpen: data.isOpen === undefined ? undefined : Boolean(data.isOpen), // Ensure boolean or undefined
              rating: typeof data.rating === 'number' ? data.rating : undefined,
              menu: Array.isArray(data.menu) ? data.menu : [], // Default to empty array if not present
              testimonials: Array.isArray(data.testimonials) ? data.testimonials : [], // Default to empty array
              // Add other fields with defaults if necessary
            };
            setTruck(fetchedTruck);
          } else {
            setError(`Food truck with ID "${truckId}" not found.`);
          }
        } catch (err) {
          console.error("Error fetching truck details:", err);
          let errorMessage = "Failed to fetch truck details. Please try again later.";
          if (err instanceof Error && err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchTruckDetails();
    } else {
      setError("No truck ID provided.");
      setIsLoading(false);
    }
  }, [params.id, toast]);

  const handleNotifyNearby = () => {
    // TODO: Implement actual notification subscription logic (requires backend & user account)
    toast({
      title: "Notifications Enabled!",
      description: `We'll let you know when ${truck?.name} is nearby. (Account feature)`,
    });
  };

  const handleOrderNow = () => {
    // TODO: Implement order placement logic (requires backend & user account)
    toast({
      title: "Starting Your Order!",
      description: `Proceed to checkout for ${truck?.name}. (Account feature)`,
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading truck details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!truck) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert className="max-w-md mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>Truck Not Found</AlertTitle>
            <AlertDescription>The food truck you are looking for could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const menuCategories = Array.from(new Set(truck.menu?.map(item => item.category) || []));
  const totalCartItems = cart.reduce((sum, current) => sum + current.quantity, 0);
  const totalCartPrice = cart.reduce((sum, current) => sum + (current.item.price * current.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative h-64 md:h-96">
          <Image
            src={truck.imageUrl || `https://placehold.co/800x400.png?text=${encodeURIComponent(truck.name)}`}
            alt={truck.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={`${truck.cuisine || 'food'} truck`}
            priority // Consider adding priority for LCP
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
                {truck.rating !== undefined && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" /> {truck.rating.toFixed(1)} stars
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-secondary" /> {truck.location?.address || 'Location not specified'}
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-secondary" /> {truck.operatingHoursSummary || 'Hours not specified'}
                </div>
                {truck.isOpen !== undefined && (
                  <Badge variant={truck.isOpen ? "default" : "destructive"} className={`mt-2 ${truck.isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {truck.isOpen ? "Open Now" : "Currently Closed"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="md:col-span-1 space-y-3">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90" onClick={handleOrderNow} disabled={truck.isOpen === false || !truck.menu || truck.menu.length === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Order Now (Coming Soon)
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleNotifyNearby}>
                <Bell className="mr-2 h-5 w-5" /> Notify Me When Nearby
              </Button>
            </div>
          </div>

          <Separator className="my-8" />
          
          {truck.menu && truck.menu.length > 0 ? (
            <Tabs defaultValue={menuCategories[0] || 'all-items'} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-2xl font-semibold text-primary flex items-center mb-4 sm:mb-0">
                      <Utensils className="mr-2 h-6 w-6" /> Menu
                  </h2>
                  {menuCategories.length > 0 ? (
                    <TabsList>
                    {menuCategories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                    </TabsList>
                  ) : (
                    <TabsList>
                        <TabsTrigger value="all-items">All Items</TabsTrigger>
                    </TabsList>
                  )}
              </div>

              {menuCategories.length > 0 ? menuCategories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {truck.menu!.filter(item => item.category === category).map(item => (
                      <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </TabsContent>
              )) : (
                 <TabsContent value="all-items">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {truck.menu!.map(item => (
                            <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <Card className="my-6">
              <CardHeader>
                <CardTitle className="text-xl text-primary flex items-center">
                  <Utensils className="mr-2 h-6 w-6" /> Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-center text-muted-foreground">
                This truck's menu is not available at the moment. Please check back later!
              </CardContent>
            </Card>
          )}

          {truck.testimonials && truck.testimonials.length > 0 && (
            <>
              <Separator className="my-8" />
              <h2 className="text-2xl font-semibold mb-6 text-primary">
                What Customers Say
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {truck.testimonials!.map(testimonial => (
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
                        Checkout (Coming Soon)
                    </Button>
                </CardFooter>
             </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
