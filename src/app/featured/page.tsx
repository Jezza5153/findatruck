'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconStar, IconMapPin, IconTruck } from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 mb-4 shadow-lg">
            <IconStar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Featured Trucks</h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            Discover our hand-picked selection of the best food trucks in your area
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 bg-slate-700 rounded-xl" />
            ))}
          </div>
        ) : trucks.length > 0 ? (
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {trucks.map((truck, i) => (
              <motion.div
                key={truck.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Link href={`/trucks/${truck.id}`}>
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all hover:scale-[1.02] overflow-hidden cursor-pointer h-full group">
                    <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
                      {truck.imageUrl ? (
                        <img
                          src={truck.imageUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <IconTruck className="w-16 h-16 text-slate-500" />
                      )}
                      {truck.isFeatured && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/90 rounded-full text-xs font-bold text-white flex items-center gap-1">
                          <IconStar className="w-3 h-3" />
                          Featured
                        </div>
                      )}
                      {truck.isOpen !== undefined && (
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${truck.isOpen ? 'bg-green-500/90 text-white' : 'bg-slate-600/90 text-slate-300'}`}>
                          {truck.isOpen ? 'Open' : 'Closed'}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-white group-hover:text-yellow-400 transition-colors">{truck.name}</h3>
                          <p className="text-sm text-slate-400">{truck.cuisine}</p>
                        </div>
                        {truck.rating && (
                          <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg">
                            <IconStar className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold">{truck.rating}</span>
                          </div>
                        )}
                      </div>
                      {truck.description && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{truck.description}</p>
                      )}
                      {truck.address && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <IconMapPin className="w-3 h-3" />
                          {truck.address}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-16 text-center">
              <IconTruck className="w-20 h-20 mx-auto mb-4 text-slate-500" />
              <h3 className="text-2xl font-semibold mb-2">No featured trucks yet</h3>
              <p className="text-slate-400 mb-6">
                Check back soon for our curated selection of amazing food trucks!
              </p>
              <Link href="/map" className="text-yellow-400 hover:text-yellow-300 font-medium">
                Explore all trucks on the map →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
