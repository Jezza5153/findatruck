'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Timestamp } from 'firebase/firestore';

// --- Strict type for a testimonial/review ---
interface Review {
  id: string;
  author?: string;
  text?: string;
  rating?: number;
  avatarUrl?: string;
  createdAt?: Timestamp | { toDate?: () => Date }; // Firestore returns special object
}

interface CustomerFeedbackProps {
  truckId?: string | null;
}

const CustomerFeedback = ({ truckId }: CustomerFeedbackProps) => {
  const [feedback, setFeedback] = useState<Review[]>([]);

  useEffect(() => {
    if (!truckId) return;
    getDocs(collection(db, "trucks", truckId, "reviews")).then(snap => {
      const reviews: Review[] = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort by date descending (most recent first)
      reviews.sort((a, b) =>
        ((b.createdAt as any)?.toDate?.()?.getTime?.() || 0) -
        ((a.createdAt as any)?.toDate?.()?.getTime?.() || 0)
      );
      setFeedback(reviews.slice(0, 3));
    });
  }, [truckId]);

  if (!feedback.length) return null;

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        Latest Customer Reviews
      </h3>
      <div className="space-y-3">
        {feedback.map((f, idx) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * idx, type: 'spring', stiffness: 210, damping: 22 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/90 dark:bg-card/90 border border-primary/10 shadow-sm"
          >
            {/* Avatar, fallback to icon */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-2">
              {f.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.avatarUrl} alt={f.author || "User"} className="w-full h-full object-cover" />
              ) : (
                <User className="text-gray-400 w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 font-medium truncate">
                {f.author || "Anonymous"}
                {typeof f.rating === 'number' && (
                  <span className="flex items-center ml-2 text-yellow-500 font-semibold text-xs">
                    <Star className="w-3 h-3 mr-0.5" />
                    {f.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground text-sm break-words">{f.text || <span className="italic">No comment left.</span>}</div>
            </div>
            <span className="text-xs text-muted-foreground ml-2 shrink-0 whitespace-nowrap">
              {f.createdAt && (f.createdAt as any)?.toDate?.()
                ? new Date((f.createdAt as any).toDate()).toLocaleDateString()
                : ""}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CustomerFeedback;
