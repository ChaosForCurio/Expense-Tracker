import { Expense } from '@/types';

export const exportExpensesToCSV = (expenses: Expense[]) => {
    if (expenses.length === 0) return;

    const headers = ['Date', 'Title', 'Amount', 'Category', 'Description'];
    const csvRows = [
        headers.join(','),
        ...expenses.map(exp => [
            new Date(exp.date).toLocaleDateString(),
            `"${exp.title.replace(/"/g, '""')}"`,
            exp.amount,
            exp.category,
            `"${(exp.description || '').replace(/"/g, '""')}"`
        ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `spentwise_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
