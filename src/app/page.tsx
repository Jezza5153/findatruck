
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FoodTruck, Testimonial } from "@/lib/types";
import { MapPin, UtensilsCrossed, Smile, Star, Truck, Annoyed, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const featuredTrucksData: FoodTruck[] = []; // No more featured trucks placeholder

const testimonialsData: Testimonial[] = [
  {
    id: "1",
    name: "Sarah L.",
    quote: "Truck Tracker helped me find the most amazing tacos right around the corner! So easy to use.",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "person avatar"
  },
  {
    id: "2",
    name: "Mike P.",
    quote: "I love getting notifications when my favorite burger truck is nearby. Game changer!",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "person avatar"
  },
  {
    id: "3",
    name: "Chen W.",
    quote: "The menus are always up-to-date, and ordering ahead is super convenient.",
    avatarUrl: "https://placehold.co/100x100.png",
    dataAiHint: "person avatar"
  },
];

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: "Installation Successful!", description: "Truck Tracker added to your home screen."});
    } else {
      toast({ title: "Installation Dismissed", description: "You can add Truck Tracker later from your browser menu."});
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/80 via-primary to-accent/60 text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Truck className="mx-auto h-24 w-24 mb-6 text-background" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Your Next Favorite Food Truck!
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Discover amazing street food near you, track live locations, browse menus, and order ahead with Truck Tracker.
          </p>
          <div className="space-x-0 sm:space-x-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/90 w-full sm:w-auto" asChild>
              <Link href="/map">Explore Trucks</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-background text-background hover:bg-background/10 w-full sm:w-auto" asChild>
              <Link href="/signup">Sign Up (Optional)</Link>
            </Button>
            {showInstallButton && (
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleInstallClick}
                className="border-background text-background hover:bg-background/10 w-full sm:w-auto"
              >
                <Download className="mr-2 h-5 w-5" /> Add to Home Screen
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why You'll Love <span className="text-primary">Truck Tracker</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Up-to-Date Locations</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Truck owners share their spot, so you know where to find them.
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <UtensilsCrossed className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Mobile Ordering (Soon)</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Browse menus and place your order ahead of time. Skip the line!
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Star className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Discover top-rated trucks and share your own foodie experiences.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Trucks Section */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Food Trucks
          </h2>
          {featuredTrucksData.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredTrucksData.map((truck) => (
                <Card key={truck.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <Image
                    src={truck.imageUrl}
                    alt={truck.name}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                    data-ai-hint="food truck"
                  />
                  <CardHeader>
                    <CardTitle className="text-2xl">{truck.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {truck.cuisine} - Rated {truck.rating} <Star className="inline h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </p>
                    <p className="text-sm mb-4">{truck.description}</p>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10" asChild>
                      <Link href={`/trucks/${truck.id}`}>View Menu</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No featured trucks at the moment. Check the map to find delicious options near you!
            </p>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            What Our Users Say <Smile className="inline h-8 w-8 text-primary" />
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial) => (
              <Card key={testimonial.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {testimonial.avatarUrl && (
                      <Image
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                        width={50}
                        height={50}
                        className="rounded-full mr-4"
                        data-ai-hint={testimonial.dataAiHint || "person avatar"}
                      />
                    )}
                    <p className="font-semibold">{testimonial.name}</p>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
