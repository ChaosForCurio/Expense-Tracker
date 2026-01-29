import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (!month || !year) {
            return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
        }

        const sql = 'SELECT * FROM budgets WHERE month = $1 AND year = $2';
        const result = await query(sql, [parseInt(month), parseInt(year)]);

        if (result.rows.length === 0) {
            return NextResponse.json({ amount: 0 }); // Default budget if not set
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching budget:', error);
        return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, month, year } = body;

        // Upsert logic (Insert or Update on conflict)
        const sql = `
      INSERT INTO budgets (amount, month, year)
      VALUES ($1, $2, $3)
      ON CONFLICT (month, year)
      DO UPDATE SET amount = EXCLUDED.amount
      RETURNING *
    `;

        const result = await query(sql, [amount, month, year]);
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error setting budget:', error);
        return NextResponse.json({ error: 'Failed to set budget' }, { status: 500 });
    }
}
