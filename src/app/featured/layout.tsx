import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Featured Food Trucks in Adelaide',
  description:
    'Discover featured food trucks in Adelaide and South Australia. Explore curated standout trucks, stronger first picks, and event-worthy food brands.',
  alternates: { canonical: 'https://foodtrucknext2me.com/featured' },
  openGraph: {
    title: 'Featured Food Trucks in Adelaide',
    description:
      'Explore curated Adelaide food trucks with stronger quality signals, standout menus, and event inspiration.',
    url: 'https://foodtrucknext2me.com/featured',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Featured Food Trucks in Adelaide',
    description:
      'Discover curated standout food trucks in Adelaide and South Australia on Food Truck Next 2 Me.',
  },
};

export default function FeaturedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
