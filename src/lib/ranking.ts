import { db } from '@/lib/db';
import { trucks } from '@/lib/db/schema';
import { eq, and, isNotNull, gte, desc, sql } from 'drizzle-orm';

/**
 * Ranking/discovery algorithm for map results.
 * Scores trucks based on multiple factors for relevance ranking.
 */

interface RankingFactors {
    // Weights for each factor (0-1)
    proximity: number;       // Distance from user
    isOpen: number;          // Currently open
    rating: number;          // Average rating
    recentActivity: number;  // Recent check-ins
    isFeatured: number;      // Premium listing
    isVerified: number;      // Verified badge
}

const DEFAULT_WEIGHTS: RankingFactors = {
    proximity: 0.35,      // Closest trucks ranked higher
    isOpen: 0.25,         // Open trucks significantly boosted
    rating: 0.15,         // Higher rated trucks preferred
    recentActivity: 0.10, // Active trucks ranked higher
    isFeatured: 0.10,     // Featured trucks get a boost
    isVerified: 0.05,     // Small boost for verified
};

// Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

interface TruckWithScore {
    id: string;
    name: string;
    cuisine: string;
    description?: string | null;
    imageUrl?: string | null;
    rating?: number | null;
    numberOfRatings?: number | null;
    isOpen: boolean;
    isFeatured: boolean;
    isVerified: boolean;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
    updatedAt: Date;
    distance?: number;
    score: number;
}

/**
 * Get ranked trucks for discovery.
 * @param userLat User's latitude (optional)
 * @param userLng User's longitude (optional)
 * @param filters Additional filters
 * @param limit Max results
 */
export async function getRankedTrucks(
    userLat?: number,
    userLng?: number,
    filters?: {
        cuisine?: string;
        isOpen?: boolean;
        maxDistance?: number; // km
    },
    limit: number = 50
): Promise<TruckWithScore[]> {
    try {
        // Build query conditions
        const conditions = [];

        if (filters?.isOpen) {
            conditions.push(eq(trucks.isOpen, true));
        }

        if (filters?.cuisine) {
            conditions.push(sql`LOWER(${trucks.cuisine}) LIKE LOWER(${`%${filters.cuisine}%`})`);
        }

        // Fetch trucks
        let query = db
            .select()
            .from(trucks);

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as typeof query;
        }

        const allTrucks = await query.limit(limit * 2); // Fetch extra for filtering

        // Calculate scores
        const now = Date.now();
        const scoredTrucks: TruckWithScore[] = allTrucks.map(truck => {
            let score = 0;
            let distance: number | undefined;

            // Proximity score (inverse of distance, capped at 50km)
            if (userLat && userLng && truck.lat && truck.lng) {
                distance = calculateDistance(userLat, userLng, truck.lat, truck.lng);

                // Filter by max distance
                if (filters?.maxDistance && distance > filters.maxDistance) {
                    return null as unknown as TruckWithScore; // Will be filtered out
                }

                // Score: 1.0 at 0km, 0.0 at 50km
                const proximityScore = Math.max(0, 1 - distance / 50);
                score += proximityScore * DEFAULT_WEIGHTS.proximity;
            }

            // Open status (binary boost)
            if (truck.isOpen) {
                score += DEFAULT_WEIGHTS.isOpen;
            }

            // Rating score (normalized to 0-1)
            if (truck.rating) {
                const ratingScore = truck.rating / 5;
                score += ratingScore * DEFAULT_WEIGHTS.rating;
            }

            // Recent activity (based on updatedAt)
            const hoursSinceUpdate = (now - truck.updatedAt.getTime()) / (1000 * 60 * 60);
            const activityScore = Math.max(0, 1 - hoursSinceUpdate / 24); // Full score if updated in last hour
            score += activityScore * DEFAULT_WEIGHTS.recentActivity;

            // Featured boost
            if (truck.isFeatured) {
                score += DEFAULT_WEIGHTS.isFeatured;
            }

            // Verified boost
            if (truck.isVerified) {
                score += DEFAULT_WEIGHTS.isVerified;
            }

            return {
                id: truck.id,
                name: truck.name,
                cuisine: truck.cuisine,
                description: truck.description,
                imageUrl: truck.imageUrl,
                rating: truck.rating,
                numberOfRatings: truck.numberOfRatings,
                isOpen: truck.isOpen ?? false,
                isFeatured: truck.isFeatured ?? false,
                isVerified: truck.isVerified ?? false,
                lat: truck.lat,
                lng: truck.lng,
                address: truck.address,
                updatedAt: truck.updatedAt,
                distance,
                score,
            };
        }).filter(Boolean);

        // Sort by score descending
        scoredTrucks.sort((a, b) => b.score - a.score);

        // Return top results
        return scoredTrucks.slice(0, limit);
    } catch (error) {
        console.error('getRankedTrucks error:', error);
        return [];
    }
}

/**
 * Get trucks near a location.
 * Simple distance-based query without full ranking.
 */
export async function getTrucksNearLocation(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    limit: number = 20
) {
    const allTrucks = await db
        .select()
        .from(trucks)
        .where(
            and(
                isNotNull(trucks.lat),
                isNotNull(trucks.lng),
                eq(trucks.isOpen, true)
            )
        );

    const nearbyTrucks = allTrucks
        .map(truck => ({
            ...truck,
            distance: calculateDistance(lat, lng, truck.lat!, truck.lng!),
        }))
        .filter(truck => truck.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    return nearbyTrucks;
}

/**
 * Get featured trucks for homepage carousel.
 */
export async function getFeaturedTrucks(limit: number = 6) {
    const featured = await db
        .select()
        .from(trucks)
        .where(eq(trucks.isFeatured, true))
        .orderBy(desc(trucks.rating))
        .limit(limit);

    return featured;
}
