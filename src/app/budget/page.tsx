'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Save, Loader2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';

export default function BudgetPage() {
    const { currency, formatCurrency } = useCurrency();
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchBudget();
    }, [month, year]);

    const fetchBudget = async () => {
        try {
            const res = await fetch(`/api/budget?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setAmount(data.amount?.toString() || '');
            } else {
                setAmount('');
            }
        } catch (error) {
            console.error('Failed to fetch budget', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/budget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                    month,
                    year
                }),
            });

            if (res.ok) {
                setMessage('Budget saved successfully!');
            } else {
                setMessage('Failed to save budget.');
            }
        } catch (error) {
            setMessage('Error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-200 rounded-full transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold">Set Budget</h1>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Month</label>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                    className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {[2024, 2025, 2026, 2027].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget Limit</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency.symbol}</span>
                                <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. 5000"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-500 mb-1">Current Budget</p>
                            <p className="text-2xl font-bold text-slate-800">
                                {currentBudget ? formatCurrency(currentBudget.amount) : 'Not Set'}
                            </p>
                        </div>

                        {message && (
                            <p className={`text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            {loading ? 'Saving...' : 'Save Budget'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
