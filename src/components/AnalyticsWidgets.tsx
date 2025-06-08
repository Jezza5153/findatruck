'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AnalyticsWidgetsProps {
  truckId?: string | null;
}

interface OrderItemDetail {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  total?: number;
  items?: OrderItemDetail[];
  // add other order fields as needed
}

export function AnalyticsWidgets({ truckId }: AnalyticsWidgetsProps) {
  const [orders, setOrders] = useState<number>(0);
  const [sales, setSales] = useState<number>(0);
  const [topItem, setTopItem] = useState<string>("");

  useEffect(() => {
    if (!truckId) return;
    getDocs(collection(db, "trucks", truckId, "orders")).then(snap => {
      setOrders(snap.size);
      let sum = 0;
      const items: Record<string, number> = {};
      snap.docs.forEach(doc => {
        const o = doc.data() as OrderData;
        sum += o.total || 0;
        (o.items || []).forEach((item: OrderItemDetail) => {
          items[item.name] = (items[item.name] || 0) + item.quantity;
        });
      });
      setSales(sum);
      setTopItem(Object.keys(items).sort((a, b) => items[b] - items[a])[0] || "");
    });
  }, [truckId]);

  return (
    <div className="flex gap-4 mb-4">
      <div className="p-3 bg-green-50 rounded font-bold">Today’s Orders: {orders}</div>
      <div className="p-3 bg-yellow-50 rounded font-bold">Sales: ${sales.toFixed(2)}</div>
      {topItem && <div className="p-3 bg-blue-50 rounded font-bold">Top Item: {topItem}</div>}
    </div>
  );
}
