
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FoodTruck, MenuItem as MenuItemType } from '@/lib/types';
import { MenuItemCard } from '@/components/MenuItemCard';
import { Clock, MapPin, Star, Utensils, Bell, ShoppingCart, Info, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { db, auth } from '@/lib/firebase'; // auth import for user context
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, arrayUnion, arrayRemove, type DocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { makeSerializable } from '@/lib/makeSerializable';
import { cn } from '@/lib/utils';

export default function FoodTruckProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [truck, setTruck] = useState<FoodTruck | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [cart, setCart] = useState< { item: MenuItemType, quantity: number }[] >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  const truckId = params.id as string;

  useEffect(() => {
    if (truckId) {
      const fetchTruckDetailsAndMenu = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const truckDocRef = doc(db, "trucks", truckId);
          const truckDocSnap: DocumentSnapshot<DocumentData> = await getDoc(truckDocRef);

          if (truckDocSnap.exists()) {
            const rawData = truckDocSnap.data();
            const serializableData = makeSerializable(rawData) as Partial<FoodTruck>; // Ensure data is serializable
            
            const fetchedTruck: FoodTruck = {
              id: truckDocSnap.id,
              name: serializableData.name || 'Unnamed Truck',
              cuisine: serializableData.cuisine || 'Unknown Cuisine',
              description: serializableData.description || 'No description available.',
              imageUrl: serializableData.imageUrl || `https://placehold.co/800x400.png`,
              ownerUid: serializableData.ownerUid || '',
              lat: typeof serializableData.lat === 'number' ? serializableData.lat : undefined,
              lng: typeof serializableData.lng === 'number' ? serializableData.lng : undefined,
              address: serializableData.address || 'Location details not available.',
              operatingHoursSummary: serializableData.operatingHoursSummary || 'Hours not specified.',
              isOpen: serializableData.isOpen === undefined ? undefined : Boolean(serializableData.isOpen),
              rating: typeof serializableData.rating === 'number' ? serializableData.rating : 0, 
              numberOfRatings: typeof serializableData.numberOfRatings === 'number' ? serializableData.numberOfRatings : 0,
              testimonials: Array.isArray(serializableData.testimonials) ? serializableData.testimonials : [],
              contactEmail: serializableData.contactEmail,
              phone: serializableData.phone,
              isFeatured: serializableData.isFeatured,
              imagePath: serializableData.imagePath || `${(serializableData.name || 'food truck').toLowerCase().replace(/\s+/g, '-')}`, // Default hint
              // ensure all other serializable fields are mapped
              imageGallery: serializableData.imageGallery,
              isVisible: serializableData.isVisible,
              currentLocation: serializableData.currentLocation,
              todaysMenu: serializableData.todaysMenu,
              todaysHours: serializableData.todaysHours,
              regularHours: serializableData.regularHours,
              specialHours: serializableData.specialHours,
              isTruckOpenOverride: serializableData.isTruckOpenOverride,
              tags: serializableData.tags,
              features: serializableData.features,
              socialMediaLinks: serializableData.socialMediaLinks,
              websiteUrl: serializableData.websiteUrl,
              subscriptionTier: serializableData.subscriptionTier,
              isFavorite: serializableData.isFavorite,
              createdAt: serializableData.createdAt,
              updatedAt: serializableData.updatedAt,
              distance: serializableData.distance,
            };
            setTruck(fetchedTruck);

            const menuItemsCollectionRef = collection(db, "trucks", truckId, "menuItems");
            const menuItemsSnap = await getDocs(menuItemsCollectionRef);
            const fetchedMenuItems: MenuItemType[] = menuItemsSnap.docs.map(docSnap => 
              makeSerializable({ id: docSnap.id, ...docSnap.data() }) as MenuItemType // Serialize menu items
            );
            setMenuItems(fetchedMenuItems);

          } else { setError(`Food truck with ID "${truckId}" not found.`); }
        } catch (err: any) {
          console.error("Fetch truck error:", err);
          setError(err.message || "Failed to fetch truck details.");
          toast({ title: "Error", description: err.message || "Could not load truck.", variant: "destructive"});
        } finally { setIsLoading(false); }
      };
      fetchTruckDetailsAndMenu();
    } else { setError("No truck ID provided."); setIsLoading(false); }
  }, [truckId, toast]);
  
  // Check if truck is favorite when user or truck data loads
  useEffect(() => {
    if (currentUser && truck) {
      const userDocRef = doc(db, "users", currentUser.uid);
      getDoc(userDocRef).then(userDocSnap => {
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsFavorite(userData.favoriteTrucks?.includes(truck.id) || false);
        }
      });
    }
  }, [currentUser, truck]);


  const handleToggleFavorite = async () => {
    if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to manage favorites.", variant: "default", action: <Button variant="outline" size="sm" onClick={() => router.push(`/login?redirect=/trucks/${truckId}`)}>Login</Button> });
      return;
    }
    if (!truck) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      if (isFavorite) {
        await updateDoc(userDocRef, { favoriteTrucks: arrayRemove(truck.id) });
        toast({ title: "Removed from Favorites", description: `${truck.name} is no longer in your favorites.` });
      } else {
        await updateDoc(userDocRef, { favoriteTrucks: arrayUnion(truck.id) });
        toast({ title: "Added to Favorites!", description: `${truck.name} is now in your favorites.` });
      }
      setIsFavorite(!isFavorite);
    } catch (error: any) {
      toast({ title: "Error Updating Favorites", description: error.message, variant: "destructive" });
    }
  };


  const handleNotifyNearby = () => {
     if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to set up notifications.", variant: "default", action: <Button variant="outline" size="sm" onClick={() => router.push(`/login?redirect=/trucks/${truckId}`)}>Login</Button> });
      return;
    }
    // Logic to enable notifications (likely involves updating user preferences in Firestore)
    toast({
      title: "Notifications Enabled!",
      description: `We'll let you know when ${truck?.name} is nearby. (Manage in your dashboard)`,
    });
  };

  const handleOrderNow = () => {
     if (!currentUser) {
      toast({ title: "Login Required", description: "Please log in to place an order.", variant: "default", action: <Button variant="outline" size="sm" onClick={() => router.push(`/login?redirect=/trucks/${truckId}`)}>Login</Button> });
      return;
    }
    // Further logic to initiate order (e.g., redirect to an order page, or open order modal)
    toast({
      title: "Order Feature Coming Soon!",
      description: `Online ordering from ${truck?.name} will be available soon.`,
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
      description: `${quantity} x ${item.name} added to your order. (Cart is for demo)`,
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

  const menuCategories = Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)));
  const totalCartItems = cart.reduce((sum, current) => sum + current.quantity, 0);
  const totalCartPrice = cart.reduce((sum, current) => sum + (current.item.price * current.quantity), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative h-64 md:h-96">
          <Image
            src={truck.imageUrl || `https://placehold.co/800x400.png`}
            alt={truck.name}
            layout="fill"
            objectFit="cover"
            className="bg-muted"
            data-ai-hint={truck.imagePath || `${truck.cuisine || 'food'} truck`}
            priority
            onError={(e) => (e.currentTarget.src = `https://placehold.co/800x400.png?text=${encodeURIComponent(truck.name)}`)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{truck.name}</h1>
            <Badge variant="secondary" className="text-lg bg-white/25 text-white backdrop-blur-sm border-white/30 shadow-md">{truck.cuisine}</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white"
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`h-6 w-6 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
          </Button>
        </div>

        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-6 mb-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-3 text-primary flex items-center">
                <Info className="mr-2 h-6 w-6" /> About {truck.name}
              </h2>
              <p className="text-muted-foreground mb-4 whitespace-pre-line">{truck.description || "No description provided."}</p>
              <div className="space-y-2 text-muted-foreground">
                {(truck.rating && truck.rating > 0) && (
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" /> {truck.rating.toFixed(1)} stars {truck.numberOfRatings ? `(${truck.numberOfRatings} ratings)` : ''}
                  </div>
                )}
                <div className="flex items-center"> <MapPin className="w-5 h-5 mr-2 text-secondary" /> {truck.address} </div>
                <div className="flex items-center"> <Clock className="w-5 h-5 mr-2 text-secondary" /> {truck.operatingHoursSummary} </div>
                {truck.isOpen !== undefined && (
                  <Badge variant={truck.isOpen ? "default" : "destructive"} className={`mt-2 ${truck.isOpen ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {truck.isOpen ? "Open Now" : "Currently Closed"}
                  </Badge>
                )}
              </div>
            </div>
            <div className="md:col-span-1 space-y-3">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90" onClick={handleOrderNow} disabled={truck.isOpen === false || menuItems.length === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" /> Order Now (Coming Soon)
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleNotifyNearby}>
                <Bell className="mr-2 h-5 w-5" /> Notify Me When Nearby
              </Button>
              {(truck.contactEmail || truck.phone) && (
                 <Card className="bg-muted/50 p-3">
                    <h3 className="text-sm font-semibold mb-1">Contact Info:</h3>
                    {truck.contactEmail && <p className="text-xs text-muted-foreground">Email: {truck.contactEmail}</p>}
                    {truck.phone && <p className="text-xs text-muted-foreground">Phone: {truck.phone}</p>}
                 </Card>
              )}
            </div>
          </div>

          <Separator className="my-8" />

          {menuItems && menuItems.length > 0 ? (
            <Tabs defaultValue={menuCategories[0] || 'all-items'} className="w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-2xl font-semibold text-primary flex items-center mb-4 sm:mb-0">
                      <Utensils className="mr-2 h-6 w-6" /> Menu
                  </h2>
                  {menuCategories.length > 0 ? (
                    <TabsList className="overflow-x-auto whitespace-nowrap">
                    {menuCategories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                    </TabsList>
                  ) : ( <TabsList><TabsTrigger value="all-items">All Items</TabsTrigger></TabsList> )}
              </div>

              {menuCategories.length > 0 ? menuCategories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems!.filter(item => item.category === category).map(item => (
                      <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </TabsContent>
              )) : (
                 <TabsContent value="all-items">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuItems!.map(item => ( <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} /> ))}
                    </div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <Card className="my-6">
              <CardHeader><CardTitle className="text-xl text-primary flex items-center"><Utensils className="mr-2 h-6 w-6" /> Menu</CardTitle></CardHeader>
              <CardContent className="pt-0 text-center text-muted-foreground"> This truck's menu is not available at the moment. Please check back later! </CardContent>
            </Card>
          )}

          {truck.testimonials && truck.testimonials.length > 0 && (
            <>
              <Separator className="my-8" />
              <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center">
                <MessageSquare className="mr-2 h-6 w-6" /> What Customers Say
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {truck.testimonials!.map(testimonial => (
                  <Card key={testimonial.id} className="bg-muted/50">
                    <CardContent className="pt-6">
                      {testimonial.avatarUrl && <Image src={testimonial.avatarUrl} alt={testimonial.name} width={40} height={40} className="rounded-full mb-2 float-left mr-3" data-ai-hint={testimonial.dataAiHint || "user avatar"} />}
                      <p className="italic text-foreground mb-2">"{testimonial.quote}"</p>
                      <p className="text-right font-medium text-primary">- {testimonial.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {cart.length > 0 && (
             <Card className="mt-8 fixed bottom-4 right-4 w-80 shadow-2xl z-50 bg-background border-primary animate-in fade-in zoom-in-95">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5"/> Your Order ({totalCartItems})
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                    <ScrollArea className="max-h-40 pr-3"> {/* Added ScrollArea */}
                        <ul className="space-y-2 mb-3">
                            {cart.map(cartItem => (
                                <li key={cartItem.item.id} className="flex justify-between text-sm">
                                    <span>{cartItem.quantity} x {cartItem.item.name}</span>
                                    <span>${(cartItem.item.price * cartItem.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                    <Separator />
                    <div className="flex justify-between font-semibold mt-2 text-md">
                        <span>Total:</span>
                        <span>${totalCartPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter className="pt-3 pb-4">
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

// Helper component for ScrollArea (can be moved to ui if used elsewhere)
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof import('@radix-ui/react-scroll-area').Root>,
  React.ComponentPropsWithoutRef<typeof import('@radix-ui/react-scroll-area').Root>
>(({ className, children, ...props }, ref) => (
  <div className={cn("relative overflow-hidden", className)} ref={ref as any}>
    <div className="h-full w-full rounded-[inherit] overflow-y-auto">{children}</div>
  </div>
));
ScrollArea.displayName = "ScrollArea";
