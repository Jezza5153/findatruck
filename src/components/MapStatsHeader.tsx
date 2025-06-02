'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { Users, Truck, Eye } from 'lucide-react';

function formatNumber(n: number) {
  // Thousands separator for nice look
  return n.toLocaleString();
}

export default function MapStatsHeader() {
  const [truckCount, setTruckCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [weeklyViews, setWeeklyViews] = useState<number | null>(null);

  useEffect(() => {
    // Count food trucks
    getCountFromServer(collection(db, 'trucks')).then(snap => {
      setTruckCount(snap.data().count || 0);
    });
    // Count customers
    getCountFromServer(collection(db, 'customers')).then(snap => {
      setCustomerCount(snap.data().count || 0);
    });
    // Get weekly views from a stats doc (update this key as needed)
    getDoc(doc(db, 'mapStats', 'thisWeek')).then(docSnap => {
      if (docSnap.exists() && typeof docSnap.data().totalViews === 'number') {
        setWeeklyViews(docSnap.data().totalViews);
      } else {
        setWeeklyViews(0);
      }
    });
  }, []);

  // Simple count up animation (optional: use framer-motion for more pop)
  function CountUp({ value }: { value: number | null }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      if (value == null) return;
      let start = display;
      let end = value;
      if (start === end) return;
      let step = () => {
        let diff = end - start;
        if (Math.abs(diff) < 1) {
          setDisplay(end);
          return;
        }
        let inc = Math.ceil(diff / 6);
        start += inc;
        setDisplay(start);
        setTimeout(step, 24);
      };
      step();
      // eslint-disable-next-line
    }, [value]);
    return <span>{value == null ? <span className="animate-pulse text-muted">…</span> : formatNumber(display)}</span>;
  }

  return (
    <div className="mb-8 rounded-2xl shadow-md bg-gradient-to-r from-black/80 via-gray-900 to-primary/90 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Truck className="w-9 h-9 text-accent" />
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <CountUp value={truckCount} />
          </div>
          <div className="text-md text-gray-300 uppercase font-medium tracking-wide">Food Trucks</div>
        </div>
      </div>
      <div className="h-8 w-px bg-gradient-to-b from-primary/70 to-transparent mx-4 md:block hidden" />
      <div className="flex items-center gap-4">
        <Users className="w-9 h-9 text-accent" />
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <CountUp value={customerCount} />
          </div>
          <div className="text-md text-gray-300 uppercase font-medium tracking-wide">Customers</div>
        </div>
      </div>
      <div className="h-8 w-px bg-gradient-to-b from-primary/70 to-transparent mx-4 md:block hidden" />
      <div className="flex items-center gap-4">
        <Eye className="w-9 h-9 text-accent" />
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <CountUp value={weeklyViews} />
          </div>
          <div className="text-md text-gray-300 uppercase font-medium tracking-wide">Views This Week</div>
        </div>
      </div>
    </div>
  );
}
