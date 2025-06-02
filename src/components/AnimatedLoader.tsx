'use client';
import { motion } from 'framer-motion';

export default function AnimatedLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.15, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }}
        className="rounded-full bg-gradient-to-br from-blue-600 via-fuchsia-500 to-lime-400 p-2"
        style={{ width: 62, height: 62 }}
      >
        <div className="rounded-full bg-black flex items-center justify-center" style={{ width: 56, height: 56 }}>
          <svg width="32" height="32" viewBox="0 0 40 40" className="text-primary">
            <circle cx="20" cy="20" r="18" stroke="url(#paint0_linear)" strokeWidth="3.5" fill="none" />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00f2fe"/>
                <stop offset="1" stopColor="#4facfe"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>
      <span className="mt-6 text-lg text-muted-foreground tracking-wide">Finding food trucks nearby…</span>
    </div>
  );
}
