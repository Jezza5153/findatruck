import { NextRequest, NextResponse } from 'next/server';
import { db, users, trucks } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['customer', 'owner']),
    // Owner-specific fields
    truckName: z.string().optional(),
    cuisineType: z.string().optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.errors.map(e => e.message).join(', ') },
                { status: 400 }
            );
        }

        const { email, password, name, role, truckName, cuisineType, description, phone } = parsed.data;

        // Check if user already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                email: email.toLowerCase(),
                name,
                passwordHash,
                role,
            })
            .returning();

        // If owner, create their truck
        if (role === 'owner' && truckName) {
            const [newTruck] = await db
                .insert(trucks)
                .values({
                    ownerUid: newUser.id,
                    name: truckName,
                    cuisine: cuisineType || 'Other',
                    description: description || null,
                    phone: phone || null,
                })
                .returning();

            // Update user with truck ID
            await db
                .update(users)
                .set({ truckId: newTruck.id })
                .where(eq(users.id, newUser.id));
        }

        return NextResponse.json({
            success: true,
            data: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to register. Please try again.' },
            { status: 500 }
        );
    }
}
