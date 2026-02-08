'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Expense, CATEGORY_COLORS } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface SummaryProps {
  expenses: Expense[];
}

export const Summary: React.FC<SummaryProps> = ({ expenses }) => {
  const { formatCurrency } = useCurrency();
  const [budgetLimit, setBudgetLimit] = useState<number | null>(null);

  useEffect(() => {
    const fetchBudget = async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      try {
        const res = await fetch(`/api/budget?month=${month}&year=${year}`);
        if (res.ok) {
          const data = await res.json();
          if (data.amount) setBudgetLimit(data.amount);
        }
      } catch (error) {
        console.error('Failed to fetch budget in summary', error);
      }
    };
    fetchBudget();
  }, []);

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

  const percentSpent = budgetLimit ? (last30DaysTotal / budgetLimit) * 100 : 0;
  const isOverBudget = budgetLimit ? last30DaysTotal > budgetLimit : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Total Spending</h3>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(last30DaysTotal)}</p>
            </div>
            {budgetLimit && (
              <div className={cn(
                "px-2 py-1 rounded-lg text-xs font-bold",
                isOverBudget ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              )}>
                {percentSpent.toFixed(0)}%
              </div>
            )}
          </div>

          {budgetLimit ? (
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentSpent, 100)}%` }}
                  className={cn(
                    "h-full rounded-full transition-colors",
                    isOverBudget ? "bg-red-500" : "bg-indigo-600"
                  )}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {isOverBudget
                  ? `Over budget by ${formatCurrency(last30DaysTotal - budgetLimit)}`
                  : `${formatCurrency(budgetLimit - last30DaysTotal)} remaining in budget`
                }
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Set a budget to track utilization</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 pt-4">
          <span>Last 30 days</span>
          <span>All time: {formatCurrency(totalExpenses)}</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-semibold mb-4 text-sm">By Category</h3>
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={60}
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 md:col-span-2 lg:col-span-1">
        <h3 className="text-slate-800 font-semibold mb-4 text-sm">Spending Trend</h3>
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <YAxis hide />
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
