import { Bell, MessageSquare, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type NotificationItem = {
  id: string;
  type: 'truck_nearby' | 'order_update' | 'promotion';
  title: string;
  message: string;
  timestamp: string; // e.g., "2 hours ago" or a Date object
  read: boolean;
  truckName?: string;
  orderId?: string;
};

const mockNotifications: NotificationItem[] = [
  {
    id: '1', type: 'truck_nearby', title: "Taco 'Bout Delicious is Nearby!",
    message: "Your favorite truck, Taco 'Bout Delicious, is now within 2 miles of your location.",
    truckName: "Taco 'Bout Delicious", timestamp: "15 mins ago", read: false
  },
  {
    id: '2', type: 'order_update', title: "Order Ready for Pickup",
    message: "Your order #12345 from Pizza Wheels is ready for pickup.",
    orderId: "#12345", truckName: "Pizza Wheels", timestamp: "1 hour ago", read: false
  },
  {
    id: '3', type: 'promotion', title: "Special Offer!",
    message: "Get 20% off all burgers at Burger Bliss today only!",
    truckName: "Burger Bliss", timestamp: "3 hours ago", read: true
  },
  {
    id: '4', type: 'order_update', title: "Order Confirmed",
    message: "Your order #67890 from Curry Up Now has been confirmed and is being prepared.",
    orderId: "#67890", truckName: "Curry Up Now", timestamp: "Yesterday", read: true
  },
];

const getIconForNotificationType = (type: NotificationItem['type']) => {
  switch (type) {
    case 'truck_nearby': return <Bell className="h-5 w-5 text-primary" />;
    case 'order_update': return <ShoppingBag className="h-5 w-5 text-green-500" />;
    case 'promotion': return <MessageSquare className="h-5 w-5 text-blue-500" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary flex items-center">
        <Bell className="mr-3 h-8 w-8" /> Notifications
      </h1>

      {mockNotifications.length > 0 ? (
        <div className="space-y-4">
          {mockNotifications.map(notification => (
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
      ) : (
        <Card className="text-center py-10">
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
