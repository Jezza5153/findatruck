import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from '@/components/SessionProvider';
import CustomerBottomNav from '@/components/CustomerBottomNav';
import { cn } from '@/lib/utils';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://foodtrucknext2me.com'),
  title: {
    default: 'Food Truck Next 2 Me — Find Food Trucks in Adelaide & South Australia',
    template: '%s | Food Truck Next 2 Me',
  },
  description: 'Find the best food trucks near you in Adelaide and South Australia. Live locations, menus, reviews, and real-time tracking. Your next favourite meal on wheels is just a tap away!',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  keywords: [
    'food trucks Adelaide', 'food trucks South Australia', 'Adelaide street food',
    'food truck near me', 'food truck finder Adelaide', 'SA food trucks',
    'food truck tracker', 'mobile food Adelaide', 'food vans South Australia',
    'Adelaide food events', 'street food SA', 'best food trucks Adelaide',
    'food truck map Adelaide', 'food truck next to me', 'foodtrucknext2me',
    'food truck catering Adelaide', 'Adelaide food vendors', 'local food trucks',
  ],
  authors: [{ name: 'Food Truck Next 2 Me' }],
  alternates: {
    canonical: 'https://foodtrucknext2me.com',
  },
  openGraph: {
    title: 'Food Truck Next 2 Me — Find Food Trucks in Adelaide & SA',
    description: 'Discover and track the best food trucks across Adelaide and South Australia. Live locations, menus, and more.',
    type: 'website',
    locale: 'en_AU',
    url: 'https://foodtrucknext2me.com',
    siteName: 'Food Truck Next 2 Me',
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Food Truck Next 2 Me — Adelaide Food Truck Finder',
    description: 'Find the best food trucks near you in Adelaide & South Australia. Live tracking, menus, and reviews.',
  },
  robots: {
    index: true,
    follow: true,
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
        <meta name="geo.region" content="AU-SA" />
        <meta name="geo.placename" content="Adelaide" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Food Truck Next 2 Me',
              url: 'https://foodtrucknext2me.com',
              description: 'Find the best food trucks near you in Adelaide and South Australia.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://foodtrucknext2me.com/?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Food Truck Next 2 Me',
              url: 'https://foodtrucknext2me.com',
              logo: 'https://foodtrucknext2me.com/logo.png',
              areaServed: {
                '@type': 'State',
                name: 'South Australia',
                containedInPlace: { '@type': 'Country', name: 'Australia' },
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <SessionProvider>
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
              {React.isValidElement(children) ? children : <div>{children === null || children === undefined ? null : children}</div>}
            </main>
            <SiteFooter />
          </div>
          <CustomerBottomNav />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
