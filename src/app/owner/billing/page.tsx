
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle, XCircle, CreditCard, Download, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { UserDocument } from '@/lib/types';

interface SubscriptionDetails {
  planId: string; // e.g., 'premium_monthly'
  planName: string;
  status: 'active' | 'cancelled' | 'past_due' | 'inactive';
  nextBillingDate: string | null; // ISO string or human-readable
  autoRenew: boolean;
  price: number;
}

interface Invoice {
  id: string;
  date: string; // ISO string or human-readable
  amount: string;
  status: 'Paid' | 'Failed' | 'Pending';
  plan: string;
  downloadUrl?: string; // Optional link to download PDF
}

export default function OwnerBillingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserDocument;
           const resolvedTruckId = userData.truckId || user.uid;
          setTruckId(resolvedTruckId);
        } else {
          setError("User profile not found.");
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser || !truckId) {
      if(!currentUser && !truckId) setIsLoading(false); // Only stop loading if both are definitively null
      return;
    }

    const fetchBillingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate fetching subscription and payment history from Firestore or Stripe
        // Example: const subSnap = await getDoc(doc(db, "trucks", truckId, "billing", "subscription"));
        //          const historySnap = await getDocs(collection(db, "trucks", truckId, "paymentHistory"));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Placeholder data
        const fetchedSubscription: SubscriptionDetails | null = Math.random() > 0.3 ? {
            planId: 'premium_monthly_01',
            planName: "Premium Monthly",
            status: 'active',
            nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            autoRenew: true,
            price: 10.00,
        } : null;
        
        const fetchedHistory: Invoice[] = fetchedSubscription ? [
          { id: "inv_abc123", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), amount: "$10.00", status: "Paid", plan: "Premium Monthly" },
          { id: "inv_def456", date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString(), amount: "$10.00", status: "Paid", plan: "Premium Monthly" },
        ] : [];

        setSubscription(fetchedSubscription);
        setPaymentHistory(fetchedHistory);

      } catch (err: any) {
        setError(err.message || "Failed to load billing information.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBillingData();
  }, [currentUser, truckId]);

  const handleSubscribe = async () => {
    if (!currentUser || !truckId) return;
    setIsSaving(true);
    // Placeholder for Stripe integration or other payment processing
    // This would involve redirecting to Stripe Checkout or using Stripe Elements
    // Upon successful payment, Stripe webhook would update Firestore.
    // For simulation:
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newSub: SubscriptionDetails = {
        planId: 'premium_monthly_01',
        planName: "Premium Monthly",
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        autoRenew: true,
        price: 10.00,
    };
    // await setDoc(doc(db, "trucks", truckId, "billing", "subscription"), newSub);
    // await updateDoc(doc(db, "trucks", truckId), { subscriptionTier: newSub.planName, isFeatured: true });
    setSubscription(newSub);
    setIsSaving(false);
    toast({
      title: "Subscription Activated!",
      description: "You are now on the Premium Monthly plan. Enjoy the features!",
    });
  };

  const handleCancelSubscription = async () => {
    if (!currentUser || !truckId || !subscription) return;
    if (!confirm("Are you sure you want to cancel your subscription? Premium features will remain active until the end of the current billing period.")) return;
    setIsSaving(true);
    // Placeholder for Stripe API call to cancel subscription
    // On success, update Firestore
    await new Promise(resolve => setTimeout(resolve, 1500));
    const updatedSub = { ...subscription, status: 'cancelled', autoRenew: false } as SubscriptionDetails;
    // await updateDoc(doc(db, "trucks", truckId, "billing", "subscription"), { status: 'cancelled', autoRenew: false });
    // Optionally update isFeatured status after billing period ends via a scheduled function
    setSubscription(updatedSub);
    setIsSaving(false);
    toast({
      title: "Subscription Cancelled",
      description: `Your ${subscription.planName} plan is now cancelled. Features remain active until ${subscription.nextBillingDate}.`,
      variant: "destructive"
    });
  };
  
  const handleToggleAutoRenew = async (newAutoRenewState: boolean) => {
    if (!currentUser || !truckId || !subscription) return;
    setIsSaving(true);
    // Placeholder for Stripe API call to update auto-renewal
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedSub = { ...subscription, autoRenew: newAutoRenewState };
    // await updateDoc(doc(db, "trucks", truckId, "billing", "subscription"), { autoRenew: newAutoRenewState });
    setSubscription(updatedSub);
    setIsSaving(false);
    toast({
      title: `Auto-Renew ${newAutoRenewState ? 'Enabled' : 'Disabled'}`,
      description: `Your subscription will ${newAutoRenewState ? 'now' : 'no longer'} auto-renew.`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-xl text-muted-foreground">Loading billing details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-lg mx-auto">
           <AlertTriangle className="h-4 w-4"/>
          <AlertTitle>Error Loading Billing</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
         <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/owner/dashboard">Back to Dashboard</Link>
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <CreditCard className="mr-3 h-8 w-8" /> Billing & Subscription
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl">Premium Plan Features</CardTitle>
            <CardDescription>
              Unlock powerful tools to boost your truck's visibility and customer engagement for just $10/month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Featured Listing placement (top of map & search results).</li>
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Access to Loyalty Rewards program tools.</li>
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Detailed customer analytics and data export.</li>
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Enhanced profile customization options.</li>
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Priority support.</li>
            </ul>
            {!subscription || subscription.status !== 'active' ? (
              <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6" onClick={handleSubscribe} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5" />}
                {isSaving ? "Processing..." : "Upgrade to Premium - $10/month"}
              </Button>
            ) : (
                 <p className="text-green-600 font-semibold mt-6"><CheckCircle className="inline mr-2 h-5 w-5" />You are on the Premium Plan!</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Your Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription && subscription.status === 'active' ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plan:</span>
                  <span>{subscription.planName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next Billing:</span>
                  <span>{subscription.nextBillingDate}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="auto-renew" className="font-medium">Auto-Renew</Label>
                    <Switch 
                        id="auto-renew" 
                        checked={subscription.autoRenew} 
                        onCheckedChange={handleToggleAutoRenew}
                        disabled={isSaving} 
                    />
                </div>
                <Button variant="destructive" className="w-full mt-4" onClick={handleCancelSubscription} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />}
                  {isSaving ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </>
            ) : subscription && subscription.status === 'cancelled' ? (
                 <>
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <Badge variant="destructive">Cancelled</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2">
                        Your {subscription.planName} plan was cancelled. Access to premium features will end after {subscription.nextBillingDate || 'the current period'}.
                    </p>
                    <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-4" onClick={handleSubscribe} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <DollarSign className="mr-2 h-5 w-5" />}
                        {isSaving ? "Processing..." : "Re-subscribe to Premium"}
                    </Button>
                </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <Badge variant="secondary">Not Subscribed</Badge>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  You are currently on the Free plan. Upgrade to Premium to unlock all features.
                </p>
              </>
            )}
             <Button variant="outline" className="w-full mt-2" onClick={() => toast({ title: "Manage Payment Methods", description: "Secure payment management coming soon!"})} disabled={isSaving}>
                <CreditCard className="mr-2 h-4 w-4" /> Manage Payment Methods
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl">Payment History</CardTitle>
          <CardDescription>View your past invoices and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length > 0 ? (
            <ul className="space-y-3">
              {paymentHistory.map(invoice => (
                <li key={invoice.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-md bg-muted/50">
                  <div>
                    <p className="font-semibold">Invoice {invoice.id} - {invoice.plan}</p>
                    <p className="text-xs text-muted-foreground">Date: {invoice.date}</p>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0">
                    <span className="mr-4 text-sm">{invoice.amount}</span>
                    <Badge variant={invoice.status === "Paid" ? "default" : "destructive"} className={invoice.status === "Paid" ? "bg-green-100 text-green-700" : ""}>
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => toast({ title: "Download Invoice", description: `Downloading ${invoice.id}.pdf (Feature Coming Soon)`})} aria-label="Download invoice">
                        <Download className="h-4 w-4"/>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No payment history found. Active subscriptions will show invoices here after billing.</p>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">For billing inquiries, please contact support via the Help page.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
