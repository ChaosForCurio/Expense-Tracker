import { Pool, neonConfig } from '@neondatabase/serverless';

// Force Pool to use the HTTP proxy (port 443) instead of direct TCP (port 5432).
// This is critical for environments where port 5432 is blocked.
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in environment variables');
}

const connectionString = process.env.DATABASE_URL?.trim();

// Use a singleton pool pattern
let pool: Pool;

const getPool = () => {
    if (!pool) {
        pool = new Pool({ connectionString });
    }
    return pool;
};

export const query = async (text: string, params?: any[]) => {
    try {
        const result = await getPool().query(text, params || []);
        return {
            rows: result.rows,
            rowCount: result.rowCount
        };
    } catch (error: any) {
        console.error('Database Query Error:', error);
        throw error;
    }
};
