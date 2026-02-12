import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export interface FinancialInsight {
    summary: string;
    anomalies: string[];
    tips: string[];
}

export async function getFinancialInsights(data: {
    month: string;
    year: number;
    totalAmount: number;
    categoryBreakdown: any[];
    currency: string;
}): Promise<FinancialInsight> {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    As a professional financial advisor, analyze the following expense data for the month of ${data.month} ${data.year}.
    Total Spending: ${data.totalAmount} ${data.currency}
    
    Category Breakdown:
    ${data.categoryBreakdown.map(c => `- ${c.category}: ${c.amount} ${data.currency} (${c.percentage.toFixed(1)}%)`).join('\n')}

    Provide your response in JSON format with the following structure:
    {
      "summary": "A concise executive summary of the month's spending behavior, highlighting key trends and general financial health.",
      "anomalies": ["Identify specific unusual spending patterns, potential overspending in certain categories, or unexpected shifts."],
      "tips": ["Actionable, realistic advice to save money, optimize spending in specific categories, or improve financial habits for next month."]
    }

    Keep the summary professional, analytical, yet encouraging. Ensure the anomalies and tips are deeply specific to the data provided, avoiding generic financial advice.
    Only return the JSON object, no markdown formatting.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Raw Gemini Response:", text); // Debugging

        // Attempt to parse text if it's wrapped in markers or not perfectly clean
        const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();

        try {
            return JSON.parse(cleanText) as FinancialInsight;
        } catch (parseError) {
            console.error("JSON Parsing Error:", parseError, "Cleaned Text:", cleanText);
            throw new Error("Failed to parse AI insights. Please try again.");
        }
    } catch (error) {
        console.error("Error generating insights with Gemini:", error);
        throw new Error("Failed to generate financial insights.");
    }
}

export async function getChatResponse(
    message: string,
    history: { role: 'user' | 'model'; parts: string }[],
    context?: {
        expenses: any[];
        currency: string;
    }
): Promise<string> {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }]
        })),
        generationConfig: {
            maxOutputTokens: 500,
        },
    });

    let systemContext = `You are SpendWise AI, a helpful and professional personal finance assistant. 
    Your goal is to help the user manage their expenses, provide financial tips, and answer questions about their spending habits.
    Keep your responses concise, friendly, and actionable.`;

    if (context) {
        systemContext += `\n\nUser's Current context:
        - Currency: ${context.currency}
        - Total Transactions: ${context.expenses.length}
        - Recent Expenses: ${JSON.stringify(context.expenses.slice(0, 5))}
        
        Use this data ONLY if the user asks questions relative to their spending.`;
    }

    const fullPrompt = `${systemContext}\n\nUser: ${message}`;

    try {
        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in AI Chat:", error);
        throw new Error("Failed to get AI response.");
    }
}
