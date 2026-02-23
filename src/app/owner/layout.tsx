// /app/owner/layout.tsx
'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard, IconUtensils, IconShoppingCart, IconCalendarClock,
  IconTrendingUp, IconSettings, IconChefHat
} from "@/components/ui/branded-icons";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/owner/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/owner/menu", label: "Menu", icon: IconUtensils },
  { href: "/owner/orders", label: "Orders", icon: IconShoppingCart },
  { href: "/owner/schedule", label: "Schedule", icon: IconCalendarClock },
  { href: "/owner/analytics", label: "Analytics", icon: IconTrendingUp },
  { href: "/owner/profile", label: "Settings", icon: IconSettings },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar on login/signup pages
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/owner/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <IconChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Food Truck Next 2 Me</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
              <IconChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Owner Portal</span>
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 px-2 py-2">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all",
                  isActive
                    ? "text-orange-400"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-orange-400")} />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0 pb-20 lg:pb-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
