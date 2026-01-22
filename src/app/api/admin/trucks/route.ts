import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { trucks, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// Admin check helper
async function isAdmin(userId: string): Promise<boolean> {
    const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return user?.role === 'admin';
}

// GET: List all trucks for admin
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!(await isAdmin(session.user.id))) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const allTrucks = await db
            .select({
                id: trucks.id,
                name: trucks.name,
                cuisine: trucks.cuisine,
                isVerified: trucks.isVerified,
                isOpen: trucks.isOpen,
                isFeatured: trucks.isFeatured,
                createdAt: trucks.createdAt,
            })
            .from(trucks)
            .orderBy(desc(trucks.createdAt));

        return NextResponse.json({ trucks: allTrucks });
    } catch (error) {
        console.error('Admin trucks error:', error);
        return NextResponse.json({ error: 'Failed to fetch trucks' }, { status: 500 });
    }
}
