
'use client';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';

export default function AnimatedLoader({ message = "Finding tasty trucks nearby…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full my-10" role="status" aria-live="polite">
      <motion.div
        animate={{
          scale: [1, 1.2, 1.1, 1.2, 1],
          rotate: [0, 5, -5, 5, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.3
        }}
        className="p-2"
      >
        <Utensils className="h-20 w-20 text-primary" />
      </motion.div>
      <p className="mt-6 text-lg text-muted-foreground tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
