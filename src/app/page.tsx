'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Category, CATEGORIES } from '@/types';
import { ExpenseList } from '@/components/ExpenseList';
import { Summary } from '@/components/Summary';
import { useExpenses } from '@/context/ExpenseContext';
import { motion } from 'framer-motion';
import { Expense } from '@/types';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';

export default function Home() {
    const { expenses, loading, deleteExpense, editExpense, addExpense } = useExpenses();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            await deleteExpense(deletingId);
            setDeletingId(null);
        } catch (error) {
            // Error handling is done in context with toast
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleEditSubmit = async (id: string, updatedExpense: Partial<Omit<Expense, 'id'>>) => {
        await editExpense(id, updatedExpense);
        setEditingExpense(null);
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
        <div className="text-slate-900 font-sans">
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
                        {loading && expenses.length === 0 ? (
                            <p className="text-center text-slate-500 py-10">Loading expenses...</p>
                        ) : (
                            <ExpenseList
                                expenses={filteredExpenses}
                                onDelete={handleDeleteClick}
                                onEdit={handleEditClick}
                            />
                        )}
                    </motion.div>
                </motion.div>
            </main>

            {/* Edit Modal */}
            {editingExpense && (
                <ExpenseForm
                    initialData={editingExpense}
                    onAdd={addExpense} // Not used when editing but required by types if not optional. Wait, I made it optional? No, onAdd is required in ExpenseFormProps.
                    // Actually onAdd is used for "Add" mode. In "Edit" mode we use onEdit.
                    // I should check ExpenseFormProps again. onAdd is required.
                    // I will pass a dummy or the actual add function.
                    onEdit={handleEditSubmit}
                    onClose={() => setEditingExpense(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!deletingId}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setDeletingId(null)}
                isLoading={isDeleting}
            />

            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} SpendWise Personal Finance Tracker</p>
            </footer>
        </div>
    );
}
