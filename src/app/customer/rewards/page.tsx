
'use client';
import { Gift, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth } from '@/lib/firebase'; // For checking auth state
import { onAuthStateChanged, type User } from 'firebase/auth';


interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsNeeded: number; 
  type: 'coupon' | 'discount' | 'freebie';
}

interface UserRewardsData {
  currentPoints: number; 
  programProgress?: {
    truckName: string;
    visitsMade: number;
    visitsNeeded: number;
  };
  availableRewards: RewardItem[];
}

export default function CustomerRewardsPage() {
  const [rewardsData, setRewardsData] = useState<UserRewardsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authChecked) return; 

    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchRewardsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRewardsData({
          currentPoints: 0, 
          programProgress: { 
            truckName: "Taco Fiesta",
            visitsMade: 0,
            visitsNeeded: 5,
          },
          availableRewards: [], 
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRewardsData();
  }, [currentUser, authChecked]);

  if (!authChecked || (isLoading && currentUser)) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading your rewards...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Loyalty Rewards</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Log in or create an account to start earning rewards with your favorite food trucks!
        </p>
        <Button asChild size="lg">
          <Link href="/customer/login">Login / Sign Up</Link>
        </Button>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Rewards</AlertTitle>
          <AlertDescription>{error}. Please ensure you are logged in and try again.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!rewardsData) {
     return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-lg mx-auto">
          <AlertTitle>No Rewards Data</AlertTitle>
          <AlertDescription>Could not load your rewards information.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { currentPoints, programProgress, availableRewards } = rewardsData;
  const progressPercentage = programProgress ? (programProgress.visitsMade / programProgress.visitsNeeded) * 100 : 0;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center">
          <Gift className="mr-3 h-8 w-8" /> Loyalty Rewards
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0">Your Points: <span className="font-bold text-secondary">{currentPoints}</span></p>
      </div>

      {programProgress && (
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
              Your Progress at {programProgress.truckName}
            </CardTitle>
            <CardDescription>
              You've made {programProgress.visitsMade} of {programProgress.visitsNeeded} visits for your next reward.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="w-full h-4 mb-2" />
            <p className="text-sm text-muted-foreground text-right">
              {Math.max(0, programProgress.visitsNeeded - programProgress.visitsMade)} more visit{programProgress.visitsNeeded - programProgress.visitsMade === 1 ? '' : 's'} to go!
            </p>
            <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>Check-in (Feature Coming Soon)</Button>
          </CardContent>
        </Card>
      )}
      {!programProgress && (
        <Card className="mb-8 shadow-lg">
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>Start visiting participating trucks to see your progress here!</p>
            </CardContent>
        </Card>
      )}


      <h2 className="text-2xl font-semibold mb-6 text-primary">Available Rewards to Claim</h2>
      {availableRewards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.map(reward => (
            <Card key={reward.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-accent">{reward.name}</CardTitle>
                <CardDescription>Requires {reward.pointsNeeded} points/visits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90" disabled>Redeem (Feature Coming Soon)</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No rewards currently available to claim. Keep earning points!</p>
            </CardContent>
        </Card>
      )}

      <Card className="mt-12 bg-muted/30">
        <CardHeader>
            <CardTitle className="text-xl">How it Works</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
            <p>1. Visit participating food trucks and check-in (feature coming soon) or make purchases (where available).</p>
            <p>2. Earn points or track visits for each interaction with a specific truck's program.</p>
            <p>3. Unlock exclusive rewards like discounts, free items, and more!</p>
            <p className="text-xs pt-2">*Loyalty programs are managed by individual food trucks. Availability and terms may vary.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    