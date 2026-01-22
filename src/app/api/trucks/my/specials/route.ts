import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { specials, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { notifyNewSpecial } from '@/lib/notifications';

// Helper to get user's truck ID
async function getUserTruckId(userId: string): Promise<string | null> {
    const [user] = await db
        .select({ truckId: users.truckId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.truckId || null;
}

// GET: List truck's specials
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const truckId = await getUserTruckId(session.user.id);
        if (!truckId) {
            return NextResponse.json({ error: 'No truck associated' }, { status: 404 });
        }

        const truckSpecials = await db
            .select()
            .from(specials)
            .where(eq(specials.truckId, truckId));

        return NextResponse.json({ specials: truckSpecials });
    } catch (error) {
        console.error('Get specials error:', error);
        return NextResponse.json({ error: 'Failed to fetch specials' }, { status: 500 });
    }
}

// POST: Create a new special
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
        }

        const truckId = await getUserTruckId(session.user.id);
        if (!truckId) {
            return NextResponse.json({ error: 'No truck associated', code: 'NOT_FOUND' }, { status: 404 });
        }

        // Parse and validate with strict schema
        const body = await request.json();
        const { createSpecialSchema, validate, validationErrorResponse } = await import('@/lib/validation');
        const validation = validate(createSpecialSchema, body);

        if (!validation.success) {
            return NextResponse.json(validationErrorResponse(validation.errors), { status: 400 });
        }

        const validatedData = validation.data;

        const [newSpecial] = await db
            .insert(specials)
            .values({
                truckId,
                title: validatedData.title,
                description: validatedData.description || null,
                discountPercent: validatedData.discountPercent || null,
                startTime: validatedData.startTime ? new Date(validatedData.startTime) : null,
                endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
                isActive: true,
            })
            .returning();

        // Notify followers about new special
        await notifyNewSpecial(truckId, validatedData.title);

        return NextResponse.json({ success: true, special: newSpecial });
    } catch (error) {
        console.error('Create special error:', error);
        return NextResponse.json({ error: 'Failed to create special' }, { status: 500 });
    }
}
