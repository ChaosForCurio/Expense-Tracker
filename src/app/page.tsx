'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Wallet, History, PieChart, Settings } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Expense, Category, CATEGORIES } from '@/types';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { Summary } from '@/components/Summary';
import { UserMenu } from '@/components/UserMenu';
import Link from 'next/link';
import { useExpenses } from '@/context/ExpenseContext';
import { motion } from 'framer-motion';

export default function Home() {
    const { expenses, loading, addExpense, deleteExpense } = useExpenses();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

    const handleAddExpense = async (newExpense: Omit<Expense, 'id'>) => {
        try {
            await addExpense(newExpense);
        } catch (error) {
            alert('Failed to add expense. Please try again.');
        }
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id);
        } catch (error) {
            alert('Failed to delete expense.');
        }
    };

    const filteredExpenses = useMemo(() => {
        return expenses
            .filter((exp) => {
                const matchesSearch = exp.title.toLowerCase().includes(search.toLowerCase());
                const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, search, selectedCategory]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white border-b border-slate-200 sticky top-0 z-30"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Wallet className="text-white" size={20} />
                        </div>
                        <h1 className="text-xl font-bold premium-gradient">
                            SpendWise
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/history" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition">
                            <History size={18} />
                            <span className="hidden sm:inline">History</span>
                        </Link>
                        <Link href="/budget" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition">
                            <PieChart size={18} />
                            <span className="hidden sm:inline">Budget</span>
                        </Link>
                        <Link href="/settings" className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition">
                            <Settings size={18} />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>
                        <UserMenu />
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <ExpenseForm onAdd={handleAddExpense} />
                    </div>

                </div>
            </motion.header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Quick Stats Grid */}
                    <motion.div variants={itemVariants}>
                        <Summary expenses={expenses} />
                    </motion.div>

                    {/* Filters & Search */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                                    className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm appearance-none"
                                >
                                    <option value="All">All Categories</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Expenses List */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
                            <span className="text-sm text-slate-500">{filteredExpenses.length} found</span>
                        </div>
                        {loading ? (
                            <p className="text-center text-slate-500 py-10">Loading expenses...</p>
                        ) : (
                            <ExpenseList expenses={filteredExpenses} onDelete={handleDeleteExpense} />
                        )}
                    </motion.div>
                </motion.div>
            </main>

            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} SpendWise Personal Finance Tracker</p>
            </footer>
        </div>
    );
}
