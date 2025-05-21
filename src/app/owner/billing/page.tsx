
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle, XCircle, CreditCard, Download } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function OwnerBillingPage() {
  const { toast } = useToast();
  // Mock states - replace with actual subscription data from backend (e.g., Stripe)
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);

  const handleSubscribe = () => {
    // Placeholder for Stripe integration or other payment processing
    setIsSubscribed(true);
    setCurrentPlan("Premium Monthly");
    setNextBillingDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()); // Approx. 30 days from now
    setAutoRenew(true);
    toast({
      title: "Subscription Activated!",
      description: "You are now on the Premium Monthly plan.",
    });
  };

  const handleCancelSubscription = () => {
    setIsSubscribed(false);
    setCurrentPlan(null);
    setNextBillingDate(null);
    setAutoRenew(false);
    toast({
      title: "Subscription Cancelled",
      description: "Your premium features will be active until the end of the current billing period.",
      variant: "destructive"
    });
  };

  const paymentHistory = [
    { id: "inv001", date: "2024-07-01", amount: "$10.00", status: "Paid", plan: "Premium Monthly" },
    { id: "inv002", date: "2024-06-01", amount: "$10.00", status: "Paid", plan: "Premium Monthly" },
  ];

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
        {/* Subscription Plan Card */}
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
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Detailed customer analytics and data export (e.g., visit frequency, top customers).</li>
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Enhanced profile customization options.</li>
              <li><CheckCircle className="inline mr-2 h-5 w-5 text-green-500" />Priority support.</li>
            </ul>
            {!isSubscribed && (
              <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6" onClick={handleSubscribe}>
                <DollarSign className="mr-2 h-5 w-5" /> Upgrade to Premium - $10/month
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Current Subscription Status Card */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Your Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isSubscribed ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plan:</span>
                  <span>{currentPlan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next Billing Date:</span>
                  <span>{nextBillingDate}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="auto-renew" className="font-medium">Auto-Renew</Label>
                    <Switch id="auto-renew" checked={autoRenew} onCheckedChange={setAutoRenew} />
                </div>
                <Button variant="destructive" className="w-full mt-4" onClick={handleCancelSubscription}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Subscription
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
             <Button variant="outline" className="w-full mt-2" onClick={() => toast({ title: "Manage Payment Methods", description: "Feature coming soon!"})}>
                <CreditCard className="mr-2 h-4 w-4" /> Manage Payment Methods
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Card */}
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
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => toast({ title: "Download Invoice", description: `Downloading ${invoice.id}.pdf (Feature Coming Soon)`})}>
                        <Download className="h-4 w-4"/>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No payment history found.</p>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">For billing inquiries, please contact support.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
