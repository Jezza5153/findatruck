import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const [truck] = await db
            .select({
                name: trucks.name,
                cuisine: trucks.cuisine,
                description: trucks.description,
                imageUrl: trucks.imageUrl,
                address: trucks.address,
            })
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!truck) {
            return {
                title: 'Food Truck Not Found',
                description: 'This food truck could not be found on Food Truck Next 2 Me.',
            };
        }

        const title = `${truck.name} — ${truck.cuisine} Food Truck Adelaide`;
        const description = truck.description
            ? `${truck.description.substring(0, 150)}${truck.description.length > 150 ? '...' : ''} — Find ${truck.name} on Food Truck Next 2 Me.`
            : `${truck.name} is a ${truck.cuisine} food truck in Adelaide, South Australia. View their menu, location, and reviews on Food Truck Next 2 Me.`;

        return {
            title,
            description,
            alternates: { canonical: `https://foodtrucknext2me.com/trucks/${id}` },
            openGraph: {
                title: `${truck.name} — ${truck.cuisine} Food Truck`,
                description,
                type: 'website',
                ...(truck.imageUrl ? { images: [truck.imageUrl] } : {}),
            },
            other: {
                'script:ld+json': JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FoodEstablishment',
                    name: truck.name,
                    servesCuisine: truck.cuisine,
                    description: truck.description || undefined,
                    image: truck.imageUrl || undefined,
                    address: truck.address ? {
                        '@type': 'PostalAddress',
                        streetAddress: truck.address,
                        addressRegion: 'SA',
                        addressCountry: 'AU',
                    } : undefined,
                }),
            },
        };
    } catch {
        return {
            title: 'Food Truck',
            description: 'View this food truck on Food Truck Next 2 Me — Adelaide\'s food truck finder.',
        };
    }
}

export default function TruckLayout({ children }: { children: React.ReactNode }) {
    return children;
}
