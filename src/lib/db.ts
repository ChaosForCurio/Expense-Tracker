import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in environment variables');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const query = async (text: string, params?: any[]) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error('Database Query Error:', error);
        throw error;
    }
};
