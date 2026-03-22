'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  IconLayoutDashboard, IconMessageSquare, IconTruck,
  IconUsers, IconArrowLeft, IconLogOut,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Admin Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Back to site + nav links */}
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-2"
              >
                <IconArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Site</span>
              </Link>

              <div className="w-px h-6 bg-slate-700 mr-2" />

              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                      isActive
                        ? 'bg-slate-700/80 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: User + sign out */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <IconLogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {children}
    </div>
  );
}
