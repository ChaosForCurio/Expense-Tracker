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

  const { totalExpenses, last30DaysTotal, categoryData, monthlyData } = React.useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let total = 0;
    let last30 = 0;
    const categories: Record<string, number> = {};
    const months: Record<string, { value: number; date: Date }> = {};

    (expenses || []).forEach(exp => {
      const amount = Number(exp.amount) || 0;
      const date = new Date(exp.date);
      const isInvalidDate = isNaN(date.getTime());

      total += amount;
      if (!isInvalidDate && date >= thirtyDaysAgo) {
        last30 += amount;
      }

      const category = exp.category || 'Other';
      categories[category] = (categories[category] || 0) + amount;

      if (!isInvalidDate) {
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        const label = `${month} ${year}`;
        if (!months[label]) {
          months[label] = { value: 0, date };
        }
        months[label].value += amount;
      }
    });

    return {
      totalExpenses: total,
      last30DaysTotal: last30,
      categoryData: Object.entries(categories)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value })),
      monthlyData: Object.entries(months)
        .map(([name, { value, date }]) => ({ name, value, date }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(({ name, value }) => ({ name, value }))
    };
  }, [expenses]);

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
                formatter={(value: any) => formatCurrency(Number(value) || 0)}
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
                formatter={(value: any) => formatCurrency(Number(value) || 0)}
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
