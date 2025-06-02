'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export default function MapStatsHeader() {
  const [truckCount, setTruckCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const trucksSnap = await getCountFromServer(collection(db, 'trucks'));
        setTruckCount(trucksSnap.data().count || 0);

        const customersSnap = await getCountFromServer(collection(db, 'customers'));
        setCustomerCount(customersSnap.data().count || 0);
      } catch {
        setTruckCount(null);
        setCustomerCount(null);
      }
    }
    fetchStats();
  }, []);

  return (
    <header className="w-full flex justify-between items-center py-4 px-2 md:px-8 bg-black/80 text-white rounded-lg mb-4 shadow border border-white/10">
      <div className="font-semibold text-lg tracking-wider">
        <span className="text-primary mr-3">🚚 Total Trucks:</span>
        {truckCount !== null ? truckCount : '…'}
      </div>
      <div className="font-semibold text-lg tracking-wider">
        <span className="text-secondary mr-3">🧑‍🤝‍🧑 Total Customers:</span>
        {customerCount !== null ? customerCount : '…'}
      </div>
    </header>
  );
}
