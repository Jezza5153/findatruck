'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconBell,
  IconMapPin,
  IconTrash2,
  IconShield,
  IconMail,
  IconSmartphone,
  IconLoader2,
  IconChevronRight,
  IconAlertTriangle,
  IconSettings,
} from '@/components/ui/branded-icons';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface UserSettings {
  notificationRadius: number;
  truckNearbyAlerts: boolean;
  favoriteUpdates: boolean;
  specialsAlerts: boolean;
  orderUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const defaultSettings: UserSettings = {
  notificationRadius: 5,
  truckNearbyAlerts: true,
  favoriteUpdates: true,
  specialsAlerts: true,
  orderUpdates: true,
  emailNotifications: false,
  pushNotifications: true,
};

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/settings');
      return;
    }

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/user/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch {
      // Use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsSaving(true);
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      // Ignore error
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/user', { method: 'DELETE' });
      router.push('/');
    } catch {
      // Handle error
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="ambient-shell flex min-h-screen items-center justify-center">
        <IconLoader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="ambient-shell min-h-screen px-4 py-8 pb-24">
      <div className="container mx-auto max-w-3xl space-y-6">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="surface-panel p-6 sm:p-8">
          <div className="eyebrow-chip">
            <IconSettings className="h-4 w-4 text-orange-500" />
            Experience controls
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-950">Settings</h1>
              <p className="mt-2 text-lg leading-8 text-slate-600">Customize how Food Truck Next 2 Me keeps you informed and how far it should look for updates.</p>
            </div>
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              {isSaving ? 'Saving...' : 'Synced'}
            </span>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-frame p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <IconMapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-950">Notification Radius</h2>
              <p className="text-sm text-slate-500">Alert range for nearby trucks and relevant updates.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">1 km</span>
              <span className="font-display text-4xl font-bold text-orange-600">{settings.notificationRadius} km</span>
              <span className="text-sm text-slate-500">25 km</span>
            </div>
            <Slider
              value={[settings.notificationRadius]}
              onValueChange={([val]) => updateSetting('notificationRadius', val)}
              min={1}
              max={25}
              step={1}
              className="w-full"
            />
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="surface-panel overflow-hidden border-none shadow-none">
          <div className="border-b border-orange-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                <IconBell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-950">Notifications</h2>
                <p className="text-sm text-slate-500">Choose the alerts that are worth your attention.</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-orange-100">
            {[
              { key: 'truckNearbyAlerts' as const, label: 'Trucks nearby', desc: 'When a truck is within your radius' },
              { key: 'favoriteUpdates' as const, label: 'Favorite updates', desc: 'When your favorites go live' },
              { key: 'specialsAlerts' as const, label: 'Specials and deals', desc: 'New promotions from trucks you may care about' },
              { key: 'orderUpdates' as const, label: 'Order updates', desc: 'Status changes for your orders' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 p-5">
                <div>
                  <Label className="text-base font-semibold text-slate-800">{item.label}</Label>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
                <Switch checked={settings[item.key]} onCheckedChange={(checked) => updateSetting(item.key, checked)} />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="surface-panel overflow-hidden border-none shadow-none">
          <div className="border-b border-orange-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <IconSmartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-950">Delivery Method</h2>
                <p className="text-sm text-slate-500">Decide how notifications should reach you.</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-orange-100">
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <IconMail className="h-5 w-5 text-orange-500" />
                <Label className="text-base font-semibold text-slate-800">Email notifications</Label>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => updateSetting('emailNotifications', checked)} />
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <IconSmartphone className="h-5 w-5 text-orange-500" />
                <Label className="text-base font-semibold text-slate-800">Push notifications</Label>
              </div>
              <Switch checked={settings.pushNotifications} onCheckedChange={(checked) => updateSetting('pushNotifications', checked)} />
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="surface-panel overflow-hidden border-none shadow-none">
          <div className="border-b border-orange-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <IconShield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-950">Privacy and Security</h2>
                <p className="text-sm text-slate-500">Control the parts of your account that matter most.</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-orange-100">
            <button
              onClick={() => router.push('/forgot-password')}
              className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-orange-50"
            >
              <span className="font-semibold text-slate-800">Change password</span>
              <IconChevronRight className="h-5 w-5 text-orange-500" />
            </button>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[28px] border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <IconAlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="font-display text-2xl font-bold text-slate-950">Danger Zone</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Deleting your account permanently removes your data, favorites, and loyalty activity.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="mt-5 rounded-full border-red-200 text-red-500 hover:bg-red-50">
                <IconTrash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-orange-100 bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500">
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-orange-100">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>
      </div>
    </div>
  );
}
