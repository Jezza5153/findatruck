import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Food Truck Map — Live Locations in Adelaide & South Australia',
    description: 'View all food trucks on a live map across Adelaide and South Australia. See which trucks are open now, browse menus, and get directions to your nearest food truck.',
    alternates: { canonical: 'https://foodtrucknext2me.com/map' },
    openGraph: {
        title: 'Live Food Truck Map — Adelaide & SA',
        description: 'Track food trucks in real-time across Adelaide. Find what\'s open near you right now.',
    },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
    return children;
}
