'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  IconTruck, IconUtensils, IconShoppingBag, IconDollarSign,
  IconMapPin, IconSettings, IconChevronRight,
  IconTrendingUp, IconClock, IconUsers, IconNavigation, IconLoader2, IconCalendar, CheckCircle
} from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  isOpen?: boolean;
  isVisible?: boolean;
  address?: string;
  rating?: number;
  currentLocation?: {
    lat?: number;
    lng?: number;
    address?: string;
    updatedAt?: string;
    note?: string;
  };
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeCustomers: number;
  avgPrepTime: string;
}

export default function OwnerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [truck, setTruck] = useState<TruckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [stats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    activeCustomers: 0,
    avgPrepTime: '15 min'
  });

  // Location state
  const [addressInput, setAddressInput] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [closingTime, setClosingTime] = useState('');
  const [openingTime, setOpeningTime] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTruck() {
      try {
        const truckId = (session?.user as any)?.truckId;
        if (truckId) {
          const res = await fetch(`/api/trucks/${truckId}`);
          const data = await res.json();
          if (data.success) {
            setTruck(data.data);
            setIsOpen(data.data.isOpen || false);
            setIsVisible(data.data.isVisible !== false);
            if (data.data.currentLocation?.address) {
              setAddressInput(data.data.currentLocation.address);
            } else if (data.data.address) {
              setAddressInput(data.data.address);
            }
            if (data.data.currentLocation?.note) {
              setLocationNote(data.data.currentLocation.note);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching truck:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchTruck();
    }
  }, [status, session]);

  const toggleOpen = async () => {
    const newState = !isOpen;
    setIsOpen(newState);

    try {
      const truckId = (session?.user as any)?.truckId;
      await fetch(`/api/trucks/${truckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: newState })
      });

      toast({
        title: newState ? '🟢 Truck is now open!' : '🔴 Truck is now closed',
        description: newState ? 'Customers can now find you on the map' : 'You are hidden from customers',
      });
    } catch (error) {
      setIsOpen(!newState);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const useCurrentLocation = () => {
    setUpdatingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const truckId = (session?.user as any)?.truckId;
            await fetch(`/api/trucks/${truckId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                currentLocation: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  address: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
                  updatedAt: new Date().toISOString(),
                  note: locationNote
                }
              })
            });
            toast({
              title: '📍 Location updated!',
              description: 'Your GPS location has been saved'
            });
            setAddressInput(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          } catch (error) {
            toast({ title: 'Error', description: 'Failed to save location', variant: 'destructive' });
          } finally {
            setUpdatingLocation(false);
          }
        },
        () => {
          toast({ title: 'Error', description: 'Could not get your location', variant: 'destructive' });
          setUpdatingLocation(false);
        }
      );
    } else {
      toast({ title: 'Error', description: 'Geolocation not supported', variant: 'destructive' });
      setUpdatingLocation(false);
    }
  };

  const saveAddressLocation = async () => {
    if (!addressInput.trim()) {
      toast({ title: 'Error', description: 'Please enter an address', variant: 'destructive' });
      return;
    }
    setUpdatingLocation(true);
    try {
      const truckId = (session?.user as any)?.truckId;
      await fetch(`/api/trucks/${truckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLocation: {
            address: addressInput,
            updatedAt: new Date().toISOString(),
            note: locationNote
          }
        })
      });
      toast({
        title: '📍 Location updated!',
        description: 'Your address has been saved'
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save location', variant: 'destructive' });
    } finally {
      setUpdatingLocation(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-800" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-1 text-white">
              {truck?.name || 'Your Truck'} Dashboard
            </h1>
            <p className="text-slate-400">Manage your food truck operations</p>
          </div>
        </motion.div>

        {/* Location & Status Card - Main Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="bg-slate-900 border-slate-800 mb-6 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <IconMapPin className="w-4 h-4 text-white" />
                </div>
                Where are you today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Open/Closed Toggle - Prominent */}
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isOpen
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-slate-800 border-slate-700'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isOpen ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-slate-500'}`} />
                  <div>
                    <p className="font-bold text-lg text-white">{isOpen ? '🟢 You are OPEN' : '⚫ You are CLOSED'}</p>
                    <p className="text-sm text-slate-400">{isOpen ? 'Customers can find you on the map' : 'Hidden from customers'}</p>
                  </div>
                </div>
                <Switch
                  checked={isOpen}
                  onCheckedChange={toggleOpen}
                  className="data-[state=checked]:bg-green-500 scale-125"
                />
              </div>

              {/* Location Input */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium">Current Location</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={useCurrentLocation}
                      disabled={updatingLocation}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      {updatingLocation ? (
                        <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <IconNavigation className="w-4 h-4 mr-2" />
                      )}
                      Use GPS
                    </Button>
                  </div>
                  <Input
                    placeholder="Or enter address (e.g., Central Park, NYC)"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                  <Input
                    placeholder="Note (e.g., Near the fountain)"
                    value={locationNote}
                    onChange={(e) => setLocationNote(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white text-sm placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300 font-medium">Today's Hours</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white focus:border-blue-500"
                    />
                    <span className="text-slate-400 font-medium">to</span>
                    <Input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Set your operating hours for today
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link href="/owner/schedule" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                  <IconCalendar className="w-4 h-4" />
                  Plan future schedule →
                </Link>
                <Button
                  onClick={saveAddressLocation}
                  disabled={updatingLocation}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-semibold shadow-lg"
                >
                  {updatingLocation ? (
                    <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <IconCheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Save Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: IconShoppingBag, label: "Today's Orders", value: stats.todayOrders, color: 'bg-blue-600', textColor: 'text-blue-400' },
            { icon: IconDollarSign, label: "Today's Revenue", value: `$${stats.todayRevenue}`, color: 'bg-green-600', textColor: 'text-green-400' },
            { icon: IconUsers, label: 'Active Customers', value: stats.activeCustomers, color: 'bg-purple-600', textColor: 'text-purple-400' },
            { icon: IconClock, label: 'Avg Prep Time', value: stats.avgPrepTime, color: 'bg-orange-600', textColor: 'text-orange-400' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900 border-slate-800 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            { icon: IconUtensils, label: 'Manage Menu', href: '/owner/menu', desc: 'Edit items, categories & prices', color: 'bg-orange-600' },
            { icon: IconShoppingBag, label: 'View Orders', href: '/owner/orders', desc: 'Process incoming orders', color: 'bg-blue-600' },
            { icon: IconTrendingUp, label: 'Analytics', href: '/owner/analytics', desc: 'View sales & performance', color: 'bg-green-600' },
            { icon: IconCalendar, label: 'Schedule', href: '/owner/schedule', desc: 'Plan future locations & dates', color: 'bg-purple-600' },
            { icon: IconSettings, label: 'Truck Settings', href: '/owner/profile', desc: 'Edit profile & hours', color: 'bg-slate-600' },
            { icon: IconDollarSign, label: 'Billing', href: '/owner/billing', desc: 'Manage payments', color: 'bg-violet-600' },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer h-full group shadow-lg">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{action.label}</h3>
                    <p className="text-sm text-slate-400">{action.desc}</p>
                  </div>
                  <IconChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
