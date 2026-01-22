'use server';

import { db, users, trucks } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signIn } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['customer', 'owner']),
    // Owner-specific fields
    truckName: z.string().optional(),
    cuisineType: z.string().optional(),
});

export type RegisterData = z.infer<typeof registerSchema>;

export async function registerUser(data: RegisterData) {
    try {
        // Validate input
        const validated = registerSchema.parse(data);

        // Check if user already exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, validated.email.toLowerCase()))
            .limit(1);

        if (existingUser) {
            return { success: false, error: 'Email already registered' };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(validated.password, 12);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                email: validated.email.toLowerCase(),
                name: validated.name,
                passwordHash,
                role: validated.role,
            })
            .returning();

        // If owner, create their truck
        if (validated.role === 'owner' && validated.truckName) {
            const [newTruck] = await db
                .insert(trucks)
                .values({
                    ownerUid: newUser.id,
                    name: validated.truckName,
                    cuisine: validated.cuisineType || 'Other',
                })
                .returning();

            // Update user with truck ID
            await db
                .update(users)
                .set({ truckId: newTruck.id })
                .where(eq(users.id, newUser.id));
        }

        return {
            success: true,
            data: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        };
    } catch (error) {
        console.error('Registration error:', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => e.message).join(', '),
            };
        }

        return {
            success: false,
            error: 'Failed to register. Please try again.',
        };
    }
}

export async function loginUser(email: string, password: string) {
    try {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            return { success: false, error: 'Invalid email or password' };
        }

        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Failed to login. Please try again.' };
    }
}

export async function getUserProfile(userId: string) {
    try {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                image: users.image,
                role: users.role,
                truckId: users.truckId,
                favoriteTrucks: users.favoriteTrucks,
                notificationPreferences: users.notificationPreferences,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, data: user };
    } catch (error) {
        console.error('Get profile error:', error);
        return { success: false, error: 'Failed to get profile' };
    }
}

export async function updateUserProfile(
    userId: string,
    data: {
        name?: string;
        image?: string;
        notificationPreferences?: {
            truckNearbyRadius: number;
            orderUpdates: boolean;
            promotionalMessages: boolean;
        };
    }
) {
    try {
        const [updatedUser] = await db
            .update(users)
            .set({
                name: data.name,
                image: data.image,
                notificationPreferences: data.notificationPreferences,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        return { success: true, data: updatedUser };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: 'Failed to update profile' };
    }
}

export async function toggleFavoriteTruck(userId: string, truckId: string) {
    try {
        const [user] = await db
            .select({ favoriteTrucks: users.favoriteTrucks })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const favorites = user.favoriteTrucks || [];
        const isFavorite = favorites.includes(truckId);

        const newFavorites = isFavorite
            ? favorites.filter(id => id !== truckId)
            : [...favorites, truckId];

        await db
            .update(users)
            .set({ favoriteTrucks: newFavorites })
            .where(eq(users.id, userId));

        return {
            success: true,
            data: {
                isFavorite: !isFavorite,
                favorites: newFavorites,
            },
        };
    } catch (error) {
        console.error('Toggle favorite error:', error);
        return { success: false, error: 'Failed to update favorites' };
    }
}
