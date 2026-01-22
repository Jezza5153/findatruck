import { NextRequest, NextResponse } from 'next/server';
import { db, orders, trucks } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// GET /api/orders - Get orders for the authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userRole = (session.user as any).role;
        const userTruckId = (session.user as any).truckId;

        let result;

        if (userRole === 'owner' && userTruckId) {
            // Owner: Get orders for their truck
            result = await db
                .select()
                .from(orders)
                .where(eq(orders.truckId, userTruckId))
                .orderBy(desc(orders.createdAt));
        } else {
            // Customer: Get their own orders
            result = await db
                .select()
                .from(orders)
                .where(eq(orders.customerId, session.user.id))
                .orderBy(desc(orders.createdAt));
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create a new order (customer only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Verify truck exists
        const [truck] = await db
            .select()
            .from(trucks)
            .where(eq(trucks.id, body.truckId))
            .limit(1);

        if (!truck) {
            return NextResponse.json(
                { success: false, error: 'Truck not found' },
                { status: 404 }
            );
        }

        const [newOrder] = await db
            .insert(orders)
            .values({
                truckId: body.truckId,
                customerId: session.user.id,
                customerName: session.user.name || body.customerName,
                items: body.items,
                totalAmount: body.totalAmount,
                notes: body.notes,
                pickupTime: body.pickupTime ? new Date(body.pickupTime) : null,
                status: 'New',
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: newOrder,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

// PATCH /api/orders - Update order status (owner only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing orderId or status' },
                { status: 400 }
            );
        }

        // Get order and verify ownership
        const [existingOrder] = await db
            .select()
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!existingOrder) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Verify user owns the truck this order belongs to
        const userRole = (session.user as any).role;
        const userTruckId = (session.user as any).truckId;

        if (userRole !== 'owner' || existingOrder.truckId !== userTruckId) {
            return NextResponse.json(
                { success: false, error: 'You can only update orders for your truck' },
                { status: 403 }
            );
        }

        const [updatedOrder] = await db
            .update(orders)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedOrder,
        });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
