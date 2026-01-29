import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');
        const search = searchParams.get('search');
        const category = searchParams.get('category');

        let sql = 'SELECT * FROM expenses WHERE 1=1';
        const params: any[] = [];
        let paramIndex = 1;

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
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, amount, date, category, note } = body;

        const sql = `
      INSERT INTO expenses (title, amount, date, category, note)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

        const result = await query(sql, [title, amount, date, category, note]);
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ error: 'Failed to add expense' }, { status: 500 });
    }
}
