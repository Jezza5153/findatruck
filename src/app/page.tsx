
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Testimonial } from "@/lib/types";
import { MapPin, UtensilsCrossed, Smile, Star, Truck, Download, Users, ChefHat } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";


const testimonialsData: Testimonial[] = [
  {
    id: "1",
    name: "Sarah L.",
    quote: "FindATruck helped me find the most amazing tacos right around the corner! So easy to use.",
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
      toast({ title: "Installation Successful!", description: "FindATruck added to your home screen."});
    } else {
      toast({ title: "Installation Dismissed", description: "You can add FindATruck later from your browser menu."});
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
            Welcome to FindATruck!
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
            Your destination for discovering local food trucks or showcasing your own culinary creations on wheels.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button size="lg" variant="secondary" className="bg-background text-primary hover:bg-background/90 w-full text-lg py-8 px-6 flex flex-col h-auto items-center justify-center shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/map">
                    <Users className="h-10 w-10 mb-2" />
                    I'm a Customer
                    <span className="text-sm font-normal mt-1 block">(Find Food Trucks)</span>
                </Link>
            </Button>
            <Button size="lg" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full text-lg py-8 px-6 flex flex-col h-auto items-center justify-center shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/owner/portal"> {/* Updated Link */}
                    <ChefHat className="h-10 w-10 mb-2" />
                    I'm a Food Truck Owner
                    <span className="text-sm font-normal mt-1 block">(Go to Owner Portal)</span>
                </Link>
            </Button>
          </div>
          {showInstallButton && (
            <div className="mt-10 flex justify-center">
                <Button
                size="md"
                variant="outline"
                onClick={handleInstallClick}
                className="border-background text-background hover:bg-background/10"
                >
                <Download className="mr-2 h-5 w-5" /> Add to Home Screen
                </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why You'll Love <span className="text-primary">FindATruck</span>
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
                Browse menus and place your order ahead of time. Skip the line! (Account required)
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
                Discover top-rated trucks and share your own foodie experiences. (Account required)
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newest Trucks Section */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Discover Our <span className="text-accent">Newest Trucks</span>
          </h2>
          <div className="text-center text-muted-foreground">
            <p className="mb-4 text-lg">
              Freshly added food trucks will be showcased here!
            </p>
            <p>
              As our community grows, this is where you'll find the latest culinary delights on wheels.
              Check back soon for new additions! (This will be populated from the database).
            </p>
            {/* Placeholder for listing newest trucks - actual implementation would involve data fetching */}
            <div className="mt-8">
                <Button variant="outline" asChild>
                    <Link href="/map">Explore All Trucks</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trucks Section (Currently shows placeholder text as data is empty) */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Food Trucks
          </h2>
          <p className="text-center text-muted-foreground">
            No featured trucks at the moment. Check the map to find delicious options near you! (This will be populated from the database).
          </p>
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

