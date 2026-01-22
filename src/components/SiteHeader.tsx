'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, MapPin, Star, User, LogIn, LogOut,
  ChefHat, LayoutDashboard, Utensils, Settings, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/map', label: 'Find Trucks', icon: MapPin },
  { href: '/featured', label: 'Featured', icon: Star },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const userRole = (session?.user as any)?.role;
  const isOwner = userRole === 'owner';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Don't show header on auth pages
  const isAuthPage = pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/owner/login') ||
    pathname?.startsWith('/owner/signup');

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">
              Findatruck
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* Notifications (placeholder) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-white/10 hidden sm:flex"
                >
                  <Bell className="w-5 h-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full ring-2 ring-slate-600/50 hover:ring-primary/50 transition-all"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-yellow-500 text-white font-semibold">
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-white">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-slate-400">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />

                    {isOwner ? (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-slate-700 cursor-pointer">
                          <Link href="/owner/dashboard" className="flex items-center">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-slate-700 cursor-pointer">
                          <Link href="/owner/menu" className="flex items-center">
                            <Utensils className="mr-2 h-4 w-4" />
                            Manage Menu
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-slate-700 cursor-pointer">
                          <Link href="/owner/profile" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-slate-700 cursor-pointer">
                          <Link href="/customer/dashboard" className="flex items-center">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            My Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-slate-700 cursor-pointer">
                          <Link href="/customer/notifications" className="flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="hover:bg-slate-700 cursor-pointer text-red-400 focus:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button className="bg-gradient-to-r from-primary to-yellow-500 hover:from-primary/90 hover:to-yellow-500/90 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-slate-900/95 border-t border-slate-700/50"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              {isAuthenticated && (
                <>
                  <div className="border-t border-slate-700/50 my-2 pt-2" />
                  {isOwner ? (
                    <Link
                      href="/owner/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/customer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5"
                    >
                      <User className="w-5 h-5" />
                      My Account
                    </Link>
                  )}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
