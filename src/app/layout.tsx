
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Truck Tracker - Find Your Next Favorite Food Truck!',
  description: 'Connect with mobile food vendors in real time. Find food trucks, see menus, and place orders.',
  manifest: '/manifest.json',
  keywords: ['food trucks', 'mobile food', 'local food', 'street food', 'find food', 'food near me', 'truck tracker'],
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
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <div className="relative flex min-h-dvh flex-col"> 
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
