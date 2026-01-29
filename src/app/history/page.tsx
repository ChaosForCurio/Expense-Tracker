'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types';
import { ArrowLeft, Filter, Calendar, Search } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

export default function HistoryPage() {
    const { formatCurrency } = useCurrency();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, [selectedMonth, selectedYear]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/expenses?month=${selectedMonth}&year=${selectedYear}`);
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Expense History</h1>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="p-2 border rounded-lg bg-slate-50"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="p-2 border rounded-lg bg-slate-50"
                        >
                            {[2024, 2025, 2026, 2027].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Total Spent</p>
                        <p className="text-2xl font-bold text-indigo-600">${totalAmount.toFixed(2)}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-center text-slate-500">Loading...</p>
                    ) : expenses.length === 0 ? (
                        <p className="text-center text-slate-500 py-10">No expenses found for this period.</p>
                    ) : (
                        expenses.map((expense) => (
                            <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{expense.title}</h3>
                                    <p className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()} • {expense.category}</p>
                                </div>
                                <span className="font-bold text-slate-700">
                                    {formatCurrency(expense.amount)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
