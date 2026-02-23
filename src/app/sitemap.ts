import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = 'https://foodtrucknext2me.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/map`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
        { url: `${BASE_URL}/featured`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${BASE_URL}/food-trucks`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
        { url: `${BASE_URL}/owner/signup`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
        { url: `${BASE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
        { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    ];

    // Location landing pages
    const locations = ['adelaide-cbd', 'glenelg', 'henley-beach', 'adelaide-hills', 'mclaren-vale', 'barossa-valley', 'port-adelaide', 'norwood'];
    const locationPages: MetadataRoute.Sitemap = locations.map((loc) => ({
        url: `${BASE_URL}/food-trucks/${loc}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Cuisine landing pages
    const cuisines = ['mexican', 'italian', 'greek', 'asian', 'bbq', 'desserts', 'coffee', 'vegan'];
    const cuisinePages: MetadataRoute.Sitemap = cuisines.map((c) => ({
        url: `${BASE_URL}/food-trucks/cuisine/${c}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Dynamic truck pages
    let truckPages: MetadataRoute.Sitemap = [];
    try {
        const allTrucks = await db
            .select({ id: trucks.id, updatedAt: trucks.updatedAt })
            .from(trucks)
            .where(eq(trucks.isVisible, true));

        truckPages = allTrucks.map((truck) => ({
            url: `${BASE_URL}/trucks/${truck.id}`,
            lastModified: truck.updatedAt,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        }));
    } catch {
        // DB may not be available during build
    }

    return [...staticPages, ...locationPages, ...cuisinePages, ...truckPages];
}
