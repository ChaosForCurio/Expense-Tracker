'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense } from '@/types';

interface ExpenseContextType {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    refreshExpenses: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch ALL expenses (no filters) to populate the global state
            const res = await fetch('/api/expenses');
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            } else if (res.status === 401) {
                setExpenses([]);
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
        fetchExpenses();
    }, []);

    const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense),
            });

            if (res.ok) {
                const savedExpense = await res.json();
                setExpenses((prev) => [savedExpense, ...prev]);
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

    const deleteExpense = async (id: string) => {
        // Optimistic update
        const previousExpenses = [...expenses];
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));

        try {
            // In a real app, you would make a DELETE request here
            // const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
            // if (!res.ok) throw new Error('Failed to delete');
        } catch (error) {
            // Rollback on error
            console.error("Failed to delete expense", error);
            setExpenses(previousExpenses);
            throw error;
        }
    };

    return (
        <ExpenseContext.Provider value={{ expenses, loading, error, addExpense, deleteExpense, refreshExpenses: fetchExpenses }}>
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
