
'use client';
import { Bell, MessageSquare, ShoppingBag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type NotificationItem = {
  id: string;
  type: 'truck_nearby' | 'order_update' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  truckName?: string;
  orderId?: string;
};

const getIconForNotificationType = (type: NotificationItem['type']) => {
  switch (type) {
    case 'truck_nearby': return <Bell className="h-5 w-5 text-primary" />;
    case 'order_update': return <ShoppingBag className="h-5 w-5 text-green-500" />;
    case 'promotion': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, fetch from '/api/notifications' or similar, likely requiring authentication
        // For now, simulating a delay and an empty response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications([]); // Simulate no notifications
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
    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary flex items-center">
        <Bell className="mr-3 h-8 w-8" /> Notifications
      </h1>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading notifications...</p>
        </div>
      )}

      {error && !isLoading && (
         <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTitle>Error Loading Notifications</AlertTitle>
          <AlertDescription>{error}. Please try again later.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card key={notification.id} className={`shadow-md ${notification.read ? 'bg-card' : 'bg-primary/5 border-primary/50'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        {getIconForNotificationType(notification.type)}
                        <CardTitle className="ml-2 text-lg">{notification.title}</CardTitle>
                    </div>
                    {!notification.read && <Badge variant="destructive" className="bg-accent text-accent-foreground text-xs">New</Badge>}
                </div>
                <CardDescription className="text-xs text-muted-foreground pt-1">{notification.timestamp}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{notification.message}</p>
                {notification.truckName && <p className="text-xs text-muted-foreground mt-1">Truck: {notification.truckName}</p>}
                {notification.orderId && <p className="text-xs text-muted-foreground mt-1">Order: {notification.orderId}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && !error && notifications.length === 0 && (
         <Card className="text-center py-10">
          <CardContent>
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-semibold text-muted-foreground">No new notifications</p>
            <p className="text-sm text-muted-foreground">Check back later for updates! (Login required for most notifications)</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
