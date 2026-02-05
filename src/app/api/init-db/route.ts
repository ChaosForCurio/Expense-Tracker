import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Create expenses table
    await query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT, -- Made nullable initially for migration, or add default
        title TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        category TEXT NOT NULL,
        note TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add user_id column if it doesn't exist (manual migration for existing table)
    await query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id TEXT;`);
    await query(`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS image_url TEXT;`);

    // Create budgets table
    await query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        UNIQUE(user_id, month, year)
      );
    `);

    // Add user_id column to budgets if missing
    await query(`ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_id TEXT;`);

    // Drop old constraint if exists and add new one (complex in raw SQL without knowing constraint name, skipping complex constraint migration for now or assuming fresh start/handling error)
    try {
      await query(`ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_month_year_key;`);
      await query(`ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_month_year_key UNIQUE (user_id, month, year);`);
    } catch (e) {
      console.log('Constraint update might have failed or already exists', e);
    }

    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
