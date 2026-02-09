import { Expense } from '@/types';

const getFilename = (extension: string) => {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    return `SpentWise_Export_${date}_${time}.${extension}`;
};

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
            `"${(exp.note || '').replace(/"/g, '""')}"`
        ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', getFilename('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportExpensesToJSON = (expenses: Expense[]) => {
    if (expenses.length === 0) return;

    const jsonContent = JSON.stringify(expenses, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', getFilename('json'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
