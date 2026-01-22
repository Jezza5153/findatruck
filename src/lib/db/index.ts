import { neon } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Check if DATABASE_URL is available
const databaseUrl = process.env.DATABASE_URL;

// Create the database connection only if DATABASE_URL is set
// This allows the build to complete without database credentials
let db: NeonHttpDatabase<typeof schema>;

if (databaseUrl) {
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
} else {
    // During build without DATABASE_URL, use a placeholder
    // API routes will fail at runtime if DATABASE_URL is not set
    console.warn(
        'WARNING: DATABASE_URL is not set. ' +
        'Database operations will fail until configured.'
    );
    // @ts-ignore - Placeholder for build time
    db = null as any;
}

export { db };

// Export schema for convenience
export * from './schema';

// Export type for database client
export type Database = NeonHttpDatabase<typeof schema>;
