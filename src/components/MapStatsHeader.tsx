
'use client';
import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { Users, Truck, Eye, CheckCircle } from 'lucide-react';

// Format with thousands separator
function formatNumber(n: number) {
  return n.toLocaleString();
}

// Animated count-up with previous value stored in useRef
function CountUp({ value, duration = 1000 }: { value: number | null; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const lastValue = useRef(0);
  const startTime = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (value === null) {
      setDisplay(0); // Or some placeholder like '...'
      lastValue.current = 0;
      return;
    }

    startTime.current = Date.now();
    const startVal = lastValue.current;

    const animate = () => {
      const now = Date.now();
      const elapsedTime = now - (startTime.current || now);
      const progress = Math.min(elapsedTime / duration, 1);
      
      const currentValue = Math.floor(startVal + (value - startVal) * progress);
      setDisplay(currentValue);

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        lastValue.current = value;
      }
    };

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [value, duration]);

  return (
    <span>
      {value === null
        ? <span className="animate-pulse text-muted-foreground/80 text-2xl">...</span>
        : formatNumber(display)
      }
    </span>
  );
}

export default function MapStatsHeader() {
  const [truckCount, setTruckCount] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [openTrucksCount, setOpenTrucksCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      if (!db) {
        setError("Database service not available.");
        setTruckCount(0); setCustomerCount(0); setOpenTrucksCount(0);
        return;
      }
      try {
        const trucksCollectionRef = collection(db, 'trucks');
        const usersCollectionRef = collection(db, 'users');
        const openTrucksQuery = query(trucksCollectionRef, where("isOpen", "==", true));
        
        const [trucksSnap, usersSnap, openTrucksSnap] = await Promise.all([
          getCountFromServer(trucksCollectionRef),
          getCountFromServer(usersCollectionRef), // This counts all users. Refine if roles are strictly enforced.
          getCountFromServer(openTrucksQuery),
        ]);

        if (!ignore) {
          setTruckCount(trucksSnap.data().count || 0);
          setCustomerCount(usersSnap.data().count || 0); 
          setOpenTrucksCount(openTrucksSnap.data().count || 0);
        }
      } catch (e: any) {
        if (!ignore) setError('Could not load platform stats.');
        console.error("Error fetching stats:", e);
        setTruckCount(0); setCustomerCount(0); setOpenTrucksCount(0);
      }
    };

    fetchStats();
    return () => { ignore = true; };
  }, []);

  return (
    <div
      className="mb-8 rounded-2xl shadow-lg bg-gradient-to-br from-primary/90 via-primary to-blue-700 text-primary-foreground px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row items-stretch justify-around gap-4 md:gap-6"
      role="region"
      aria-label="Platform Statistics"
    >
      <StatItem icon={<Truck />} value={truckCount} label="Total Trucks" />
      <Separator />
      <StatItem icon={<Users />} value={customerCount} label="Registered Users" />
      <Separator />
      <StatItem icon={<CheckCircle />} value={openTrucksCount} label="Trucks Open Now" />
      {/* Add more stats as needed */}
      {error && (
        <div className="w-full text-center text-red-200 font-medium mt-3 md:col-span-full">{error}</div>
      )}
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  value: number | null;
  label: string;
}

function StatItem({icon, value, label}: StatItemProps) {
  return (
    <div className="flex flex-1 items-center gap-3 text-center md:text-left py-2 md:py-0">
      <div className="text-background/80 text-3xl md:text-4xl">
        {icon}
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-bold tracking-tight">
          <CountUp value={value} />
        </div>
        <div className="text-xs md:text-sm text-background/90 uppercase font-medium tracking-wide">{label}</div>
      </div>
    </div>
  )
}

function Separator() {
  return <div className="h-px w-full md:h-auto md:w-px bg-background/30 my-2 md:my-0 md:mx-2" />
}
