
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, CheckCircle, Truck, Loader2, AlertTriangle, PackageX, PackageCheck, CookingPot } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, onSnapshot, updateDoc, type Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { UserDocument } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';


interface OrderItemDetail {
  itemId: string;
  name: string;
  quantity: number;
  price: number; // Price per item at time of order
  // Add customizations if needed
}
interface Order {
    id: string; // Firestore document ID
    customerId: string;
    customerName?: string; // Denormalized for display
    items: OrderItemDetail[];
    totalAmount: number;
    status: "New" | "Preparing" | "Ready for Pickup" | "Completed" | "Cancelled";
    createdAt: Timestamp; 
    updatedAt?: Timestamp;
    notes?: string; // Customer notes for the order
}

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [truckId, setTruckId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as UserDocument;
          if (userData.role === 'owner') {
            const resolvedTruckId = userData.truckId || user.uid;
            setTruckId(resolvedTruckId);
          } else {
            setError("Access Denied: You are not an authorized owner.");
            router.push('/login');
          }
        } else {
          setError("User profile not found.");
          router.push('/login');
        }
      } else {
        router.push('/login?redirect=/owner/orders');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!truckId) {
      if(currentUser) setIsLoading(false); // Only set loading false if auth is loaded but truckId is still missing
      return;
    }

    setIsLoading(true);
    const ordersRef = collection(db, "trucks", truckId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));

    const unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
      const fetchedOrders: Order[] = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(fetchedOrders);
      setError(null);
      setIsLoading(false);
    }, (err: any) => {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to fetch orders.");
      setIsLoading(false);
    });

    return () => unsubscribeOrders();
  }, [truckId, currentUser]);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case "New": return <Badge variant="destructive" className="bg-red-500 text-white"><AlertTriangle className="mr-1 h-3 w-3"/>New</Badge>;
      case "Preparing": return <Badge variant="default" className="bg-yellow-500 text-black"><CookingPot className="mr-1 h-3 w-3"/>Preparing</Badge>;
      case "Ready for Pickup": return <Badge variant="default" className="bg-blue-500 text-white"><PackageCheck className="mr-1 h-3 w-3"/>Ready</Badge>;
      case "Completed": return <Badge variant="secondary" className="bg-green-500 text-white"><CheckCircle className="mr-1 h-3 w-3"/>Completed</Badge>;
      case "Cancelled": return <Badge variant="outline" className="bg-gray-500 text-white"><PackageX className="mr-1 h-3 w-3"/>Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (!truckId) return;
    try {
      const orderRef = doc(db, "trucks", truckId, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date() });
      // Optimistic update handled by onSnapshot, or you can manually update state here if preferred
    } catch (e: any) {
      console.error("Error updating order status:", e);
      setError(e.message || "Failed to update order status.");
    }
  };

  const activeOrders = orders.filter(o => o.status === "New" || o.status === "Preparing" || o.status === "Ready for Pickup");
  const pastOrders = orders.filter(o => o.status === "Completed" || o.status === "Cancelled");

  if (isLoading && !error) { // Show loader only if actively loading and no prior error
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg mt-4">Loading orders...</p>
      </div>
    );
  }
  
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
      
      {error && (
        <Alert variant="destructive" className="max-w-lg mx-auto mb-6">
          <AlertTriangle className="h-4 w-4"/>
          <AlertTitle>Error Loading Orders</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-6">
            <TabsTrigger value="active">Active Orders ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="past">Past Orders ({pastOrders.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="text-2xl">Active Orders</CardTitle>
                <CardDescription>View incoming orders and update their status.</CardDescription>
                </CardHeader>
                <CardContent>
                {activeOrders.length > 0 ? (
                    <div className="space-y-4">
                    {activeOrders.map(order => (
                        <Card key={order.id} className="bg-muted/30">
                        <CardHeader className="pb-3">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                            <CardTitle className="text-lg">Order #{order.id.substring(0,7)}</CardTitle>
                            {getStatusBadge(order.status)}
                            </div>
                            <CardDescription className="text-xs">
                                For: {order.customerName || `Customer ID: ${order.customerId.substring(0,6)}...`} | Received: {formatDistanceToNow(order.createdAt.toDate(), { addSuffix: true })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-2">
                            <p className="font-medium text-sm">Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)}):</p>
                            <ul className="list-disc list-inside pl-4 text-xs space-y-1 text-muted-foreground">
                                {order.items.map(item => (
                                    <li key={item.itemId}>{item.quantity} x {item.name} (@ ${item.price.toFixed(2)})</li>
                                ))}
                            </ul>
                            {order.notes && <p className="text-xs italic border-l-2 border-primary pl-2 py-1">Notes: {order.notes}</p>}
                            <p className="font-semibold text-right text-md">Total: ${order.totalAmount.toFixed(2)}</p>
                            <div className="flex flex-wrap justify-end gap-2 pt-2">
                                {order.status === "New" && 
                                <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}>
                                    <CookingPot className="mr-1 h-4 w-4"/> Mark Preparing
                                </Button>}
                                {order.status === "Preparing" &&
                                <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, "Ready for Pickup")}>
                                    <Truck className="mr-1 h-4 w-4"/> Mark Ready
                                </Button>}
                                {order.status === "Ready for Pickup" &&
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateOrderStatus(order.id, "Completed")}>
                                    <CheckCircle className="mr-1 h-4 w-4"/> Mark Completed
                                </Button>}
                                {(order.status === "New" || order.status === "Preparing") &&
                                <Button size="sm" variant="destructive" onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}>
                                    <PackageX className="mr-1 h-4 w-4"/> Cancel Order
                                </Button>}
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

        <TabsContent value="past">
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle className="text-2xl">Past Orders</CardTitle>
                <CardDescription>A history of your fulfilled or cancelled orders.</CardDescription>
                </CardHeader>
                <CardContent>
                {pastOrders.length > 0 ? (
                     <div className="space-y-4">
                    {pastOrders.map(order => (
                        <Card key={order.id} className="bg-muted/20 opacity-90">
                        <CardHeader className="pb-3">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                                <CardTitle className="text-lg">Order #{order.id.substring(0,7)}</CardTitle>
                                {getStatusBadge(order.status)}
                            </div>
                             <CardDescription className="text-xs">
                                For: {order.customerName || `Customer ID: ${order.customerId.substring(0,6)}...`} | {order.updatedAt ? `Updated: ${formatDistanceToNow(order.updatedAt.toDate(), { addSuffix: true })}` : `Placed: ${formatDistanceToNow(order.createdAt.toDate(), { addSuffix: true })}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-1">
                            <ul className="list-disc list-inside pl-4 text-xs space-y-1 text-muted-foreground">
                                {order.items.map(item => (
                                    <li key={item.itemId}>{item.quantity} x {item.name}</li>
                                ))}
                            </ul>
                            <p className="font-semibold text-right text-md">Total: ${order.totalAmount.toFixed(2)}</p>
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
    </div>
  );
}
