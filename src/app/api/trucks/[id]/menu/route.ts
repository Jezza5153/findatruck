import { NextRequest, NextResponse } from 'next/server';
import { db, menuItems, menuCategories, trucks } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/trucks/[id]/menu - Get menu for a truck
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

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
                categories,
                items,
            },
        });
    } catch (error) {
        console.error('Error fetching menu:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch menu' },
            { status: 500 }
        );
    }
}

// POST /api/trucks/[id]/menu - Add menu item (owner only)
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify ownership
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!truck || truck.ownerUid !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Handle category creation
        if (body.type === 'category') {
            const [newCategory] = await db
                .insert(menuCategories)
                .values({
                    truckId: id,
                    name: body.name,
                    order: body.order || 0,
                })
                .returning();

            return NextResponse.json({
                success: true,
                data: newCategory,
            });
        }

        // Handle menu item creation
        const [newItem] = await db
            .insert(menuItems)
            .values({
                truckId: id,
                categoryId: body.categoryId,
                name: body.name,
                description: body.description,
                price: body.price,
                category: body.category,
                imageUrl: body.imageUrl,
                imagePath: body.imagePath,
                isSpecial: body.isSpecial || false,
                availability: body.availability || 'available',
                tags: body.tags || [],
                order: body.order || 0,
                customizations: body.customizations,
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: newItem,
        });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create menu item' },
            { status: 500 }
        );
    }
}

// PUT /api/trucks/[id]/menu - Update menu item (owner only)
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

        // Verify ownership
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!truck || truck.ownerUid !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Handle category update
        if (body.type === 'category') {
            const [updatedCategory] = await db
                .update(menuCategories)
                .set({
                    name: body.name,
                    order: body.order,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(menuCategories.id, body.id),
                    eq(menuCategories.truckId, id)
                ))
                .returning();

            return NextResponse.json({
                success: true,
                data: updatedCategory,
            });
        }

        // Handle menu item update
        const [updatedItem] = await db
            .update(menuItems)
            .set({
                categoryId: body.categoryId,
                name: body.name,
                description: body.description,
                price: body.price,
                category: body.category,
                imageUrl: body.imageUrl,
                imagePath: body.imagePath,
                isSpecial: body.isSpecial,
                availability: body.availability,
                outOfStock: body.outOfStock,
                tags: body.tags,
                order: body.order,
                customizations: body.customizations,
                updatedAt: new Date(),
            })
            .where(and(
                eq(menuItems.id, body.id),
                eq(menuItems.truckId, id)
            ))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedItem,
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update menu item' },
            { status: 500 }
        );
    }
}

// DELETE /api/trucks/[id]/menu - Delete menu item or category (owner only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');
        const categoryId = searchParams.get('categoryId');

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify ownership
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, id))
            .limit(1);

        if (!truck || truck.ownerUid !== session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        if (categoryId) {
            await db.delete(menuCategories).where(and(
                eq(menuCategories.id, categoryId),
                eq(menuCategories.truckId, id)
            ));
        } else if (itemId) {
            await db.delete(menuItems).where(and(
                eq(menuItems.id, itemId),
                eq(menuItems.truckId, id)
            ));
        } else {
            return NextResponse.json(
                { success: false, error: 'Missing itemId or categoryId' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { deleted: true },
        });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete menu item' },
            { status: 500 }
        );
    }
}
