
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, CheckCircle, Truck, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Order {
    id: string;
    customer: string;
    items: number; // Or perhaps an array of item objects
    total: number;
    status: "New" | "Preparing" | "Ready for Pickup" | "Completed" | "Cancelled";
    timestamp: string; // Or Date object
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, fetch from '/api/owner/orders' (requires auth)
        // For now, simulating a delay and an empty response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders([]); // Simulate no orders
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
    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case "New": return <Badge variant="destructive" className="bg-red-500 text-white">New</Badge>;
      case "Preparing": return <Badge variant="default" className="bg-yellow-500 text-black">Preparing</Badge>;
      case "Ready for Pickup": return <Badge variant="default" className="bg-green-500 text-white">Ready</Badge>;
      case "Completed": return <Badge variant="secondary">Completed</Badge>;
      case "Cancelled": return <Badge variant="outline" className="bg-gray-500 text-white">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
  
  // Placeholder for order update logic
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // Here you would call an API to update the order status in your backend
    // Then, you might refetch orders or update the local state optimistically
    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };

  const activeOrders = orders.filter(o => o.status === "New" || o.status === "Preparing" || o.status === "Ready for Pickup");
  const completedOrders = orders.filter(o => o.status === "Completed" || o.status === "Cancelled");

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
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading orders...</p>
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Orders</AlertTitle>
          <AlertDescription>{error}. Please ensure you are logged in and try again.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <Tabs defaultValue="active">
          <TabsList className="grid w-full grid-cols-2 md:w-1/2 mb-6">
              <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed/Cancelled ({completedOrders.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
              <Card className="shadow-lg">
                  <CardHeader>
                  <CardTitle className="text-2xl">Active Orders</CardTitle>
                  <CardDescription>
                      View incoming orders and update their status.
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  {activeOrders.length > 0 ? (
                      <div className="space-y-4">
                      {activeOrders.map(order => (
                          <Card key={order.id} className="bg-muted/30">
                          <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">Order #{order.id.substring(0,6)} <span className="text-sm font-normal text-muted-foreground">- {order.customer}</span></CardTitle>
                              {getStatusBadge(order.status)}
                              </div>
                              <CardDescription className="text-xs">{order.timestamp}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-2">
                              <p>{order.items} items - Total: ${order.total.toFixed(2)}</p>
                              <div className="space-x-2 flex-shrink-0">
                                  {order.status === "New" && 
                                    <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}>
                                        <CheckCircle className="mr-1 h-4 w-4"/> Mark Preparing
                                    </Button>
                                  }
                                  {order.status === "Preparing" &&
                                    <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, "Ready for Pickup")}>
                                        <Truck className="mr-1 h-4 w-4"/> Mark Ready
                                    </Button>
                                  }
                                   {order.status === "Ready for Pickup" &&
                                    <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleUpdateOrderStatus(order.id, "Completed")}>
                                        <CheckCircle className="mr-1 h-4 w-4"/> Mark Completed
                                    </Button>
                                  }
                              </div>
                          </CardContent>
                          </Card>
                      ))}
                      </div>
                  ) : (
                      <p className="text-muted-foreground py-10 text-center">No active orders at the moment.</p>
                  )}
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="completed">
              <Card className="shadow-lg">
                  <CardHeader>
                  <CardTitle className="text-2xl">Order History</CardTitle>
                  <CardDescription>
                      A history of your fulfilled or cancelled orders.
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  {completedOrders.length > 0 ? (
                       <div className="space-y-4">
                      {completedOrders.map(order => (
                          <Card key={order.id} className="bg-muted/20 opacity-80">
                          <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">Order #{order.id.substring(0,6)} <span className="text-sm font-normal text-muted-foreground">- {order.customer}</span></CardTitle>
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
                      <p className="text-muted-foreground py-10 text-center">No completed or cancelled orders to show yet.</p>
                  )}
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
