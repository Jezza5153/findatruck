// /app/owner/layout.tsx
'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard, IconUtensils, IconShoppingCart, IconCalendarClock,
  IconTrendingUp, IconSettings, IconChefHat, IconArrowLeft, IconSparkles
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
    <div className="role-shell flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-white/10 bg-[#130f0c]/70 backdrop-blur-xl lg:flex">
        {/* Logo */}
        <div className="border-b border-white/10 p-6">
          <Link href="/owner/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/25">
              <IconChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="block font-display text-xl font-bold text-white">Owner Studio</span>
              <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">
                Food Truck Next 2 Me
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="px-6 pt-5">
          <div className="role-pill-dark">
            <IconSparkles className="h-3.5 w-3.5 text-orange-300" />
            Back-office
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 p-4 pt-5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/25"
                    : "text-white/65 hover:bg-white/[0.08] hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#140f0c]/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="role-panel-dark flex items-center justify-between px-4 py-3">
          <Link href="/owner/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400">
              <IconChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold text-white">Owner Studio</span>
              <span className="block text-[11px] text-orange-200/70">Operations</span>
            </div>
          </Link>
          <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/65">
            Site
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#140f0c]/85 px-2 py-2 backdrop-blur-2xl lg:hidden">
        <div className="role-panel-dark flex justify-around px-2 py-2">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs transition-all",
                  isActive
                    ? "bg-orange-400/12 text-orange-200"
                    : "text-white/45 hover:text-white/80"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-orange-200")} />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto pb-24 pt-20 lg:pb-0 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
