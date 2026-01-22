'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Heart, Bell, ChevronRight, Truck } from 'lucide-react';
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
}

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTrucks() {
      try {
        const res = await fetch('/api/trucks?featured=true');
        const data = await res.json();
        if (data.success) {
          setTrucks(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching trucks:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchTrucks();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-700" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-slate-400">
            Ready to discover your next favorite food truck?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: MapPin, label: 'Find Trucks', href: '/map', color: 'from-blue-500 to-cyan-500' },
            { icon: Star, label: 'Featured', href: '/featured', color: 'from-yellow-500 to-orange-500' },
            { icon: Heart, label: 'Favorites', href: '/customer/dashboard', color: 'from-pink-500 to-rose-500' },
            { icon: Bell, label: 'Notifications', href: '/customer/notifications', color: 'from-purple-500 to-violet-500' },
          ].map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all hover:scale-[1.02] cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{action.label}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured Trucks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Featured Trucks
            </h2>
            <Link href="/featured">
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 bg-slate-700 rounded-xl" />
              ))}
            </div>
          ) : trucks.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trucks.map((truck) => (
                <Link key={truck.id} href={`/trucks/${truck.id}`}>
                  <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-all hover:scale-[1.02] overflow-hidden cursor-pointer h-full">
                    <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <Truck className="w-12 h-12 text-slate-500" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white">{truck.name}</h3>
                          <p className="text-sm text-slate-400">{truck.cuisine}</p>
                        </div>
                        {truck.rating && (
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{truck.rating}</span>
                          </div>
                        )}
                      </div>
                      {truck.address && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {truck.address}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-12 text-center">
                <Truck className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold mb-2">No trucks yet</h3>
                <p className="text-slate-400 mb-4">Check back soon for featured food trucks!</p>
                <Link href="/map">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    Explore the Map
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
