import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'List Your Food Truck — Pricing & Plans',
    description: 'Register your food truck on Food Truck Next 2 Me. Reach thousands of hungry customers in Adelaide and South Australia. Free listing available, premium plans for more visibility.',
    alternates: { canonical: 'https://foodtrucknext2me.com/pricing' },
    openGraph: {
        title: 'Food Truck Listing Plans — Food Truck Next 2 Me',
        description: 'List your food truck and reach hungry customers across Adelaide and South Australia. Plans starting from free.',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
}
