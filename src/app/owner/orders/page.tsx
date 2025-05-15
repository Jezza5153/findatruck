
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, CheckCircle, Truck } from "lucide-react"; // Removed XCircle
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function OwnerOrdersPage() {
  // Mock order data for placeholder
  const mockOrders = [
    { id: "ORD001", customer: "Alice B.", items: 3, total: 25.50, status: "New", timestamp: "5 mins ago" },
    { id: "ORD002", customer: "Bob C.", items: 1, total: 10.00, status: "Preparing", timestamp: "15 mins ago" },
    { id: "ORD003", customer: "Charlie D.", items: 5, total: 45.75, status: "Ready for Pickup", timestamp: "30 mins ago" },
    { id: "ORD004", customer: "Diana E.", items: 2, total: 18.00, status: "Completed", timestamp: "1 hour ago" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New": return <Badge variant="destructive" className="bg-red-500">New</Badge>;
      case "Preparing": return <Badge variant="default" className="bg-yellow-500 text-black">Preparing</Badge>;
      case "Ready for Pickup": return <Badge variant="default" className="bg-green-500">Ready</Badge>;
      case "Completed": return <Badge variant="secondary">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center mb-4 sm:mb-0">
          <ShoppingBag className="mr-3 h-8 w-8" /> Live & Past Orders
        </h1>
        <Button asChild variant="outline">
          <Link href="/owner/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="completed">Completed Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="text-2xl">Active Orders</CardTitle>
                <CardDescription>
                    View incoming orders and update their status (e.g., preparing, ready for pickup).
                </CardDescription>
                </CardHeader>
                <CardContent>
                {mockOrders.filter(o => o.status !== "Completed").length > 0 ? (
                    <div className="space-y-4">
                    {mockOrders.filter(o => o.status !== "Completed").map(order => (
                        <Card key={order.id} className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">Order {order.id} <span className="text-sm font-normal text-muted-foreground">- {order.customer}</span></CardTitle>
                            {getStatusBadge(order.status)}
                            </div>
                            <CardDescription className="text-xs">{order.timestamp}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center pt-2">
                            <p>{order.items} items - Total: ${order.total.toFixed(2)}</p>
                            <div className="space-x-2">
                                <Button size="sm" variant="outline"><CheckCircle className="mr-1 h-4 w-4"/> Mark Preparing</Button>
                                <Button size="sm" variant="outline"><Truck className="mr-1 h-4 w-4"/> Mark Ready</Button>
                            </div>
                        </CardContent>
                        </Card>
                    ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No active orders at the moment.</p>
                )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="completed">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="text-2xl">Completed Orders</CardTitle>
                <CardDescription>
                    A history of your fulfilled orders.
                </CardDescription>
                </CardHeader>
                <CardContent>
                {mockOrders.filter(o => o.status === "Completed").length > 0 ? (
                     <div className="space-y-4">
                    {mockOrders.filter(o => o.status === "Completed").map(order => (
                        <Card key={order.id} className="bg-muted/20 opacity-80">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">Order {order.id} <span className="text-sm font-normal text-muted-foreground">- {order.customer}</span></CardTitle>
                            {getStatusBadge(order.status)}
                            </div>
                            <CardDescription className="text-xs">{order.timestamp}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <p>{order.items} items - Total: ${order.total.toFixed(2)}</p>
                        </CardContent>
                        </Card>
                    ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No completed orders to show yet.</p>
                )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
