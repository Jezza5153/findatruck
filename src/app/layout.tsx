import React from 'react'; // <-- Required for React namespace functions (isValidElement)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Truck Tracker - Find Your Next Favorite Food Truck!',
  description: 'Connect with mobile food vendors in real time. Find food trucks, see menus, and place orders.',
  manifest: '/manifest.json',
  keywords: [
    'food trucks', 'mobile food', 'local food', 'street food', 'find food',
    'food near me', 'truck tracker'
  ],
  authors: [{ name: 'Firebase Studio Project' }],
  openGraph: {
    title: 'Truck Tracker - Find Your Next Favorite Food Truck!',
    description: 'Discover and connect with local food trucks.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(210 40% 98%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(210 40% 10%)' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="hsl(210 40% 98%)" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="hsl(210 40% 10%)" media="(prefers-color-scheme: dark)" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {/* Accessibility skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only absolute top-0 left-0 bg-primary text-primary-foreground px-4 py-2 z-50"
        >
          Skip to content
        </a>
        <div className="relative flex min-h-dvh flex-col">
          <SiteHeader />
          <main
            id="main-content"
            role="main"
            tabIndex={-1}
            className="flex-1 outline-none"
          >
            {/* Robustly ensure no Children.only error */}
            {React.isValidElement(children) ? children : <div>{children}</div>}
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
