import { NextRequest, NextResponse } from 'next/server';
import { db, trucks, menuItems, menuCategories } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/trucks/[id] - Get a single truck with menu
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!truck) {
            return NextResponse.json(
                { success: false, error: 'Truck not found' },
                { status: 404 }
            );
        }

        // Get menu categories and items
        const categories = await db
            .select()
            .from(menuCategories)
            .where(eq(menuCategories.truckId, id))
            .orderBy(menuCategories.order);

        const items = await db
            .select()
            .from(menuItems)
            .where(eq(menuItems.truckId, id))
            .orderBy(menuItems.order);

        return NextResponse.json({
            success: true,
            data: {
                ...truck,
                menuCategories: categories,
                menuItems: items,
            },
        });
    } catch (error) {
        console.error('Error fetching truck:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch truck' },
            { status: 500 }
        );
    }
}

// PUT /api/trucks/[id] - Update a truck (owner only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get existing truck to verify ownership
        const [existingTruck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!existingTruck) {
            return NextResponse.json(
                { success: false, error: 'Truck not found' },
                { status: 404 }
            );
        }

        if (existingTruck.ownerUid !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'You can only edit your own truck' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate input with Zod (passthrough allows flexible fields while validating known ones)
        const { z } = await import('zod');
        const updateSchema = z.object({
            name: z.string().max(100).optional(),
            cuisine: z.string().max(100).optional(),
            description: z.string().max(2000).optional().nullable(),
            address: z.string().max(500).optional().nullable(),
            lat: z.number().min(-90).max(90).optional().nullable(),
            lng: z.number().min(-180).max(180).optional().nullable(),
            imageUrl: z.string().url().max(500).optional().nullable(),
            logoUrl: z.string().url().max(500).optional().nullable(),
            imagePath: z.string().max(500).optional().nullable(),
            imageGallery: z.array(z.string()).optional(),
            phone: z.string().max(20).optional().nullable(),
            ctaPhoneNumber: z.string().max(30).optional().nullable(),
            facebookHandle: z.string().max(100).optional().nullable(),
            instagramHandle: z.string().max(100).optional().nullable(),
            tiktokHandle: z.string().max(100).optional().nullable(),
            websiteUrl: z.string().url().max(500).optional().nullable(),
            contactEmail: z.string().email().max(255).optional().nullable(),
            tags: z.array(z.string().max(50)).max(20).optional(),
            features: z.array(z.string().max(50)).max(20).optional(),
            regularHours: z.record(z.any()).optional(),
            specialHours: z.array(z.any()).optional(),
            isOpen: z.boolean().optional(),
            isVisible: z.boolean().optional(),
            isTruckOpenOverride: z.boolean().optional().nullable(),
            socialMediaLinks: z.record(z.string()).optional(),
            currentLocation: z.object({
                lat: z.number().optional(),
                lng: z.number().optional(),
                address: z.string().optional(),
                updatedAt: z.string().optional(),
                note: z.string().optional(),
            }).optional(),
            todaysMenu: z.any().optional(),
        }).passthrough();

        const validation = updateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: validation.error.errors },
                { status: 400 }
            );
        }

        const validatedData = validation.data;

        const [updatedTruck] = await db
            .update(trucks)
            .set({
                name: validatedData.name,
                cuisine: validatedData.cuisine,
                description: validatedData.description,
                address: validatedData.address,
                lat: validatedData.lat,
                lng: validatedData.lng,
                imageUrl: validatedData.imageUrl,
                imagePath: validatedData.imagePath,
                imageGallery: validatedData.imageGallery,
                phone: validatedData.phone,
                ctaPhoneNumber: validatedData.ctaPhoneNumber,
                facebookHandle: validatedData.facebookHandle,
                instagramHandle: validatedData.instagramHandle,
                tiktokHandle: validatedData.tiktokHandle,
                websiteUrl: validatedData.websiteUrl,
                contactEmail: validatedData.contactEmail,
                tags: validatedData.tags,
                features: validatedData.features,
                regularHours: validatedData.regularHours,
                specialHours: validatedData.specialHours,
                isOpen: validatedData.isOpen,
                isVisible: validatedData.isVisible,
                isTruckOpenOverride: validatedData.isTruckOpenOverride,
                socialMediaLinks: validatedData.socialMediaLinks,
                currentLocation: validatedData.currentLocation,
                todaysMenu: validatedData.todaysMenu,
                updatedAt: new Date(),
            })
            .where(eq(trucks.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedTruck,
        });
    } catch (error) {
        console.error('Error updating truck:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update truck' },
            { status: 500 }
        );
    }
}

// DELETE /api/trucks/[id] - Delete a truck (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get existing truck to verify ownership
        const [existingTruck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!existingTruck) {
            return NextResponse.json(
                { success: false, error: 'Truck not found' },
                { status: 404 }
            );
        }

        if (existingTruck.ownerUid !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'You can only delete your own truck' },
                { status: 403 }
            );
        }

        // Delete truck (cascade will handle menu items, categories, orders)
        await db.delete(trucks).where(eq(trucks.id, id));

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        console.error('Error deleting truck:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete truck' },
            { status: 500 }
        );
    }
}
