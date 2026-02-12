import { NextRequest, NextResponse } from 'next/server';
import { getFinancialInsights } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { month, year, totalAmount, categoryBreakdown, currency } = body;

        if (!month || !year || totalAmount === undefined || !categoryBreakdown) {
            return NextResponse.json(
                { error: 'Missing required report data' },
                { status: 400 }
            );
        }

        const insights = await getFinancialInsights({
            month,
            year,
            totalAmount,
            categoryBreakdown,
            currency: currency || 'INR'
        });

        return NextResponse.json(insights);
    } catch (error: any) {
        console.error('API Error in AI Insights:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate insights' },
            { status: 500 }
        );
    }
}
