'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, UtensilsCrossed, Star, Truck, Download, Users, ChefHat, LogIn, 
  UserPlus, Search, MenuSquare, CalendarClock, LineChart, ShieldCheck, Trophy, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// PWA install prompt interface
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
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: "Installation Successful!", description: "Truck Tracker added to your home screen." });
    } else {
      toast({ title: "Installation Dismissed", description: "You can add Truck Tracker later from your browser menu." });
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Simulated "live trucks open" value (replace with live data if you have it)
  const liveTrucksOpen = 8;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-blue-600 to-accent text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Truck with animated SVG trail */}
          <div className="relative mx-auto mb-2 w-fit">
            <Truck className="mx-auto h-20 w-20 md:h-24 md:w-24 mb-2 text-background animate-bounce drop-shadow-lg relative z-10" />
            {/* SVG animated trail */}
            <svg
              width="120"
              height="18"
              viewBox="0 0 120 18"
              fill="none"
              className="absolute left-1/2 -translate-x-1/2 top-full"
              aria-hidden
            >
              <path
                d="M10 10 Q60 25 110 10"
                stroke="url(#trail-grad)" strokeWidth="3" fill="none"
              >
                <animate
                  attributeName="stroke-dasharray"
                  from="0,120"
                  to="120,0"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </path>
              <defs>
                <linearGradient id="trail-grad" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#3CD856" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">
            Find Food Trucks Near You!
          </h1>
          {/* Live Now Badge */}
          <p className="text-sm mt-3 flex justify-center items-center gap-2 select-none">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-primary font-semibold">{liveTrucksOpen} trucks open now</span>
          </p>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto mt-6">
            Discover local food trucks in real-time or showcase your culinary creations on Truck Tracker.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg py-3 px-8 shadow-lg hover:shadow-xl transition-shadow"
              asChild
            >
              <Link href="/map">
                <Search className="mr-2 h-5 w-5" /> Explore Map
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg py-3 px-8 shadow-lg hover:shadow-xl transition-shadow border-primary text-primary hover:bg-primary/10 border-2 font-semibold group"
              asChild
            >
              <Link href="/featured" className="flex items-center group-hover:text-primary group-focus:text-primary">
                <Star className="mr-2 h-5 w-5 group-hover:animate-spin-slow" aria-label="Featured Trucks" />
                View Featured
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button
              size="lg"
              variant="default"
              className="bg-background/20 text-primary-foreground hover:bg-background/30 w-full text-lg py-8 px-6 flex flex-col h-auto items-center justify-center shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm"
              asChild
            >
              <Link href="/signup">
                <UserPlus className="h-10 w-10 mb-2" />
                I'm a Hungry Customer
                <span className="text-sm font-normal mt-1 block">(Create an Account)</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="default"
              className="bg-background/20 text-primary-foreground hover:bg-background/30 w-full text-lg py-8 px-6 flex flex-col h-auto items-center justify-center shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm"
              asChild
            >
              <Link href="/owner/portal">
                <ChefHat className="h-10 w-10 mb-2" />
                I'm a Food Truck Owner
                <span className="text-sm font-normal mt-1 block">(Go to Owner Portal)</span>
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <Link href="/login" className="text-primary-foreground/90 hover:text-primary-foreground hover:underline text-md">
              Already have an account? <span className="font-semibold">Log In Here</span> <LogIn className="inline h-5 w-5 ml-1"/>
            </Link>
          </div>
          {showInstallButton && (
            <div className="mt-10 flex justify-center">
              <Button
                size="default"
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

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why You'll Love <span className="text-primary">Truck Tracker</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                  <MapPin className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Real-Time Locations</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Truck owners update their spot, so you always know where to find fresh food.
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                  <UtensilsCrossed className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Menus & Ordering</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Browse menus and (soon!) place orders ahead of time. Skip the line!
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4 inline-block">
                  <Star className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                Discover top-rated trucks and share your foodie experiences with the community.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            For Food Truck <span className="text-accent">Owners</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join our platform to increase your visibility, manage your menu and schedule, connect with customers, and grow your business.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <InfoCard icon={<Users />} title="Reach More Customers" description="Get discovered by hungry locals and visitors actively searching for food trucks."/>
            <InfoCard icon={<MenuSquare />} title="Easy Menu Management" description="Update your menu items, prices, and availability anytime, anywhere."/>
            <InfoCard icon={<CalendarClock />} title="Flexible Scheduling" description="Set your operating hours, special event schedules, and update your location easily."/>
            <InfoCard icon={<LineChart />} title="Performance Insights" description="Track your popular items, customer ratings, and (soon!) sales analytics."/>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-10">
            <Badge icon={<ShieldCheck className="h-4 w-4 mr-1" />} text="Free to Join" />
            <Badge icon={<Trophy className="h-4 w-4 mr-1" />} text="No Hidden Fees" />
            <Badge icon={<Award className="h-4 w-4 mr-1" />} text="For Real Foodies" />
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/owner/portal">Get Started as an Owner</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// InfoCard component
interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}
function InfoCard({icon, title, description}: InfoCardProps) {
  return (
    <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="items-center">
        <div className="p-3 bg-accent/10 rounded-full mb-3 inline-block">
          {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 text-accent"})}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  );
}

// Feature/benefit badge component
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-sm shadow-sm border border-primary/20">
      {icon}{text}
    </span>
  );
}

// Add the following in your tailwind.config.js for "spin-slow" animation if desired:
/*
module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
};
*/

