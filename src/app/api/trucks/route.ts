import { NextRequest, NextResponse } from 'next/server';
import { db, trucks, users } from '@/lib/db';
import { eq, and, or, ilike, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/trucks - Get all trucks (with optional filters)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const cuisine = searchParams.get('cuisine');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured');
        const openNow = searchParams.get('openNow');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const radius = searchParams.get('radius'); // in km

        // Pagination with hard caps (anti-scraping + performance)
        const MAX_LIMIT = 50;
        const requestedLimit = parseInt(searchParams.get('limit') || '20', 10);
        const limit = Math.min(Math.max(1, requestedLimit), MAX_LIMIT);
        const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));

        let query = db
            .select()
            .from(trucks)
            .where(eq(trucks.isVisible, true));

        // Apply filters
        const conditions = [eq(trucks.isVisible, true)];

        if (cuisine) {
            conditions.push(eq(trucks.cuisine, cuisine));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(trucks.name, `%${search}%`),
                    ilike(trucks.cuisine, `%${search}%`),
                    ilike(trucks.description, `%${search}%`)
                )!
            );
        }

        if (featured === 'true') {
            conditions.push(eq(trucks.isFeatured, true));
        }

        if (openNow === 'true') {
            conditions.push(eq(trucks.isOpen, true));
        }

        const result = await db
            .select()
            .from(trucks)
            .where(and(...conditions));

        // Always merge currentLocation into lat/lng for map display
        let trucksWithLocation = result.map(truck => {
            const currentLoc = truck.currentLocation as { lat?: number; lng?: number; updatedAt?: string } | null;
            const locationUpdatedAt = currentLoc?.updatedAt || truck.updatedAt?.toISOString();

            // Prefer currentLocation coords if available, fall back to base lat/lng
            const truckLat = currentLoc?.lat ?? truck.lat;
            const truckLng = currentLoc?.lng ?? truck.lng;

            return { ...truck, lat: truckLat, lng: truckLng, locationUpdatedAt };
        });

        // Calculate distance if user coordinates provided
        let trucksWithDistance = trucksWithLocation;
        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxRadius = radius ? parseFloat(radius) : 50; // Default 50km

            trucksWithDistance = trucksWithLocation
                .map(truck => {
                    if (truck.lat && truck.lng) {
                        const distance = calculateDistance(userLat, userLng, truck.lat, truck.lng);
                        return { ...truck, distance: distance.toFixed(1) + ' km' };
                    }
                    return { ...truck, distance: undefined };
                })
                .filter(truck => {
                    if (!truck.distance) return true;
                    const distNum = parseFloat(truck.distance);
                    return distNum <= maxRadius;
                })
                .sort((a, b) => {
                    if (!a.distance) return 1;
                    if (!b.distance) return -1;
                    return parseFloat(a.distance) - parseFloat(b.distance);
                });
        }

        // Apply pagination after filtering/sorting
        const paginatedResults = trucksWithDistance.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            data: paginatedResults,
            pagination: {
                limit,
                offset,
                total: trucksWithDistance.length,
                hasMore: offset + limit < trucksWithDistance.length,
            },
        }, {
            headers: {
                // Cache for 30s, serve stale while revalidating for fast UX
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
            }
        });
    } catch (error) {
        console.error('Error fetching trucks:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch trucks' },
            { status: 500 }
        );
    }
}

// POST /api/trucks - Create a new truck (owner only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        if ((session.user as any).role !== 'owner') {
            return NextResponse.json(
                { success: false, error: 'Only owners can create trucks', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }

        // Parse and validate with strict schema (rejects extra keys!)
        const body = await request.json();
        const { createTruckSchema, validate, validationErrorResponse } = await import('@/lib/validation');
        const validation = validate(createTruckSchema, body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, ...validationErrorResponse(validation.errors) },
                { status: 400 }
            );
        }

        // Use only validated fields (no mass assignment)
        const validatedData = validation.data;

        const [newTruck] = await db
            .insert(trucks)
            .values({
                ownerUid: session.user.id,
                name: validatedData.name,
                cuisine: validatedData.cuisine,
                description: validatedData.description,
                address: validatedData.address,
                lat: validatedData.lat,
                lng: validatedData.lng,
                imageUrl: validatedData.imageUrl,
                phone: validatedData.phone,
                websiteUrl: validatedData.websiteUrl,
                contactEmail: validatedData.contactEmail,
                tags: validatedData.tags || [],
                features: validatedData.features || [],
            })
            .returning();

        // Update user with truck ID
        await db
            .update(users)
            .set({ truckId: newTruck.id })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            data: newTruck,
        });
    } catch (error) {
        console.error('Error creating truck:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create truck' },
            { status: 500 }
        );
    }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
