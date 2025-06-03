
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
  title: 'FindATruck - Find Your Next Favorite Food Truck!',
  description: 'Connect with mobile food vendors in real time. Find food trucks, see menus, and place orders.',
  manifest: '/manifest.json',
  keywords: ['food trucks', 'mobile food', 'local food', 'street food', 'find food', 'food near me'],
  authors: [{ name: 'Firebase Studio Project' }],
  // Open Graph and Twitter Card metadata can be added here for better social sharing
  openGraph: {
    title: 'FindATruck - Find Your Next Favorite Food Truck!',
    description: 'Discover and connect with local food trucks.',
    type: 'website',
    // url: 'YOUR_PRODUCTION_URL_HERE', // Replace with your actual deployed URL
    // images: [
    //   {
    //     url: 'YOUR_OG_IMAGE_URL_HERE', // Replace with a URL to a preview image
    //     width: 1200,
    //     height: 630,
    //     alt: 'FindATruck Logo and Food Truck Montage',
    //   },
    // ],
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'FindATruck - Find Your Next Favorite Food Truck!',
  //   description: 'Discover and connect with local food trucks.',
  //   // images: ['YOUR_TWITTER_IMAGE_URL_HERE'], // Replace with a URL to a preview image
  // },
};

export const viewport: Viewport = {
  themeColor: [ // You can define multiple theme colors for light/dark mode
    { media: '(prefers-color-scheme: light)', color: 'hsl(210 40% 98%)' }, // Corresponds to --background HSL
    { media: '(prefers-color-scheme: dark)', color: 'hsl(210 40% 10%)' },  // Corresponds to dark --background HSL
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: Prevent zooming if desired for PWA feel
  // minimumScale: 1, // Optional
  // userScalable: false, // Optional: if maximumScale is 1, userScalable is often false
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
        <div className="relative flex min-h-dvh flex-col"> {/* Use dvh for dynamic viewport height */}
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
