
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter font
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
  title: 'FindATruck - Find Your Next Favorite Food Truck!',
  description: 'Connect with mobile food vendors in real time. Find food trucks, see menus, and place orders.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* The theme-color will be dynamically picked up by primary color from globals.css. 
            If a specific static color is desired, it can be set here.
            For example: <meta name="theme-color" content="#2563EB" /> for a blue.
            For now, relying on browser heuristics or PWA manifest.
        */}
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
