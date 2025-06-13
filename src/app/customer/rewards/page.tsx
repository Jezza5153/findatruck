
'use client';
import { Gift, Star, Loader2, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { cn } from '@/lib/utils';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsNeeded: number; 
  type: 'coupon' | 'discount' | 'freebie';
  truckName?: string; // Associated truck for the reward
}

interface UserRewardsData {
  currentPoints: number; 
  programs: { // Changed from programProgress to programs for multiple trucks
    truckId: string;
    truckName: string;
    visitsMade: number;
    visitsNeeded: number;
  }[];
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
        // Simulate API call - replace with actual Firestore query for user's rewards data
        await new Promise(resolve => setTimeout(resolve, 1200));
        setRewardsData({
          currentPoints: 125, 
          programs: [
            { truckId: "taco-titan-id", truckName: "Taco Titan", visitsMade: 3, visitsNeeded: 5 },
            { truckId: "burger-bliss-id", truckName: "Burger Bliss", visitsMade: 1, visitsNeeded: 10 },
          ],
          availableRewards: [
            { id: 'reward1', name: 'Free Taco', description: 'Get one free Al Pastor taco.', pointsNeeded: 50, type: 'freebie', truckName: 'Taco Titan' },
            { id: 'reward2', name: '10% Off Order', description: '10% off your next order over $20.', pointsNeeded: 100, type: 'discount', truckName: 'Burger Bliss' },
          ], 
        });
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
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
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
          <span><LogIn className="mr-2 h-4 w-4" /> Login / Sign Up</span>
        </Link>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Rewards</AlertTitle>
          <AlertDescription>{error}. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!rewardsData) {
     return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-lg mx-auto">
          <AlertTitle>No Rewards Data</AlertTitle>
          <AlertDescription>Could not load your rewards information or no programs joined.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { currentPoints, programs, availableRewards } = rewardsData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center">
          <Gift className="mr-3 h-8 w-8" /> Loyalty Rewards
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0">Your Total Points: <span className="font-bold text-secondary">{currentPoints}</span></p>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-primary">Your Program Progress</h2>
      {programs && programs.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {programs.map(program => {
            const progressPercentage = (program.visitsMade / program.visitsNeeded) * 100;
            return (
              <Card key={program.truckId} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Star className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
                    {program.truckName}
                  </CardTitle>
                  <CardDescription>
                    You've made {program.visitsMade} of {program.visitsNeeded} visits for your next reward at this truck.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progressPercentage} className="w-full h-4 mb-2" aria-label={`Progress for ${program.truckName}: ${progressPercentage.toFixed(0)}%`} />
                  <p className="text-sm text-muted-foreground text-right">
                    {Math.max(0, program.visitsNeeded - program.visitsMade)} more visit{program.visitsNeeded - program.visitsMade === 1 ? '' : 's'} to go!
                  </p>
                  <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>Check-in (Feature Coming Soon)</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
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
                <CardDescription>
                  {reward.pointsNeeded} points {reward.truckName ? `at ${reward.truckName}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90" disabled={currentPoints < reward.pointsNeeded}>
                  Redeem (Cost: {reward.pointsNeeded} pts)
                </Button>
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
