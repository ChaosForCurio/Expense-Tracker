'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Wallet, Save, Loader2, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function BudgetPage() {
    const { currency, formatCurrency } = useCurrency();
    const { expenses } = useExpenses();
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [currentBudget, setCurrentBudget] = useState<{ amount: number } | null>(null);

    useEffect(() => {
        fetchBudget();
    }, [month, year]);

    const fetchBudget = async () => {
        try {
            const res = await fetch(`/api/budget?month=${month}&year=${year}`);
            if (res.ok) {
                const data = await res.json();
                setAmount(data.amount?.toString() || '');
                setCurrentBudget(data.amount ? { amount: data.amount } : null);
            } else {
                setAmount('');
                setCurrentBudget(null);
            }
        } catch (error) {
            console.error('Failed to fetch budget', error);
        }
    };

    const actualSpending = useMemo(() => {
        return expenses
            .filter(exp => {
                const date = new Date(exp.date);
                return (date.getMonth() + 1) === month && date.getFullYear() === year;
            })
            .reduce((sum, exp) => sum + Number(exp.amount), 0);
    }, [expenses, month, year]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

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
                setMessage({ text: 'Budget saved successfully!', type: 'success' });
                setCurrentBudget({ amount: Number(amount) });
            } else {
                const data = await res.json();
                setMessage({ text: data.error || 'Failed to save budget.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Network error preventing save.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const budgetLimit = currentBudget?.amount || 0;
    const percentSpent = budgetLimit > 0 ? (actualSpending / budgetLimit) * 100 : 0;
    const isOverBudget = budgetLimit > 0 && actualSpending > budgetLimit;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Monthly Budget</h1>
                    <p className="text-sm text-slate-500">Set limits and track your spending goals</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-2 space-y-6"
                    >
                        {/* Budget Visualization Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-indigo-500" />
                                    Utilization
                                </h2>
                                <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded-lg",
                                    isOverBudget ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                )}>
                                    {isOverBudget ? 'Over Budget' : percentSpent === 0 ? 'Not Set' : `${percentSpent.toFixed(0)}% Used`}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Spent</p>
                                        <p className="text-xl font-bold text-slate-900">{formatCurrency(actualSpending)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Limit</p>
                                        <p className="text-xl font-bold text-slate-400">{budgetLimit > 0 ? formatCurrency(budgetLimit) : 'No limit'}</p>
                                    </div>
                                </div>

                                <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(percentSpent, 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={cn(
                                            "absolute top-0 left-0 h-full transition-colors duration-500",
                                            isOverBudget ? "bg-gradient-to-r from-red-400 to-red-600" : percentSpent > 80 ? "bg-gradient-to-r from-orange-400 to-orange-500" : "bg-gradient-to-r from-indigo-500 to-violet-600"
                                        )}
                                    />
                                </div>

                                {isOverBudget && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-red-50 p-3 rounded-xl flex items-start gap-3 border border-red-100"
                                    >
                                        <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                                        <p className="text-xs text-red-600 font-medium">
                                            Warning: You have exceeded your budget for this month by {formatCurrency(actualSpending - budgetLimit)}.
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Recent Context or tips could go here */}
                        <div className="bg-indigo-600 p-6 rounded-2xl text-white relative overflow-hidden group">
                            <div className="relative z-10 space-y-2">
                                <h3 className="font-bold text-lg">Smart Spending Tip</h3>
                                <p className="text-white/80 text-sm leading-relaxed max-w-sm">
                                    Users who set a monthly budget typically save 15% more than those who don't. Try setting a limit and stick to it!
                                </p>
                            </div>
                            <Wallet className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12 transition-transform group-hover:scale-110" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Select Period</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                value={month}
                                                onChange={(e) => setMonth(Number(e.target.value))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <option key={i + 1} value={i + 1}>
                                                        {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={year}
                                                onChange={(e) => setYear(Number(e.target.value))}
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            >
                                                {[2024, 2025, 2026].map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Monthly Limit</label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">{currency.symbol}</span>
                                            <input
                                                type="number"
                                                required
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                                                placeholder="e.g. 5000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={cn(
                                                "p-3 rounded-xl flex items-center gap-2 text-sm",
                                                message.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                            )}
                                        >
                                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                            {message.text}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Save size={20} />
                                    )}
                                    {loading ? 'Saving...' : 'Set Budget'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
