import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Validation schema for credentials
const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

// Only use Drizzle adapter if database is available
const adapter = db ? DrizzleAdapter(db) : undefined;

export const authConfig: NextAuthConfig = {
    adapter,
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        newUser: '/signup',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || 'customer';
                token.truckId = (user as any).truckId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).truckId = token.truckId;
            }
            return session;
        },
        async authorized({ auth, request }) {
            const { nextUrl } = request;
            const isLoggedIn = !!auth?.user;

            // Protected routes
            const isOwnerRoute = nextUrl.pathname.startsWith('/owner');
            const isCustomerRoute = nextUrl.pathname.startsWith('/customer');

            if (isOwnerRoute || isCustomerRoute) {
                if (!isLoggedIn) return false;

                // Check role for owner routes
                if (isOwnerRoute && (auth?.user as any)?.role !== 'owner') {
                    return Response.redirect(new URL('/customer/dashboard', nextUrl));
                }

                // Check role for customer routes
                if (isCustomerRoute && (auth?.user as any)?.role === 'owner') {
                    return Response.redirect(new URL('/owner/dashboard', nextUrl));
                }
            }

            return true;
        },
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Skip auth if database is not configured
                if (!db) {
                    console.error('Database not configured');
                    return null;
                }

                try {
                    const parsed = credentialsSchema.safeParse(credentials);

                    if (!parsed.success) {
                        console.error('Invalid credentials format');
                        return null;
                    }

                    const { email, password } = parsed.data;

                    // Find user by email
                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, email.toLowerCase()))
                        .limit(1);

                    if (!user || !user.passwordHash) {
                        console.error('User not found or no password set');
                        return null;
                    }

                    // Verify password
                    const isValid = await bcrypt.compare(password, user.passwordHash);

                    if (!isValid) {
                        console.error('Invalid password');
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: user.role,
                        truckId: user.truckId,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
};

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth(authConfig);
