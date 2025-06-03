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
      const inc = Math.sign(diff) * Math.ceil(Math.abs(diff) / 6); // Slower animation
      start += inc;
      setDisplay(start);
      raf = window.setTimeout(animate, 30); // Slower frame rate
    };
    animate();

    return () => window.clearTimeout(raf);
  }, [value]);

  return (
    <span>
      {value == null
        ? <span className="animate-pulse text-muted-foreground">…</span>
        : formatNumber(display)
      }
    </span>
  );
}

export default function MapStatsHeader() {
  const [truckCount, setTruckCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [weeklyViews, setWeeklyViews] = useState<number | null>(null); // Placeholder
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      try {
        const trucksCollectionRef = collection(db, 'trucks');
        // For customer count, assuming they are stored in a 'users' collection with role 'customer'
        // This would require a more complex query or a dedicated counter document.
        // For simplicity, let's use a placeholder or a count of all users for now.
        const usersCollectionRef = collection(db, 'users'); 
        
        const [trucksSnap, usersSnap] = await Promise.all([
          getCountFromServer(trucksCollectionRef),
          getCountFromServer(usersCollectionRef),
          // Placeholder for weekly views - this would typically come from analytics or a counter
          Promise.resolve({ data: () => ({ count: Math.floor(Math.random() * 1000) + 500 }) }) 
        ]);

        if (!ignore) {
          setTruckCount(trucksSnap.data().count || 0);
          setCustomerCount(usersSnap.data().count || 0); // This counts all users, refine if needed
          setWeeklyViews( (await usersSnap).data().count * 2 + Math.floor(Math.random()*200)); // simulated views
        }
      } catch (e) {
        if (!ignore) setError('Could not load stats');
        console.error("Error fetching stats:", e);
        // Optionally, set everything to 0 if you want
        setTruckCount(0);
        setCustomerCount(0);
        setWeeklyViews(0);
      }
    };

    fetchStats();
    return () => { ignore = true; };
  }, []);

  return (
    <div
      className="mb-8 rounded-2xl shadow-lg bg-gradient-to-br from-primary/80 via-primary to-blue-600 text-primary-foreground px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-around gap-6"
      role="region"
      aria-label="Platform Stats"
    >
      {/* Food Trucks */}
      <div className="flex items-center gap-3 text-center md:text-left" aria-label="Food Truck Count">
        <Truck className="w-10 h-10 md:w-12 md:h-12 text-background/80" aria-hidden="true" />
        <div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight">
            <CountUp value={truckCount} />
          </div>
          <div className="text-sm md:text-base text-background/90 uppercase font-medium tracking-wide">Food Trucks</div>
        </div>
      </div>

      {/* Vertical Separator (optional, for larger screens) */}
      <div className="h-10 w-px bg-background/30 mx-4 md:block hidden" />

      {/* Customers */}
      <div className="flex items-center gap-3 text-center md:text-left" aria-label="Registered Users Count">
        <Users className="w-10 h-10 md:w-12 md:h-12 text-background/80" aria-hidden="true" />
        <div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight">
            <CountUp value={customerCount} />
          </div>
          <div className="text-sm md:text-base text-background/90 uppercase font-medium tracking-wide">Registered Users</div>
        </div>
      </div>

      {/* Vertical Separator (optional) */}
      <div className="h-10 w-px bg-background/30 mx-4 md:block hidden" />

      {/* Views This Week */}
      <div className="flex items-center gap-3 text-center md:text-left" aria-label="Platform Views This Week">
        <Eye className="w-10 h-10 md:w-12 md:h-12 text-background/80" aria-hidden="true" />
        <div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight">
            <CountUp value={weeklyViews} />
          </div>
          <div className="text-sm md:text-base text-background/90 uppercase font-medium tracking-wide">Weekly Views</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="w-full text-center text-red-200 font-medium mt-3 md:col-span-3">{error}</div>
      )}
    </div>
  );
}
