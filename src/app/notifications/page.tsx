'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Bell, MapPin, Gift, Star, Tag, ShoppingBag, Check,
    Loader2, BellOff, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = 'truck_nearby' | 'favorite_live' | 'special' | 'reward_unlocked' | 'order_update';

interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message?: string | null;
    truckId?: string | null;
    truckName?: string;
    isRead: boolean;
    createdAt: string;
}

const notificationIcons: Record<NotificationType, typeof Bell> = {
    truck_nearby: MapPin,
    favorite_live: Star,
    special: Tag,
    reward_unlocked: Gift,
    order_update: ShoppingBag,
};

const notificationColors: Record<NotificationType, string> = {
    truck_nearby: 'from-blue-500 to-cyan-500',
    favorite_live: 'from-yellow-500 to-orange-500',
    special: 'from-pink-500 to-rose-500',
    reward_unlocked: 'from-purple-500 to-violet-500',
    order_update: 'from-green-500 to-emerald-500',
};

export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login?redirect=/notifications');
            return;
        }

        if (status === 'authenticated') {
            fetchNotifications();
        }
    }, [status, router]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/user/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch {
            // Use sample data for now
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        try {
            await fetch(`/api/user/notifications/${id}/read`, { method: 'POST' });
        } catch {
            // Ignore error
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await fetch('/api/user/notifications/read-all', { method: 'POST' });
        } catch {
            // Ignore error
        }
    };

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await fetch(`/api/user/notifications/${id}`, { method: 'DELETE' });
        } catch {
            // Ignore error
        }
    };

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            {/* Header */}
            <div className="pt-8 pb-6 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Notifications</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-slate-400">{unreadCount} unread</p>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-slate-400 hover:text-white"
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-2xl px-4">
                {notifications.length === 0 ? (
                    // Empty state
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800 flex items-center justify-center">
                            <BellOff className="w-10 h-10 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No notifications</h2>
                        <p className="text-slate-400 mb-6">
                            You'll see alerts here when trucks go live or post specials
                        </p>
                        <Link href="/settings">
                            <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                                Notification Settings
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    // Notifications list
                    <div className="space-y-2">
                        {notifications.map((notification, i) => {
                            const Icon = notificationIcons[notification.type] || Bell;
                            const color = notificationColors[notification.type] || 'from-slate-500 to-slate-600';

                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={cn(
                                        "relative bg-slate-800/80 rounded-xl border overflow-hidden transition-all group",
                                        notification.isRead
                                            ? "border-slate-700/30 opacity-70"
                                            : "border-slate-700/50"
                                    )}
                                >
                                    <div
                                        className="p-4 flex items-start gap-4 cursor-pointer"
                                        onClick={() => {
                                            if (!notification.isRead) markAsRead(notification.id);
                                            if (notification.truckId) router.push(`/trucks/${notification.truckId}`);
                                        }}
                                    >
                                        {/* Icon */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                                            color
                                        )}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className={cn(
                                                    "font-medium",
                                                    !notification.isRead && "text-white"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                            {notification.message && (
                                                <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
