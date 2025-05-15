
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Star, DollarSign } from "lucide-react"; // Removed Users, Utensils
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for placeholders
const mockAnalyticsData = {
  totalRevenue: 1250.75,
  popularItems: [
    { name: "Spicy Chicken Tacos", orders: 150 },
    { name: "Cheeseburger Deluxe", orders: 120 },
    { name: "Vegan Wrap", orders: 90 },
  ],
  averageRating: 4.7,
  totalOrders: 280,
  peakHours: "6 PM - 8 PM",
};

export default function OwnerAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <LineChart className="mr-3 h-8 w-8" /> Performance Analytics
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockAnalyticsData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (simulated)</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+150 since last week (simulated)</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.averageRating}/5</div>
             <p className="text-xs text-muted-foreground">Based on 50 reviews (simulated)</p>
          </CardContent>
        </Card>
         <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalyticsData.peakHours}</div>
             <p className="text-xs text-muted-foreground">Most active time slot (simulated)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl flex items-center"><UtensilsIcon className="mr-2 h-5 w-5"/>Most Popular Items</CardTitle> {/* Changed to UtensilsIcon to avoid conflict if Utensils was meant for something else */}
            </CardHeader>
            <CardContent>
            <ul className="space-y-2">
                {mockAnalyticsData.popularItems.map(item => (
                <li key={item.name} className="flex justify-between text-sm p-2 bg-muted/30 rounded-md">
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.orders} orders</span>
                </li>
                ))}
            </ul>
            </CardContent>
        </Card>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-xl">Sales Over Time (Placeholder)</CardTitle>
            <CardDescription>Visual representation of sales trends.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-[200px] w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Chart will be displayed here
            </div>
            <p className="text-xs text-muted-foreground mt-2">This section will feature charts showing revenue, order volume, etc. (Under Construction)</p>
            </CardContent>
        </Card>
      </div>
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Further Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More detailed reports on customer demographics, item performance, and peak times will be available here.
            Full analytics functionality is under construction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper icons not directly in lucide-react, so define or use alternatives
const ShoppingBag = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
// Adding UtensilsIcon as a local SVG component as 'Utensils' from lucide was removed assuming it was unused.
// If 'Utensils' from lucide-react IS needed for something else, this avoids a name clash.
// If it was indeed for 'Most Popular Items', this local version can be used.
const UtensilsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
);
