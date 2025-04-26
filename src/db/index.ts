import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection string would typically come from environment variables
const connectionString = process.env.DATABASE_URL || '';

// Create the connection
const client = postgres(connectionString, { max: 1 });

// Create the drizzle database instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export * from './schema'; 