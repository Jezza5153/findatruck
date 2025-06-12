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
      className="
        mx-auto max-w-xl
        flex items-center justify-center gap-3 sm:gap-6
        py-2 px-3
        rounded-2xl
        bg-white/65 dark:bg-black/40
        shadow-[0_2px_12px_0_rgba(0,0,0,0.04)]
        backdrop-blur-md
        border border-transparent
        transition-all
        ring-1 ring-border/30
        "
      style={{
        minHeight: 44,
        marginTop: 10,
        marginBottom: 10,
        zIndex: 30,
      }}
      role="region"
      aria-label="Platform Statistics"
    >
      <StatItem icon={<Truck className="text-primary" size={20} />} value={truckCount} label="Trucks" />
      <Separator />
      <StatItem icon={<Users className="text-primary" size={20} />} value={userCount} label="Users" />
      <Separator />
      <StatItem icon={<CheckCircle className="text-green-500" size={20} />} value={openTrucksCount} label="Open Now" />
      {error && (
        <span className="ml-3 text-red-400 text-xs font-normal">{error}</span>
      )}
    </div>
  );
}

function StatItem({ icon, value, label }: { icon: React.ReactNode, value: number | null, label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 min-w-[70px] group">
      <span className="text-xl opacity-70 group-hover:opacity-100 transition">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-base text-neutral-800 dark:text-neutral-200">
          {value !== null ? <CountUp value={value} /> : <span className="animate-pulse">...</span>}
        </span>
        <span className="block text-[11px] text-muted-foreground font-medium tracking-wide">{label}</span>
      </div>
    </div>
  );
}

function Separator() {
  return <span className="mx-1 w-px h-6 bg-border/30 hidden sm:inline-block rounded-full" />;
}
