import { Pool } from 'pg';

if (!process.env.supabase_url) {
    console.error('Missing supabase_url in environment variables');
}

const pool = new Pool({
    connectionString: process.env.supabase_url,
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
