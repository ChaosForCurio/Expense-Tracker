'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Expense, CATEGORY_COLORS } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

interface SummaryProps {
  expenses: Expense[];
}

export const Summary: React.FC<SummaryProps> = ({ expenses }) => {
  const { formatCurrency } = useCurrency();

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const totalExpenses = expenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const last30DaysTotal = expenses
    .filter(exp => {
      const d = new Date(exp.date);
      return !isNaN(d.getTime()) && d >= thirtyDaysAgo;
    })
    .reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  const categoryData = expenses.reduce((acc, exp) => {
    const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount;
    const value = isNaN(amount) ? 0 : amount;
    if (value === 0) return acc;

    const existing = acc.find((item) => item.name === exp.category);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: exp.category, value });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const monthlyData = expenses.reduce((acc, exp) => {
    const date = new Date(exp.date);
    if (isNaN(date.getTime())) return acc;

    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const label = `${month} ${year}`;

    const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount;
    const value = isNaN(amount) ? 0 : amount;

    const existing = acc.find((item) => item.name === label);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: label, value, date });
    }
    return acc;
  }, [] as { name: string; value: number; date: Date }[])
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ name, value }) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <h3 className="text-indigo-100 font-medium mb-1">Total Expenses</h3>
        <p className="text-4xl font-bold">{formatCurrency(last30DaysTotal)}</p>
        <div className="flex justify-between items-end mt-2">
          <p className="text-indigo-100 text-sm opacity-80">
            Last 30 days
          </p>
          <p className="text-indigo-100 text-xs opacity-60">
            All time: {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-semibold mb-4">By Category</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-semibold mb-4">Spending Trend</h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                hide
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
