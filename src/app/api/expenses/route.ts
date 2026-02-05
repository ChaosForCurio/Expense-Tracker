import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { stackServerApp } from "@/stack-server";

export async function GET(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const search = searchParams.get('search');
        const category = searchParams.get('category');

        let sql = 'SELECT * FROM expenses WHERE user_id = $1';
        const params: any[] = [user.id];
        let paramIndex = 2; // Start from 2 since user_id is $1

        if (month && year) {
            // Extract month/year from date column
            // Note: Postgres extract(month/year) returns float
            sql += ` AND EXTRACT(MONTH FROM date) = $${paramIndex++}`;
            params.push(parseInt(month));
            sql += ` AND EXTRACT(YEAR FROM date) = $${paramIndex++}`;
            params.push(parseInt(year));
        }

        if (search) {
            sql += ` AND title ILIKE $${paramIndex++}`;
            params.push(`%${search}%`);
        }

        if (category && category !== 'All') {
            sql += ` AND category = $${paramIndex++}`;
            params.push(category);
        }

        sql += ' ORDER BY date DESC';

        const result = await query(sql, params);
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expenses', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, amount, date, category, note, image_url } = body;

        // Validation
        if (!title || !amount || !date || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const sql = `
      INSERT INTO expenses (user_id, title, amount, date, category, note, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

        const result = await query(sql, [user.id, title, amount, date, category, note, image_url]);
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error: any) {
        console.error('Error adding expense:', error);
        // Return detailed error in dev, generic in prod
        return NextResponse.json(
            { error: 'Failed to add expense', details: error.message },
            { status: 500 }
        );
    }
}
