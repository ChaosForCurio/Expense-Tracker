'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense } from '@/types';
import { toast } from 'sonner';

interface ExpenseContextType {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    isDemoMode: boolean;
    setDemoMode: (active: boolean) => void;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    editExpense: (id: string, expense: Partial<Omit<Expense, 'id'>>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    clearExpenses: () => Promise<void>;
    refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const fetchExpenses = async () => {
        // Use mock data if in demo mode
        if (isDemoMode) {
            const { MOCK_EXPENSES } = await import('@/lib/mockData');
            setExpenses(MOCK_EXPENSES);
            setLoading(false);
            setError(null);
            return;
        }

        // Only show loading if we have no data yet
        if (expenses.length === 0) {
            setLoading(true);
        }
        setError(null);
        try {
            const res = await fetch('/api/expenses');
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
                // Cache to local storage
                localStorage.setItem('spendwise_expenses', JSON.stringify(data));
            } else if (res.status === 401) {
                setExpenses([]);
                localStorage.removeItem('spendwise_expenses');
            } else {
                const text = await res.text();
                throw new Error(text || 'Failed to fetch expenses');
            }
        } catch (err: any) {
            console.error('Error fetching expenses:', err);
            setError(err.message || 'Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Hydrate from localStorage immediately
        const cachedExpenses = localStorage.getItem('spendwise_expenses');
        if (cachedExpenses && !isDemoMode) {
            try {
                const parsed = JSON.parse(cachedExpenses);
                setExpenses(parsed);
                setLoading(false);
            } catch (e) {
                console.error('Failed to parse cached expenses', e);
            }
        }
        fetchExpenses();
    }, [isDemoMode]);

    const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense),
            });

            if (res.ok) {
                const savedExpense = await res.json();
                setExpenses((prev) => {
                    const updated = [savedExpense, ...prev];
                    localStorage.setItem('spendwise_expenses', JSON.stringify(updated));
                    return updated;
                });
                toast.success('Expense added successfully');
            } else {
                const text = await res.text();
                let errorData;
                try {
                    errorData = JSON.parse(text);
                } catch {
                    errorData = { error: text || 'Unknown error' };
                }
                const errorMessage = errorData.details || errorData.error || 'Failed to add expense';
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    };

    const editExpense = async (id: string, updatedExpense: Partial<Omit<Expense, 'id'>>) => {
        const previousExpenses = [...expenses];
        setExpenses((prev) => {
            const updated = prev.map((exp) => (exp.id === id ? { ...exp, ...updatedExpense } : exp));
            localStorage.setItem('spendwise_expenses', JSON.stringify(updated));
            return updated;
        });

        try {
            // In a real app, you would make a PUT/PATCH request here
            // For now, we'll simulate a successful update if we had an endpoint
            // const res = await fetch(`/api/expenses/${id}`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(updatedExpense),
            // });

            // Since we might not have a PATCH endpoint ready, let's assume valid for now or use PUT if available.
            // If we strictly follow the plan, we should implement the API call.
            // However, based on the prompt "implement more features", I should probably add the API route or handle it.
            // But wait, the user said "uncomment delete API".
            // Let's assume the backend supports it or I need to create it.
            // Given I can't see backend code for `api/expenses/[id]`, I will assume standard REST pattern or
            // simply simulate it for now if I can't verifying backend yet.
            // Actually, the previous delete code was commented out, implying the backend MIGHT exist.
            // Let's try to fetch.

            const res = await fetch(`/api/expenses?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedExpense),
            });

            if (!res.ok) {
                throw new Error('Failed to update expense');
            }
            toast.success('Expense updated successfully');
        } catch (error) {
            console.error("Failed to update expense", error);
            setExpenses(previousExpenses);
            toast.error('Failed to update expense');
            throw error;
        }
    };

    const deleteExpense = async (id: string) => {
        // Optimistic update
        const previousExpenses = [...expenses];
        setExpenses((prev) => {
            const updated = prev.filter((exp) => exp.id !== id);
            localStorage.setItem('spendwise_expenses', JSON.stringify(updated));
            return updated;
        });

        try {
            // Check if backend supports DELETE
            const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Expense deleted successfully');
        } catch (error) {
            // Rollback on error
            console.error("Failed to delete expense", error);
            setExpenses(previousExpenses);
            toast.error('Failed to delete expense');
            throw error;
        }
    };

    const clearExpenses = async () => {
        try {
            const res = await fetch('/api/expenses', { method: 'DELETE' });
            if (res.ok) {
                setExpenses([]);
                localStorage.removeItem('spendwise_expenses');
            } else {
                const text = await res.text();
                throw new Error(text || 'Failed to clear expenses');
            }
        } catch (error) {
            console.error('Error clearing expenses:', error);
            throw error;
        }
    };

    return (
        <ExpenseContext.Provider value={{
            expenses,
            loading,
            error,
            isDemoMode,
            setDemoMode: setIsDemoMode,
            addExpense,
            editExpense,
            deleteExpense,
            clearExpenses,
            refreshExpenses: fetchExpenses
        }}>
            {children}
        </ExpenseContext.Provider>
    );
}

export function useExpenses() {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
}
