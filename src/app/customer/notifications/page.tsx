
'use client';
import { Bell, MessageSquare, ShoppingBag, Loader2, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { cn } from '@/lib/utils';

type NotificationItem = {
  id: string;
  type: 'truck_nearby' | 'order_update' | 'promotion';
  title: string;
  message: string;
  timestamp: string; // ISO string or human-readable
  read: boolean;
  truckName?: string;
  orderId?: string;
  link?: string; // Optional link for the notification
};

const getIconForNotificationType = (type: NotificationItem['type']) => {
  switch (type) {
    case 'truck_nearby': return <Bell className="h-5 w-5 text-primary" />;
    case 'order_update': return <ShoppingBag className="h-5 w-5 text-green-500" />;
    case 'promotion': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Simulate API call - replace with actual Firestore query
        // For example, query a 'userNotifications' subcollection under the user's document
        await new Promise(resolve => setTimeout(resolve, 1200));
        // Placeholder data
        const fetchedNotifications: NotificationItem[] = [
          { id: '1', type: 'truck_nearby', title: 'Taco Titan is Near!', message: 'Your favorite truck, Taco Titan, is now within 2 miles of your location.', timestamp: new Date(Date.now() - 3600000).toLocaleString(), read: false, truckName: 'Taco Titan', link: '/trucks/taco-titan-id' },
          { id: '2', type: 'order_update', title: 'Order #12345 Confirmed', message: 'Your order from Burger Bliss has been confirmed and is being prepared.', timestamp: new Date(Date.now() - 7200000).toLocaleString(), read: true, orderId: '12345' },
          { id: '3', type: 'promotion', title: 'Sweet Treat Tuesday!', message: 'Get 10% off all desserts at Cupcake Corner today only!', timestamp: new Date(Date.now() - 86400000).toLocaleString(), read: true, truckName: 'Cupcake Corner', link: '/trucks/cupcake-corner-id' },
        ];
        setNotifications(fetchedNotifications);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [currentUser, authChecked]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    // Here, you would also update the notification's 'read' status in Firestore.
  };

  if (!authChecked || (isLoading && currentUser)) {
     return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading notifications...</p>
        </div>
      );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Bell className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Notifications</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Please log in to view your notifications.
        </p>
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
          <span><LogIn className="mr-2 h-4 w-4" />Login / Sign Up</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary flex items-center">
        <Bell className="mr-3 h-8 w-8" /> Notifications
      </h1>

      {error && (
         <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Notifications</AlertTitle>
          <AlertDescription>{error}. Please try again later.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`shadow-md hover:shadow-lg transition-shadow ${notification.read ? 'bg-card' : 'bg-primary/5 border-primary/30'}`}
              onClick={!notification.read ? () => markAsRead(notification.id) : undefined}
              role={!notification.read ? "button" : undefined}
              tabIndex={!notification.read ? 0 : undefined}
              onKeyDown={!notification.read ? (e) => e.key === 'Enter' && markAsRead(notification.id) : undefined}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        {getIconForNotificationType(notification.type)}
                        <CardTitle className="ml-2 text-lg">{notification.title}</CardTitle>
                    </div>
                    {!notification.read && <Badge variant="destructive" className="bg-accent text-accent-foreground text-xs animate-pulse">New</Badge>}
                </div>
                <CardDescription className="text-xs text-muted-foreground pt-1">{notification.timestamp}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{notification.message}</p>
                {notification.truckName && <p className="text-xs text-muted-foreground mt-1">Truck: {notification.truckName}</p>}
                {notification.orderId && <p className="text-xs text-muted-foreground mt-1">Order: #{notification.orderId}</p>}
                {notification.link && (
                  <Link href={notification.link} className={cn(buttonVariants({ variant: "link" }), "p-0 h-auto text-primary text-xs mt-1")}>
                    View Details
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && !error && notifications.length === 0 && (
         <Card className="text-center py-10 shadow-md max-w-2xl mx-auto">
          <CardContent>
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No new notifications</p>
            <p className="text-sm text-muted-foreground">Check back later for updates!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
