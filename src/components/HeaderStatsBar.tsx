'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { Users, Truck, CheckCircle } from 'lucide-react';

// Helper: Format with thousands separator
function formatNumber(n: number) {
  return n.toLocaleString();
}

// Animated count-up, smooth and light
function CountUp({ value, duration = 850 }: { value: number | null; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const lastValue = useRef(0);
  const startTime = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (value === null) {
      setDisplay(0);
      lastValue.current = 0;
      return;
    }
    startTime.current = Date.now();
    const startVal = lastValue.current;
    const animate = () => {
      const now = Date.now();
      const elapsed = now - (startTime.current ?? now);
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(startVal + (value - startVal) * progress);
      setDisplay(currentValue);
      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        lastValue.current = value;
      }
    };
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
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

export default function HeaderStatsBar() {
  const [truckCount, setTruckCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [openTrucksCount, setOpenTrucksCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      if (!db) {
        setError("Database not available.");
        setTruckCount(0); setUserCount(0); setOpenTrucksCount(0);
        return;
      }
      try {
        const trucksRef = collection(db, 'trucks');
        const usersRef = collection(db, 'users');
        const openTrucksQuery = query(trucksRef, where("isOpen", "==", true));
        // Firestore rules allow listing/counting both
        const [trucksSnap, usersSnap, openTrucksSnap] = await Promise.all([
          getCountFromServer(trucksRef),
          getCountFromServer(usersRef),
          getCountFromServer(openTrucksQuery),
        ]);
        if (!ignore) {
          setTruckCount(trucksSnap.data().count || 0);
          setUserCount(usersSnap.data().count || 0);
          setOpenTrucksCount(openTrucksSnap.data().count || 0);
        }
      } catch (e) {
        if (!ignore) setError('Stats unavailable');
        setTruckCount(0); setUserCount(0); setOpenTrucksCount(0);
      }
    }
    fetchStats();
    return () => { ignore = true; };
  }, []);

  return (
    <div
      className="flex items-center justify-center gap-5 sm:gap-10 py-2 rounded-xl bg-background/75 shadow-lg border border-border mx-auto max-w-2xl
      transition-all duration-200"
      style={{ minHeight: 50, marginTop: 2, marginBottom: 2 }}
      role="region"
      aria-label="Platform Statistics"
    >
      <StatItem icon={<Truck className="text-primary" />} value={truckCount} label="Total Trucks" />
      <Separator />
      <StatItem icon={<Users className="text-primary" />} value={userCount} label="Registered Users" />
      <Separator />
      <StatItem icon={<CheckCircle className="text-green-600" />} value={openTrucksCount} label="Open Now" />
      {error && (
        <span className="ml-3 text-red-400 text-xs">{error}</span>
      )}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: number | null, label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 min-w-[90px]">
      <span className="text-2xl">{icon}</span>
      <div>
        <span className="font-bold text-lg block leading-5">{value !== null ? <CountUp value={value} /> : '...'}</span>
        <span className="block text-xs text-muted-foreground font-medium">{label}</span>
      </div>
    </div>
  );
}

function Separator() {
  return <span className="mx-1 w-px h-7 bg-border hidden sm:inline-block" />;
}
