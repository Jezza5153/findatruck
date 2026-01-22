'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingBag, Clock, Check, X, ChefHat,
  DollarSign, User, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: 'New' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  'New': 'bg-blue-500',
  'Preparing': 'bg-yellow-500',
  'Ready for Pickup': 'bg-green-500',
  'Completed': 'bg-slate-500',
  'Cancelled': 'bg-red-500'
};

export default function OwnerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o =>
          o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
        ));
        toast({ title: `Order marked as ${newStatus}` });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => ['Completed', 'Cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-blue-400" />
            Orders
          </h1>
          <p className="text-slate-400 mt-1">{activeOrders.length} active orders</p>
        </motion.div>

        {/* Active Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-10"
        >
          <h2 className="font-semibold text-lg text-slate-300">Active Orders</h2>

          {activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <Card key={order.id} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.quantity}x {item.name}</span>
                        <span className="text-slate-400">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-sm text-yellow-400 bg-yellow-500/10 px-3 py-2 rounded-lg mb-4">
                      Note: {order.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                    <p className="font-bold text-lg">
                      <DollarSign className="w-4 h-4 inline" />
                      {order.totalAmount.toFixed(2)}
                    </p>

                    <div className="flex gap-2">
                      {order.status === 'New' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'Preparing')}
                          disabled={updatingOrder === order.id}
                          className="bg-yellow-500 hover:bg-yellow-600"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><ChefHat className="w-4 h-4 mr-1" />Start Preparing</>
                          )}
                        </Button>
                      )}
                      {order.status === 'Preparing' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                          disabled={updatingOrder === order.id}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Check className="w-4 h-4 mr-1" />Mark Ready</>
                          )}
                        </Button>
                      )}
                      {order.status === 'Ready for Pickup' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'Completed')}
                          disabled={updatingOrder === order.id}
                          className="bg-slate-600 hover:bg-slate-500"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <><Check className="w-4 h-4 mr-1" />Complete</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold mb-2">No active orders</h3>
                <p className="text-slate-400">New orders will appear here</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
