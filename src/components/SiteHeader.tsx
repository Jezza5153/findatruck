'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMenu, IconX, IconMapPin, IconStar, IconUser, IconLogIn, IconLogOut,
  IconChefHat, IconLayoutDashboard, IconUtensils, IconSettings, IconBell, IconBookOpen,
  IconArrowRight, IconSparkles
} from '@/components/ui/branded-icons';
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
  { href: '/map', label: 'Find Trucks', icon: IconMapPin },
  { href: '/featured', label: 'Featured', icon: IconStar },
  { href: '/hire-food-truck', label: 'Hire', icon: IconChefHat },
  { href: '/blog', label: 'Blog', icon: IconBookOpen },
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
    <header className="sticky top-0 z-50 w-full border-b border-orange-200/60 bg-white/70 backdrop-blur-2xl">
      <div className="container mx-auto px-4 py-3">
        <div className="surface-panel flex min-h-[72px] items-center justify-between gap-3 px-4 py-3 sm:px-5">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <div className="rounded-2xl border border-orange-200/80 bg-white p-1.5 shadow-sm">
              <img
                src="/logo.png"
                alt="Food Truck Next 2 Me"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="font-display text-lg font-bold leading-none text-slate-900">
                Food Truck Next 2 Me
              </p>
              <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.18em] text-orange-700/80">
                Adelaide Live Truck Radar
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-orange-200/70"
                      : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-orange-200 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* Notifications (placeholder) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden text-slate-500 hover:bg-orange-50 hover:text-orange-700 sm:flex"
                >
                  <IconBell className="w-5 h-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full ring-2 ring-orange-200 hover:ring-orange-400 transition-all"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || 'User'} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-yellow-500 text-white font-semibold">
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-orange-100 text-slate-800 shadow-xl">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-slate-500">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-orange-100" />

                    {isOwner ? (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-orange-50 cursor-pointer">
                          <Link href="/owner/dashboard" className="flex items-center">
                            <IconLayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-orange-50 cursor-pointer">
                          <Link href="/owner/menu" className="flex items-center">
                            <IconUtensils className="mr-2 h-4 w-4" />
                            Manage Menu
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-orange-50 cursor-pointer">
                          <Link href="/owner/profile" className="flex items-center">
                            <IconSettings className="mr-2 h-4 w-4" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-orange-50 cursor-pointer">
                          <Link href="/customer/dashboard" className="flex items-center">
                            <IconLayoutDashboard className="mr-2 h-4 w-4" />
                            My Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-orange-50 cursor-pointer">
                          <Link href="/customer/notifications" className="flex items-center">
                            <IconBell className="mr-2 h-4 w-4" />
                            Notifications
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator className="bg-orange-100" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="hover:bg-red-50 cursor-pointer text-red-500 focus:text-red-500"
                    >
                      <IconLogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                >
                  <Link href="/login">
                    <IconLogIn className="w-4 h-4 mr-2" />
                    Sign in
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="hidden border-orange-200 bg-white/90 text-slate-800 hover:bg-orange-50 lg:inline-flex"
                >
                  <Link href="/owner/signup">
                    <IconChefHat className="h-4 w-4" />
                    List Your Truck
                  </Link>
                </Button>
                <Button
                  asChild
                  className="cta-sheen hidden sm:inline-flex bg-gradient-to-r from-orange-500 via-orange-500 to-amber-400 text-white shadow-glow hover:from-orange-600 hover:to-amber-500"
                >
                  <Link href="/signup">
                    Join Free
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-site-nav"
              className="lg:hidden text-slate-600 hover:bg-orange-50 hover:text-orange-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
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
            id="mobile-site-nav"
            className="overflow-hidden lg:hidden"
          >
            <div className="container mx-auto px-4 pb-3">
              <div className="surface-panel space-y-3 px-4 py-4">
                <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  <IconSparkles className="h-4 w-4" />
                  Built for Adelaide food lovers
                </div>
                <nav className="space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
                </nav>

              {isAuthenticated && (
                <>
                  <div className="my-2 border-t border-orange-100 pt-2" />
                  {isOwner ? (
                    <Link
                      href="/owner/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <IconLayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/customer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <IconUser className="w-5 h-5" />
                      My Account
                    </Link>
                  )}
                </>
              )}
                {!isAuthenticated && (
                  <div className="grid gap-2 border-t border-orange-100 pt-3 sm:grid-cols-2">
                    <Button asChild className="cta-sheen bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-500">
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        Join Free
                        <IconArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-orange-200 bg-white text-slate-800 hover:bg-orange-50">
                      <Link href="/owner/signup" onClick={() => setMobileMenuOpen(false)}>
                        <IconChefHat className="h-4 w-4" />
                        List Your Truck
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
