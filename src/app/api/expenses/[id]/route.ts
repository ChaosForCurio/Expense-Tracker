import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { stackServerApp } from "@/stack-server";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const sql = 'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await query(sql, [id, user.id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Expense deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        return NextResponse.json(
            { error: 'Failed to delete expense', details: error.message },
            { status: 500 }
        );
    }
}
