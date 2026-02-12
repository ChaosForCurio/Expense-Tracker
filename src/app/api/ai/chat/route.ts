import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from '@/lib/gemini';
import { stackServerApp } from "@/stack-server";

export async function POST(req: NextRequest) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { message, history, context } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        const responseText = await getChatResponse(message, history || [], context);

        return NextResponse.json({ text: responseText });
    } catch (error: any) {
        console.error('API Error in AI Chat:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get AI response' },
            { status: 500 }
        );
    }
}
