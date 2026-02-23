import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Featured Food Trucks — Best Street Food in Adelaide',
    description: 'Discover Adelaide\'s top-rated food trucks. From tacos to gelato, find the best street food vendors in South Australia, handpicked for quality and flavour.',
    alternates: { canonical: 'https://foodtrucknext2me.com/featured' },
    openGraph: {
        title: 'Featured Food Trucks in Adelaide',
        description: 'Adelaide\'s best food trucks, handpicked for quality. Discover top-rated street food vendors.',
    },
};

export default function FeaturedLayout({ children }: { children: React.ReactNode }) {
    return children;
}
