'use client';

import { useState, useMemo } from 'react';
import { Filter, Calendar, Search, Trash2, LayoutGrid, List } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useExpenses } from '@/context/ExpenseContext';
import { Category, CATEGORIES } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

export default function HistoryPage() {
    const { formatCurrency } = useCurrency();
    const { expenses, loading, error: contextError, deleteExpense } = useExpenses();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const date = new Date(expense.date);
            const matchesDate = (date.getMonth() + 1) === selectedMonth && date.getFullYear() === selectedYear;
            const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
            return matchesDate && matchesSearch && matchesCategory;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, selectedMonth, selectedYear, searchQuery, selectedCategory]);

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Expense History</h1>
                        <p className="text-sm text-slate-500">Track and manage your past spending</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/50 p-1 border border-slate-200 rounded-xl">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Period</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                >
                                    {[2024, 2025, 2026].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="All">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Total for Period</p>
                            <p className="text-2xl font-bold text-indigo-700">{formatCurrency(totalAmount)}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {contextError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100"
                        >
                            {contextError}
                        </motion.div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 text-sm animate-pulse">Filtering your history...</p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200"
                        >
                            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-slate-400" />
                            </div>
                            <h3 className="text-slate-900 font-semibold mb-1">No expenses found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your filters or search query.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className={cn(
                                "gap-4",
                                viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col"
                            )}
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {filteredExpenses.map((expense) => (
                                    <motion.div
                                        key={expense.id}
                                        variants={itemVariants}
                                        layout
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        className={cn(
                                            "bg-white rounded-xl shadow-sm border border-slate-200 group hover:border-indigo-200 transition-colors overflow-hidden",
                                            viewMode === 'list' ? "p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" : "flex flex-col p-4"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {expense.image_url ? (
                                                <div className="relative group/img overflow-hidden rounded-lg border border-slate-200 flex-shrink-0">
                                                    <img
                                                        src={expense.image_url}
                                                        alt={expense.title}
                                                        className="h-14 w-14 object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                    />
                                                    <div
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                        onClick={() => window.open(expense.image_url, '_blank')}
                                                    >
                                                        <Search size={16} className="text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-14 w-14 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 flex-shrink-0">
                                                    <Calendar size={24} />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="font-semibold text-slate-800 truncate">{expense.title}</h3>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                                        {expense.category}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {format(new Date(expense.date), 'MMMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex items-center justify-between sm:justify-end gap-6",
                                            viewMode === 'grid' && "mt-4 pt-4 border-t border-slate-50"
                                        )}>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">
                                                    {formatCurrency(expense.amount)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
