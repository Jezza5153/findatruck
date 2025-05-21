
import { Gift, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function RewardsPage() {
  // Mock data - in a real app, this would come from user's state
  const visitsMade = 3;
  const visitsNeeded = 5;
  const progressPercentage = (visitsMade / visitsNeeded) * 100;
  const rewardsAvailable = [
    { id: '1', name: 'Free Drink', description: 'Enjoy a complimentary drink on your next visit!', pointsNeeded: 5, type: 'coupon' },
    { id: '2', name: '10% Off Next Order', description: 'Get 10% off your entire next order.', pointsNeeded: 10, type: 'discount' },
  ];
  const userHasAccount = true; // Simulate user logged in for now

  if (!userHasAccount) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Gift className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Loyalty Rewards</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Log in or create an account to start earning rewards with your favorite food trucks!
        </p>
        <Button asChild size="lg">
          <Link href="/login">Login / Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center">
          <Gift className="mr-3 h-8 w-8" /> Loyalty Rewards
        </h1>
        <p className="text-muted-foreground mt-2 sm:mt-0">Your Points: <span className="font-bold text-secondary">150</span> (Example)</p>
      </div>

      <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
            Your Progress to Next Reward
          </CardTitle>
          <CardDescription>
            You've made {visitsMade} of {visitsNeeded} visits for your next freebie at "Taco Fiesta" (example truck).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="w-full h-4 mb-2" />
          <p className="text-sm text-muted-foreground text-right">
            {visitsNeeded - visitsMade} more visit{visitsNeeded - visitsMade === 1 ? '' : 's'} to go!
          </p>
          <Button variant="outline" className="mt-4 w-full sm:w-auto" disabled>Check-in (Feature Coming Soon)</Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-semibold mb-6 text-primary">Available Rewards</h2>
      {rewardsAvailable.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewardsAvailable.map(reward => (
            <Card key={reward.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg text-accent">{reward.name}</CardTitle>
                <CardDescription>Requires {reward.pointsNeeded} visits/points</CardDescription>
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
        <p className="text-muted-foreground">No rewards available at the moment. Keep visiting your favorite trucks!</p>
      )}

      <Card className="mt-12 bg-muted/30">
        <CardHeader>
            <CardTitle className="text-xl">How it Works</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
            <p>1. Visit participating food trucks and check-in (feature coming soon) or make purchases.</p>
            <p>2. Earn points or track visits for each interaction.</p>
            <p>3. Unlock exclusive rewards like discounts, free items, and more!</p>
            <p className="text-xs pt-2">*Loyalty programs are managed by individual food trucks. Availability may vary.</p>
        </CardContent>
      </Card>
    </div>
  );
}
