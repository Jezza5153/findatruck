'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    IconBell, IconMapPin, IconTrash2, IconShield, IconMail, IconSmartphone,
    IconLoader2, IconChevronRight, IconAlertTriangle
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
    const { data: session, status } = useSession();
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
        setSettings(prev => ({ ...prev, [key]: value }));

        // Debounce save
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
            <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
                <IconLoader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <h1 className="text-2xl font-bold text-slate-800">Settings ⚙️</h1>
                    <p className="text-slate-500">Customize your FindATruck experience</p>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 space-y-6">
                {/* Notification Radius */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border-2 border-orange-100 p-6 shadow-md"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <IconMapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Notification Radius</h3>
                            <p className="text-sm text-slate-500">Alert range for nearby trucks</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">1 km</span>
                            <span className="text-2xl font-bold text-orange-600">{settings.notificationRadius} km</span>
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
                </motion.div>

                {/* Notification Preferences */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border-2 border-orange-100 shadow-md"
                >
                    <div className="p-4 border-b border-orange-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                <IconBell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Notifications</h3>
                                <p className="text-sm text-slate-400">What alerts you receive</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-orange-100">
                        {[
                            { key: 'truckNearbyAlerts' as const, label: 'Trucks nearby', desc: 'When a truck is within your radius' },
                            { key: 'favoriteUpdates' as const, label: 'Favorite updates', desc: 'When your favorites go live' },
                            { key: 'specialsAlerts' as const, label: 'Specials & deals', desc: 'New promotions from trucks' },
                            { key: 'orderUpdates' as const, label: 'Order updates', desc: 'Status changes for your orders' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4">
                                <div>
                                    <Label className="text-slate-700 font-medium">{item.label}</Label>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </div>
                                <Switch
                                    checked={settings[item.key]}
                                    onCheckedChange={(checked) => updateSetting(item.key, checked)}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Delivery Method */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 rounded-xl border border-slate-700/30"
                >
                    <div className="p-4 border-b border-slate-700/30">
                        <h3 className="font-semibold">Delivery Method</h3>
                    </div>

                    <div className="divide-y divide-slate-700/30">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <IconMail className="w-5 h-5 text-slate-400" />
                                <Label className="text-white">Email notifications</Label>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <IconSmartphone className="w-5 h-5 text-slate-400" />
                                <Label className="text-white">Push notifications</Label>
                            </div>
                            <Switch
                                checked={settings.pushNotifications}
                                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Privacy & Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 rounded-xl border border-slate-700/30"
                >
                    <div className="p-4 border-b border-slate-700/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <IconShield className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Privacy & Security</h3>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-700/30">
                        <button
                            onClick={() => router.push('/forgot-password')}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                        >
                            <span>Change password</span>
                            <IconChevronRight className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-red-500/10 rounded-xl border border-red-500/20 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <IconAlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="font-semibold text-red-400">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                        Deleting your account will permanently remove all your data, favorites, and loyalty stamps.
                    </p>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                <IconTrash2 className="w-4 h-4 mr-2" />
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                    This action cannot be undone. All your data will be permanently deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    Delete Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </motion.div>
            </div>
        </div>
    );
}
