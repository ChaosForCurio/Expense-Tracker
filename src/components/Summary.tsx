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

  const { totalExpenses, monthTotal, prevMonthTotal, categoryData, monthlyData } = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get last month
    let lastMonth = currentMonth - 1;
    let lastMonthYear = currentYear;
    if (lastMonth === 0) {
      lastMonth = 12;
      lastMonthYear = currentYear - 1;
    }

    let total = 0;
    let currentMonthAmount = 0;
    let prevMonthAmount = 0;
    const categories: Record<string, number> = {};
    const months: Record<string, { value: number; date: Date }> = {};

    (expenses || []).forEach(exp => {
      const amount = Number(exp.amount) || 0;
      const date = new Date(exp.date);
      const isInvalidDate = isNaN(date.getTime());

      total += amount;

      if (!isInvalidDate) {
        const m = date.getMonth() + 1;
        const y = date.getFullYear();

        if (m === currentMonth && y === currentYear) {
          currentMonthAmount += amount;
          // Track categories only for current month to match report breakdown
          const category = exp.category || 'Other';
          categories[category] = (categories[category] || 0) + amount;
        } else if (m === lastMonth && y === lastMonthYear) {
          prevMonthAmount += amount;
        }

        const monthLabel = date.toLocaleString('en-US', { month: 'short' });
        const label = `${monthLabel} ${y}`;
        if (!months[label]) {
          months[label] = { value: 0, date };
        }
        months[label].value += amount;
      }
    });

    return {
      totalExpenses: total,
      monthTotal: currentMonthAmount,
      prevMonthTotal: prevMonthAmount,
      categoryData: Object.entries(categories)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value })),
      monthlyData: Object.entries(months)
        .map(([name, { value, date }]) => ({ name, value, date }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-6) // Only show last 6 months to match trend chart
        .map(({ name, value }) => ({ name, value }))
    };
  }, [expenses]);

  const percentSpent = budgetLimit ? (monthTotal / budgetLimit) * 100 : 0;
  const isOverBudget = budgetLimit ? monthTotal > budgetLimit : false;
  const monthlyChange = prevMonthTotal > 0 ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Total Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">Total Spending ({new Date().toLocaleString('default', { month: 'long' })})</h3>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(monthTotal)}</p>
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
              <div className="flex justify-between items-center text-[10px] font-medium">
                <p className={cn(
                  isOverBudget ? "text-red-400" : "text-slate-400"
                )}>
                  {isOverBudget
                    ? `Over budget by ${formatCurrency(monthTotal - budgetLimit)}`
                    : `${formatCurrency(budgetLimit - monthTotal)} remaining`
                  }
                </p>
                {prevMonthTotal > 0 && (
                  <p className={cn(
                    monthlyChange > 0 ? "text-red-400" : "text-green-500",
                    "flex items-center gap-0.5"
                  )}>
                    {monthlyChange > 0 ? '↑' : '↓'}{Math.abs(monthlyChange).toFixed(0)}% vs last month
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Set a budget to track utilization</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50 pt-4">
          <span>Calendar Month</span>
          <span>All time: {formatCurrency(totalExpenses)}</span>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-semibold mb-4 text-sm">By Category</h3>
        <div className="h-[140px] min-h-[140px] w-full">
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
        <div className="h-[140px] min-h-[140px] w-full">
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
