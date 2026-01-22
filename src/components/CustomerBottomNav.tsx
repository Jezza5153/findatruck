'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { IconMap, IconHeart, IconGift, IconBell, IconUser } from '@/components/ui/branded-icons';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    label: string;
    icon: typeof IconMap;
}

const navItems: NavItem[] = [
    { href: '/map', label: 'Map', icon: IconMap },
    { href: '/favorites', label: 'Favorites', icon: IconHeart },
    { href: '/loyalty', label: 'Loyalty', icon: IconGift },
    { href: '/notifications', label: 'Alerts', icon: IconBell },
    { href: '/profile', label: 'Profile', icon: IconUser },
];

export default function CustomerBottomNav() {
    const pathname = usePathname();

    // Only show on customer routes
    const customerRoutes = ['/map', '/favorites', '/loyalty', '/notifications', '/profile', '/settings', '/trucks'];
    const shouldShow = customerRoutes.some(route => pathname.startsWith(route));

    if (!shouldShow) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-orange-200 pb-safe md:hidden shadow-lg">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href === '/map' && pathname.startsWith('/trucks'));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-16 h-full",
                                "text-slate-400 transition-colors",
                                isActive && "text-orange-500"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="customer-nav-indicator"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-b-full"
                                    transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                                />
                            )}
                            <item.icon className={cn(
                                "w-5 h-5 mb-1 transition-transform",
                                isActive && "scale-110"
                            )} />
                            <span className={cn(
                                "text-[10px] font-medium",
                                isActive ? "text-orange-600" : "text-slate-500"
                            )}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
