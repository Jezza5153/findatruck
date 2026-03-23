import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Food Truck Map in Adelaide',
  description:
    'Browse the live food truck map for Adelaide and South Australia. See what is open now, search by cuisine, and get directions to food trucks near you.',
  alternates: { canonical: 'https://foodtrucknext2me.com/map' },
  openGraph: {
    title: 'Live Food Truck Map in Adelaide',
    description:
      'See which food trucks are open now across Adelaide and South Australia with the live discovery map.',
    url: 'https://foodtrucknext2me.com/map',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Food Truck Map in Adelaide',
    description:
      'Browse open-now food trucks across Adelaide and South Australia with the live map experience.',
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
