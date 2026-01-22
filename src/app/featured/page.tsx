'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconStar, IconMapPin, IconTruck, IconArrowRight } from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  isOpen?: boolean;
  address?: string;
  isFeatured?: boolean;
}

export default function FeaturedPage() {
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrucks() {
      try {
        const res = await fetch('/api/trucks?featured=true');
        const data = await res.json();
        if (data.success) {
          setTrucks(data.data);
        }
      } catch (error) {
        console.error('Error fetching trucks:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrucks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 mb-4 shadow-lg">
            <IconStar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Featured Trucks</h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Discover our hand-picked selection of the best food trucks in your area 🌟
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 bg-orange-100 rounded-3xl" />
            ))}
          </div>
        ) : trucks.length > 0 ? (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {trucks.map((truck) => (
              <motion.div
                key={truck.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Link href={`/trucks/${truck.id}`}>
                  <Card className="bg-white border-2 border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden cursor-pointer h-full group rounded-3xl shadow-md">
                    <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative overflow-hidden">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-5xl mb-2">🚚</div>
                          <span className="text-orange-400 font-medium text-sm">Food Truck</span>
                        </div>
                      )}
                      {truck.isFeatured && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                          <IconStar className="w-3 h-3" />
                          Featured
                        </div>
                      )}
                      {truck.isOpen !== undefined && (
                        <div className={cn(
                          "absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
                          truck.isOpen
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-500 text-white'
                        )}>
                          {truck.isOpen ? '🟢 Open' : 'Closed'}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors">{truck.name}</h3>
                          <p className="text-sm text-slate-500 font-medium">{truck.cuisine}</p>
                        </div>
                        {truck.rating && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                            <IconStar className="w-4 h-4 fill-current" />
                            <span className="text-sm font-bold">{truck.rating}</span>
                          </div>
                        )}
                      </div>
                      {truck.description && (
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{truck.description}</p>
                      )}
                      {truck.address && (
                        <p className="text-sm text-slate-400 flex items-center gap-2 mb-3">
                          <IconMapPin className="w-4 h-4 text-orange-400" />
                          <span className="truncate">{truck.address}</span>
                        </p>
                      )}
                      <div className="pt-3 border-t border-orange-100">
                        <span className="text-sm text-orange-600 font-bold flex items-center justify-center gap-2 group-hover:text-orange-500">
                          View Menu
                          <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="bg-white border-2 border-orange-100 rounded-3xl shadow-lg">
            <CardContent className="p-16 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No featured trucks yet</h3>
              <p className="text-slate-500 mb-6">
                Check back soon for our curated selection of amazing food trucks!
              </p>
              <Link href="/map" className="text-orange-600 hover:text-orange-500 font-bold inline-flex items-center gap-2">
                Explore all trucks on the map
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
