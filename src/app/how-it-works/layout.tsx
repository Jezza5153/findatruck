import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How It Works — Find Food Trucks Near You in Adelaide',
    description: 'Learn how Food Truck Next 2 Me helps you discover food trucks in Adelaide and South Australia. For customers: find, track, and visit. For owners: list your truck and reach hungry Aussies.',
    alternates: { canonical: 'https://foodtrucknext2me.com/how-it-works' },
    openGraph: {
        title: 'How Food Truck Next 2 Me Works',
        description: 'Find, track, and visit the best food trucks in Adelaide. Or list your own truck and grow your business.',
    },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
    return children;
}
