import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Help & FAQ — Food Truck Next 2 Me',
    description: 'Get answers to common questions about finding food trucks in Adelaide. Learn how to use the map, track trucks, check in, and more.',
    alternates: { canonical: 'https://foodtrucknext2me.com/help' },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
    return children;
}
