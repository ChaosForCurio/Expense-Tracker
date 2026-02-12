import { Expense } from '@/types';

export interface CategorySummary {
    category: string;
    amount: number;
    percentage: number;
}

export interface MonthlyReport {
    month: number;
    year: number;
    totalAmount: number;
    categoryBreakdown: CategorySummary[];
    transactionCount: number;
    transactions: Expense[]; // Added transactions list
}

export function generateMonthlyReport(expenses: Expense[], month: number, year: number): MonthlyReport {
    const monthlyExpenses = expenses.filter(exp => {
        const date = new Date(exp.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
    });

    const totalAmount = monthlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Group by category
    const categoriesMap = new Map<string, number>();
    monthlyExpenses.forEach(exp => {
        const current = categoriesMap.get(exp.category) || 0;
        categoriesMap.set(exp.category, current + Number(exp.amount));
    });

    const categoryBreakdown: CategorySummary[] = Array.from(categoriesMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
        month,
        year,
        totalAmount,
        categoryBreakdown,
        transactionCount: monthlyExpenses.length,
        transactions: monthlyExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
}

export function calculateTrends(currentReport: MonthlyReport, previousReport: MonthlyReport) {
    const change = currentReport.totalAmount - previousReport.totalAmount;
    const percentageChange = previousReport.totalAmount > 0
        ? (change / previousReport.totalAmount) * 100
        : 0;

    return {
        change,
        percentageChange,
        isIncrease: change > 0
    };
}

export function calculateComparison(expenses: Expense[], month: number, year: number) {
    const currentReport = generateMonthlyReport(expenses, month, year);

    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
    }

    const previousReport = generateMonthlyReport(expenses, prevMonth, prevYear);
    const trends = calculateTrends(currentReport, previousReport);

    return {
        current: currentReport,
        previous: previousReport,
        trends
    };
}

export function calculateYearlyTrends(expenses: Expense[], currentMonth: number, currentYear: number) {
    const trends = [];
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m <= 0) {
            m += 12;
            y -= 1;
        }
        const report = generateMonthlyReport(expenses, m, y);
        trends.push({
            month: new Date(y, m - 1).toLocaleString('default', { month: 'short' }),
            monthNum: m,
            year: y,
            amount: report.totalAmount
        });
    }
    return trends;
}
