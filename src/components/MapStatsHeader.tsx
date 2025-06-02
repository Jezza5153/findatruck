'use client';
import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { Users, Truck, Eye } from 'lucide-react';

// Format with thousands separator
function formatNumber(n: number) {
  return n.toLocaleString();
}

// Animated count-up with previous value stored in useRef
function CountUp({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(0);
  const lastValue = useRef(0);

  useEffect(() => {
    if (value == null) return;
    let start = lastValue.current;
    let end = value;
    let raf: number;

    const animate = () => {
      if (start === end) {
        setDisplay(end);
        lastValue.current = end;
        return;
      }
      const diff = end - start;
      const inc = Math.sign(diff) * Math.ceil(Math.abs(diff) / 6);
      start += inc;
      setDisplay(start);
      raf = window.setTimeout(animate, 20);
    };
    animate();

    return () => window.clearTimeout(raf);
  }, [value]);

  return (
    <span>
      {value == null
        ? <span className="animate-pulse text-muted">…</span>
        : formatNumber(display)
      }
    </span>
  );
}

export default function MapStatsHeader() {
  const [truckCount, setTruckCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [weeklyViews, setWeeklyViews] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    // Fetch all 3 stats in parallel
    Promise.all([
      getCountFromServer(collection(db, 'trucks')).then(snap => snap.data().count || 0),
      getCountFromServer(collection(db, 'customers')).then(snap => snap.data().count || 0),
      getDoc(doc(db, 'mapStats', 'thisWeek')).then(docSnap =>
        docSnap.exists() && typeof docSnap.data().totalViews === 'number'
          ? docSnap.data().totalViews
          : 0
      ),
    ]).then(([tCount, cCount, views]) => {
      if (ignore) return;
      setTruckCount(tCount);
      setCustomerCount(cCount);
      setWeeklyViews(views);
    }).catch(e => {
      if (!ignore) setError('Could not load stats');
      // Optionally, set everything to 0 if you want
      setTruckCount(0);
      setCustomerCount(0);
      setWeeklyViews(0);
    });

    return () => { ignore = true; };
  }, []);

  return (
    <div
      className="mb-8 rounded-2xl shadow-md bg-gradient-to-r from-black/80 via-gray-900 to-primary/90 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6"
      role="region"
      aria-label="Platform Stats"
    >
      {/* Food Trucks */}
      <div className="flex items-center gap-4" aria-label="Food Truck Count">
        <Truck className="w-9 h-9 text-accent" aria-hidden="true" />
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <CountUp value={truckCount} />
          </div>
          <div className="text-md text-gray-300 uppercase font-medium tracking-wide">Food Trucks</div>
        </div>
      </div>

      {/* Vertical Separator */}
      <div className="h-8 w-px bg-gradient-to-b from-primary/70 to-transparent mx-4 md:block hidden" />

      {/* Customers */}
      <div className="flex items-center gap-4" aria-label="Customer Count">
        <Users className="w-9 h-9 text-accent" aria-hidden="true" />
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <CountUp value={customerCount} />
          </div>
          <div className="text-md text-gray-300 uppercase font-medium tracking-wide">Customers</div>
        </div>
      </div>

      {/* Vertical Separator */}
      <div className="h-8 w-px bg-gradient-to-b from-primary/70 to-transparent mx-4 md:block hidden" />

      {/* Views This Week */}
      <div className="flex items-center gap-4" aria-label="Views This Week">
        <Eye className="w-9 h-9 text-accent" aria-hidden="true" />
        <div>
          <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            <CountUp value={weeklyViews} />
          </div>
          <div className="text-md text-gray-300 uppercase font-medium tracking-wide">Views This Week</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full text-center text-red-400 font-medium mt-3">{error}</div>
      )}
    </div>
  );
}
