'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trophy, Star, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// ---- Types ----
type LeaderTruck = {
  id: string;
  name?: string;
  cuisine?: string;
  rating?: number;
  totalReviews?: number;
  address?: string;
  imageUrl?: string;
  // Add other fields if needed
};

const badgeColors = [
  'from-yellow-300 to-yellow-100',
  'from-gray-200 to-gray-100',
  'from-orange-300 to-orange-100',
];

export default function LeaderboardPage() {
  const [trucks, setTrucks] = useState<LeaderTruck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'trucks'));
      const arr: LeaderTruck[] = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by rating, fallback to 0 if missing
      arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      setTrucks(arr.slice(0, 10));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.h1
        className="text-4xl font-extrabold flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 90 }}
      >
        <Trophy className="text-yellow-400 w-10 h-10 drop-shadow" />
        Top 10 Food Trucks
      </motion.h1>

      {loading ? (
        <div className="py-16 text-center text-lg text-muted-foreground animate-pulse">
          Loading Leaderboard...
        </div>
      ) : (
        <ol className="space-y-3">
          {trucks.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              No trucks found.
            </div>
          )}
          {trucks.map((t, i) => (
            <motion.li
              key={t.id}
              className={`
                flex items-center gap-4 rounded-xl p-4 shadow-sm bg-gradient-to-r
                ${i < 3 ? badgeColors[i] : 'from-white to-gray-50'}
                border-2 ${i === 0
                  ? 'border-yellow-400 scale-[1.03] shadow-lg'
                  : 'border-gray-200'}
              `}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 90 }}
            >
              {/* Position */}
              <span className={`text-2xl font-black w-8 flex-shrink-0 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-500' : i === 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                {i + 1}
              </span>
              {/* Truck Image or Placeholder */}
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border shadow-inner mr-2">
                {t.imageUrl
                  ? <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                  : <Trophy className="text-primary w-7 h-7 opacity-70" />
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg truncate">{t.name ?? 'Unnamed Truck'}</span>
                  <span className="text-xs bg-primary/10 px-2 py-0.5 rounded ml-2">{t.cuisine ?? 'Cuisine'}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" /> {t.address ?? 'Address not set'}
                </div>
              </div>
              {/* Rating badge */}
              <div className="flex flex-col items-end min-w-[75px]">
                <span className="flex items-center gap-1 font-bold text-yellow-500 text-lg">
                  <Star className="w-5 h-5" /> {typeof t.rating === 'number' ? t.rating.toFixed(1) : 'N/A'}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t.totalReviews ?? 0} reviews
                </span>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
