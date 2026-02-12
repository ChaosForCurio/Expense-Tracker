
import { MonthlyReport } from '@/lib/reporting';
import { FinancialInsight } from '@/lib/gemini';

export const exportMonthlyReportWithAI = (
    report: MonthlyReport,
    insights: FinancialInsight | null,
    monthName: string,
    currencySymbol: string = '₹'
) => {
    const sections = [];

    // Header Section
    sections.push(`Monthly Financial Report - ${monthName} ${report.year}`);
    sections.push(`Total Spending: ${currencySymbol}${report.totalAmount.toLocaleString()}`);
    sections.push(`Transactions: ${report.transactionCount}`);
    sections.push('');

    // AI Insights Section
    if (insights) {
        sections.push('AI FINANCIAL INSIGHTS');
        sections.push(`Summary:,"${insights.summary.replace(/"/g, '""')}"`);

        sections.push('Anomalies Identified:');
        insights.anomalies.forEach(anomaly => {
            sections.push(`-,"${anomaly.replace(/"/g, '""')}"`);
        });

        sections.push('Actionable Tips:');
        insights.tips.forEach(tip => {
            sections.push(`-,"${tip.replace(/"/g, '""')}"`);
        });
        sections.push('');
    }

    // Category Breakdown Section
    sections.push('CATEGORY BREAKDOWN');
    sections.push('Category,Amount,Share (%)');
    report.categoryBreakdown.forEach(item => {
        sections.push(`${item.category},${item.amount},${item.percentage.toFixed(1)}%`);
    });

    sections.push('');
    sections.push('DETAILED TRANSACTIONS');
    sections.push('Date,Title,Category,Amount,Note');
    report.transactions.forEach(exp => {
        const dateStr = new Date(exp.date).toLocaleDateString();
        const noteStr = exp.note ? `"${exp.note.replace(/"/g, '""')}"` : '';
        sections.push(`${dateStr},"${exp.title.replace(/"/g, '""')}",${exp.category},${exp.amount},${noteStr}`);
    });

    const csvContent = sections.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const filename = `SpendWise_Report_${monthName}_${report.year}.csv`;
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
