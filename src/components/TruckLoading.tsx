'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface TruckLoadingProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function TruckLoading({ message = 'Loading...', size = 'md' }: TruckLoadingProps) {
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    };

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <motion.div
                animate={{
                    y: [0, -8, 0],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Image
                    src="/markers/truck-open.gif"
                    alt="Loading..."
                    width={128}
                    height={128}
                    className={sizeClasses[size]}
                    unoptimized // GIFs need this to animate
                />
            </motion.div>
            <motion.p
                className="mt-4 text-orange-600 font-semibold text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                {message}
            </motion.p>
        </div>
    );
}

// Full page loading screen
export function TruckLoadingPage({ message = 'Loading your food truck experience...' }: { message?: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Image
                        src="/markers/truck-open.gif"
                        alt="Loading..."
                        width={200}
                        height={200}
                        className="w-40 h-40 mx-auto"
                        unoptimized
                    />
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-2">🚚 {message}</h2>
                    <p className="text-slate-500">Hang tight, delicious food is coming!</p>
                </motion.div>
            </div>
        </div>
    );
}

export default TruckLoading;
