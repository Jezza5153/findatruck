'use client';

import { useEffect, useState, useMemo } from 'react';
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
  IconTrendingUp, IconClock, IconUsers, IconNavigation, IconLoader2, IconCalendar, IconCheckCircle,
  IconArrowRight
} from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';
import { getProfileCompleteness } from '@/lib/profile-completeness';

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  isOpen?: boolean;
  isVisible?: boolean;
  address?: string;
  rating?: number;
  imageUrl?: string;
  description?: string;
  phone?: string;
  ctaPhoneNumber?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  tiktokHandle?: string;
  websiteUrl?: string;
  regularHours?: unknown;
  operatingHoursSummary?: string;
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
  const [menuItemCount, setMenuItemCount] = useState(0);
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

  // Profile completeness
  const completeness = useMemo(() => {
    if (!truck) return null;
    return getProfileCompleteness(truck, menuItemCount);
  }, [truck, menuItemCount]);

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
          const [truckRes, menuRes] = await Promise.all([
            fetch(`/api/trucks/${truckId}`),
            fetch(`/api/trucks/${truckId}/menu`).catch(() => null),
          ]);
          const truckData = await truckRes.json();
          if (truckData.success) {
            setTruck(truckData.data);
            setIsOpen(truckData.data.isOpen || false);
            setIsVisible(truckData.data.isVisible !== false);
            if (truckData.data.currentLocation?.address) {
              setAddressInput(truckData.data.currentLocation.address);
            } else if (truckData.data.address) {
              setAddressInput(truckData.data.address);
            }
            if (truckData.data.currentLocation?.note) {
              setLocationNote(truckData.data.currentLocation.note);
            }
          }
          if (menuRes) {
            const menuData = await menuRes.json();
            if (menuData.success && Array.isArray(menuData.data)) {
              setMenuItemCount(menuData.data.length);
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
      <div className="p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-12 w-64 bg-white/10" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-[24px] bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8 text-white">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="role-panel-dark-strong mb-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8"
        >
          <div>
            <div className="role-pill-dark mb-4">
              <IconTruck className="h-4 w-4 text-orange-300" />
              Owner dashboard
            </div>
            <h1 className="mb-1 font-display text-3xl font-bold text-white sm:text-4xl">
              {truck?.name || 'Your Truck'} Dashboard
            </h1>
            <p className="text-white/60">Manage your live status, location, menu, and visibility from one place.</p>
          </div>
        </motion.div>

        {/* Profile Completeness Banner */}
        {completeness && completeness.score < 80 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="role-panel-dark border-orange-300/15 bg-orange-400/[0.06] shadow-xl">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-orange-100">
                      Complete your profile to attract more customers
                    </h3>
                    <p className="mt-1 text-sm text-orange-100/65">
                      Trucks with complete profiles get 3× more views
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl font-bold text-white">
                      {completeness.score}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4 h-3 overflow-hidden rounded-full bg-black/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                  />
                </div>

                {/* Missing items */}
                {completeness.missing.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {completeness.missing
                      .sort((a, b) => b.points - a.points)
                      .slice(0, 3)
                      .map((item) => (
                        <Link
                          key={item.key}
                          href={item.href}
                          className="group flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/15 px-4 py-3 text-sm transition-colors hover:bg-white/[0.08]"
                        >
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-xs font-bold text-orange-100">
                            +{item.points}
                          </span>
                          <span className="text-white/75 transition-colors group-hover:text-white">
                            {item.label}
                          </span>
                          <IconArrowRight className="ml-auto h-4 w-4 text-white/35 transition-colors group-hover:text-orange-100" />
                        </Link>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Location & Status Card - Main Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="role-panel-dark mb-6 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400">
                  <IconMapPin className="w-4 h-4 text-white" />
                </div>
                Where are you today?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Open/Closed Toggle - Prominent */}
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isOpen
                ? 'bg-emerald-400/10 border-emerald-300/30'
                : 'bg-black/20 border-white/10'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full ${isOpen ? 'bg-emerald-300 animate-pulse shadow-lg shadow-emerald-400/40' : 'bg-white/30'}`} />
                  <div>
                    <p className="text-lg font-bold text-white">{isOpen ? 'You are open now' : 'You are currently closed'}</p>
                    <p className="text-sm text-white/55">{isOpen ? 'Customers can find you on the map.' : 'Your truck is hidden from discovery.'}</p>
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
                  <Label className="font-medium text-white/75">Current Location</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={useCurrentLocation}
                      disabled={updatingLocation}
                      className="rounded-full bg-white/8 text-white hover:bg-white/12"
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
                    className="role-input-dark"
                  />
                  <Input
                    placeholder="Note (e.g., Near the fountain)"
                    value={locationNote}
                    onChange={(e) => setLocationNote(e.target.value)}
                    className="role-input-dark text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-medium text-white/75">Today's Hours</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="role-input-dark"
                    />
                    <span className="text-slate-400 font-medium">to</span>
                    <Input
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="role-input-dark"
                    />
                  </div>
                  <p className="text-xs text-white/40">
                    Set your operating hours for today
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link href="/owner/schedule" className="flex items-center gap-1 text-sm font-medium text-orange-200 hover:text-orange-100">
                  <IconCalendar className="w-4 h-4" />
                  Plan future schedule →
                </Link>
                <Button
                  onClick={saveAddressLocation}
                  disabled={updatingLocation}
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-400 font-semibold text-slate-950 shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-amber-300"
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
            { icon: IconShoppingBag, label: "Today's Orders", value: stats.todayOrders, color: 'bg-sky-500/15', textColor: 'text-sky-200' },
            { icon: IconDollarSign, label: "Today's Revenue", value: `$${stats.todayRevenue}`, color: 'bg-emerald-500/15', textColor: 'text-emerald-200' },
            { icon: IconUsers, label: 'Active Customers', value: stats.activeCustomers, color: 'bg-violet-500/15', textColor: 'text-violet-200' },
            { icon: IconClock, label: 'Avg Prep Time', value: stats.avgPrepTime, color: 'bg-amber-500/15', textColor: 'text-amber-200' },
          ].map((stat) => (
            <Card key={stat.label} className="role-stat-dark shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className={`font-display text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    <p className="text-sm text-white/50">{stat.label}</p>
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
            { icon: IconUtensils, label: 'Manage Menu', href: '/owner/menu', desc: 'Edit items, categories, and prices', color: 'bg-orange-500/15 text-orange-100' },
            { icon: IconShoppingBag, label: 'View Orders', href: '/owner/orders', desc: 'Process incoming orders', color: 'bg-sky-500/15 text-sky-100' },
            { icon: IconTrendingUp, label: 'Analytics', href: '/owner/analytics', desc: 'View sales and performance', color: 'bg-emerald-500/15 text-emerald-100' },
            { icon: IconCalendar, label: 'Schedule', href: '/owner/schedule', desc: 'Plan future locations and dates', color: 'bg-violet-500/15 text-violet-100' },
            { icon: IconSettings, label: 'Truck Settings', href: '/owner/profile', desc: 'Edit profile and hours', color: 'bg-white/10 text-white' },
            { icon: IconDollarSign, label: 'Billing', href: '/owner/billing', desc: 'Manage payments', color: 'bg-amber-500/15 text-amber-100' },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="role-panel-dark group h-full cursor-pointer transition-all hover:border-orange-300/20 hover:bg-white/[0.08] shadow-lg">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.color} transition-transform group-hover:scale-110`}>
                    <action.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white transition-colors group-hover:text-orange-100">{action.label}</h3>
                    <p className="text-sm text-white/50">{action.desc}</p>
                  </div>
                  <IconChevronRight className="h-5 w-5 text-white/30 transition-colors group-hover:text-white/80" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
