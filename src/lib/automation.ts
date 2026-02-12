import { query } from './db';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
    id: string;
    user_id: string;
    title: string;
    amount: number;
    category: string;
    frequency: Frequency;
    start_date: string;
    next_date: string;
    note?: string;
}

export async function processRecurringExpenses(userId: string) {
    try {
        // 1. Check if we already ran automation today for this user
        const today = new Date().toISOString().split('T')[0];
        const settingsResult = await query(
            'SELECT last_automation_run FROM user_settings WHERE user_id = $1',
            [userId]
        );

        if (settingsResult.rows.length > 0) {
            const lastRun = settingsResult.rows[0].last_automation_run;
            if (lastRun && new Date(lastRun).toISOString().split('T')[0] === today) {
                return { processed: 0, message: 'Already ran today' };
            }
        }

        // 2. Fetch due recurring expenses
        const recurringResult = await query(
            'SELECT * FROM recurring_expenses WHERE user_id = $1 AND next_date <= $2',
            [userId, today]
        );

        const dueExpenses: RecurringExpense[] = recurringResult.rows;
        let count = 0;

        for (const item of dueExpenses) {
            // Insert into expenses table
            await query(
                `INSERT INTO expenses (user_id, title, amount, date, category, note)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, item.title, item.amount, item.next_date, item.category, item.note || `Recurring ${item.frequency} bill`]
            );

            // Update next_date
            const nextDate = calculateNextDate(new Date(item.next_date), item.frequency);
            await query(
                'UPDATE recurring_expenses SET next_date = $1 WHERE id = $2',
                [nextDate.toISOString().split('T')[0], item.id]
            );

            count++;
        }

        // 3. Update user settings
        await query(
            `INSERT INTO user_settings (user_id, last_automation_run)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE SET last_automation_run = $2`,
            [userId, today]
        );

        return { processed: count, message: `Successfully processed ${count} recurring expenses` };
    } catch (error) {
        console.error('Error processing recurring expenses:', error);
        throw error;
    }
}

function calculateNextDate(currentDate: Date, frequency: Frequency): Date {
    const next = new Date(currentDate);
    switch (frequency) {
        case 'daily':
            next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            next.setDate(next.getDate() + 7);
            break;
        case 'monthly':
            next.setMonth(next.getMonth() + 1);
            break;
        case 'yearly':
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}
