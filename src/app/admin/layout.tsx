'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  IconLayoutDashboard, IconMessageSquare, IconTruck,
  IconUsers, IconArrowLeft, IconLogOut, IconSparkles,
} from '@/components/ui/branded-icons';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: IconLayoutDashboard },
  { href: '/admin/enquiries', label: 'Enquiries', icon: IconMessageSquare },
  { href: '/admin/trucks', label: 'Trucks', icon: IconTruck },
  { href: '/admin/users', label: 'Users', icon: IconUsers },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="role-shell">
      {/* Admin Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#140f0c]/80 backdrop-blur-2xl">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          <div className="role-panel-dark flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 sm:px-5">
            {/* Left: Back to site + nav links */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-2 text-orange-300 shadow-lg sm:flex">
                <IconSparkles className="h-5 w-5" />
              </div>
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <IconArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Site</span>
              </Link>

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="hidden flex-wrap items-center gap-1.5 lg:flex">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/20'
                          : 'text-white/65 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: User + sign out */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/70">
                  Platform control
                </p>
                <span className="text-sm text-white/70">
                  {session?.user?.name || session?.user?.email}
                </span>
              </div>
              <span className="role-pill-dark hidden md:inline-flex">
                <IconSparkles className="h-3.5 w-3.5 text-orange-300" />
                Admin
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-red-300/30 hover:bg-red-400/10 hover:text-red-100"
              >
                <IconLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                    isActive
                      ? 'border-orange-400/40 bg-orange-400/15 text-orange-100'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
