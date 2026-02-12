'use client';

import React, { useState, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { generateMonthlyReport, calculateComparison, calculateYearlyTrends } from '@/lib/reporting';
import { exportMonthlyReportWithAI } from '@/utils/reportExport';
import { useCurrency } from '@/context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Download,
    PieChart as PieChartIcon,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Sparkles,
    BrainCircuit,
    Lightbulb,
    Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';
import { CATEGORY_COLORS } from '@/types';

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function ReportsPage() {
    const { expenses, loading, error, isDemoMode, setDemoMode } = useExpenses();
    const { currency, formatCurrency } = useCurrency();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [aiInsights, setAiInsights] = useState<{ summary: string; anomalies: string[]; tips: string[] } | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const { report, prevReport, trends, yearlyTrends } = useMemo(() => {
        const { current, previous, trends } = calculateComparison(
            expenses,
            selectedDate.getMonth() + 1,
            selectedDate.getFullYear()
        );
        const yearlyTrends = calculateYearlyTrends(
            expenses,
            selectedDate.getMonth() + 1,
            selectedDate.getFullYear()
        );
        return { report: current, prevReport: previous, trends, yearlyTrends };
    }, [expenses, selectedDate]);

    const dailyData = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const data = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            amount: 0,
            date: new Date(year, month, i + 1).toISOString()
        }));

        report.transactions.forEach(t => {
            const d = new Date(t.date);
            // Ensure we match the transaction to the correct day of the currently selected month
            // (Transaction filtering is already done in generateMonthlyReport but double check isn't bad)
            const dayIndex = d.getDate() - 1;
            if (data[dayIndex]) {
                data[dayIndex].amount += Number(t.amount);
            }
        });

        return data;
    }, [report.transactions, selectedDate]);

    const changeMonth = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
        setAiInsights(null); // Reset insights when month changes
    };

    const generateAIInsights = async () => {
        if (!hasData) return;

        setIsGeneratingAI(true);
        try {
            const response = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    month: selectedDate.toLocaleString('default', { month: 'long' }),
                    year: selectedDate.getFullYear(),
                    totalAmount: report.totalAmount,
                    categoryBreakdown: report.categoryBreakdown,
                    currency: currency.code
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate insights');
            }

            const data = await response.json();
            setAiInsights(data);
            toast.success('AI Insights generated successfully!');
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error generating AI insights');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const hasData = report.transactionCount > 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Generating your financial insights...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-slate-100 text-slate-900 font-bold py-3 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => setDemoMode(true)}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition-colors"
                        >
                            Load Demo Data
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
                            {isDemoMode && (
                                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md mt-1 animate-pulse">
                                    Demo Mode
                                </span>
                            )}
                        </div>
                        <p className="text-slate-500 mt-2 font-medium">Analyze your spending patterns and trends</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="px-4 py-1 text-center min-w-[140px]">
                                <span className="font-bold text-slate-900">
                                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {isDemoMode && (
                            <button
                                onClick={() => setDemoMode(false)}
                                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all"
                            >
                                Exit Demo
                            </button>
                        )}
                    </div>
                </div>

                {!hasData ? (
                    <motion.div
                        variants={itemVariants}
                        className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center"
                    >
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Search className="text-indigo-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">No data for this month</h2>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            We couldn't find any expenses for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}. Try switching to a different month.
                        </p>
                    </motion.div>
                ) : (
                    <>
                        {/* AI Insights Card */}
                        <motion.div variants={itemVariants} className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BrainCircuit size={160} className="text-white" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                            <Sparkles size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white">AI Financial Insights</h2>
                                            <p className="text-slate-400 font-medium">Personalized analysis powered by Gemini</p>
                                        </div>
                                    </div>

                                    {!aiInsights ? (
                                        <button
                                            onClick={generateAIInsights}
                                            disabled={isGeneratingAI}
                                            className="bg-white text-slate-900 h-14 px-8 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                        >
                                            {isGeneratingAI ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                                                    Analyzing Patterns...
                                                </>
                                            ) : (
                                                <>
                                                    Generate Insights
                                                    <Zap size={18} className="fill-slate-900 group-hover/btn:scale-110 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setAiInsights(null)}
                                            className="text-slate-400 hover:text-white text-sm font-bold transition-colors"
                                        >
                                            Clear Analysis
                                        </button>
                                    )}
                                </div>

                                <AnimatePresence mode="wait">
                                    {aiInsights && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8"
                                        >
                                            <div className="lg:col-span-1 space-y-4">
                                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                                                    <h3 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <Search size={14} />
                                                        Executive Summary
                                                    </h3>
                                                    <p className="text-slate-200 leading-relaxed font-medium">
                                                        {aiInsights.summary}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-1 space-y-4">
                                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-full">
                                                    <h3 className="text-red-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <AlertCircle size={14} />
                                                        Anomaly Detection
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        {aiInsights.anomalies.map((anomaly, idx) => (
                                                            <li key={idx} className="flex gap-3 text-slate-300 text-sm font-medium">
                                                                <span className="text-red-400 mt-1">•</span>
                                                                {anomaly}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-1 space-y-4">
                                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl h-full">
                                                    <h3 className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Lightbulb size={14} />
                                                        Actionable Tips
                                                    </h3>
                                                    <ul className="space-y-3">
                                                        {aiInsights.tips.map((tip, idx) => (
                                                            <li key={idx} className="flex gap-3 text-slate-300 text-sm font-medium">
                                                                <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                                </div>
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className={cn(
                                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                                        trends.isIncrease ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        {trends.isIncrease ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {Math.abs(trends.percentageChange).toFixed(1)}%
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-indigo-600">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Monthly Spending</h3>
                                <p className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(report.totalAmount)}</p>
                                <p className="text-xs text-slate-400 mt-2 font-medium">vs. {formatCurrency(prevReport.totalAmount)} last month</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                                    <Calendar size={24} />
                                </div>
                                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Transactions</h3>
                                <p className="text-3xl font-black text-slate-900 mt-1">{report.transactionCount}</p>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Completed this month</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mb-4 text-violet-600">
                                    <PieChartIcon size={24} />
                                </div>
                                <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Top Category</h3>
                                <p className="text-3xl font-black text-slate-900 mt-1">
                                    {report.categoryBreakdown[0]?.category || 'N/A'}
                                </p>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Most active spending area</p>
                            </motion.div>
                        </div>

                        {/* Daily Activity Chart */}
                        <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden mb-8">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
                            <h2 className="text-xl font-bold text-slate-900 mb-8 px-2">Daily Activity</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(val) => `${currency.symbol}${val}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            formatter={(val: any) => formatCurrency(Number(val))}
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                                padding: '12px 16px',
                                            }}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Category Breakdown (Donut) */}
                            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
                                <h2 className="text-xl font-bold text-slate-900 mb-8 px-2">Category Breakdown</h2>
                                <div className="h-[350px] min-h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={report.categoryBreakdown}
                                                dataKey="amount"
                                                nameKey="category"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={90}
                                                outerRadius={120}
                                                paddingAngle={8}
                                                stroke="none"
                                            >
                                                {report.categoryBreakdown.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#6366f1'}
                                                        className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(val: any) => formatCurrency(Number(val))}
                                                contentStyle={{
                                                    borderRadius: '24px',
                                                    border: 'none',
                                                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                                    padding: '12px 20px',
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(8px)'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                formatter={(value) => <span className="text-slate-600 font-medium text-sm">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Spending Trend (Line) */}
                            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-violet-500" />
                                <h2 className="text-xl font-bold text-slate-900 mb-8 px-2">Spending Trend</h2>
                                <div className="h-[350px] min-h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={yearlyTrends}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                                                tickFormatter={(val) => currency.symbol + val}
                                            />
                                            <Tooltip
                                                formatter={(val: any) => formatCurrency(Number(val))}
                                                contentStyle={{
                                                    borderRadius: '24px',
                                                    border: 'none',
                                                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                                    padding: '12px 20px',
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(8px)'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="amount"
                                                stroke="#8b5cf6"
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 8, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* Detailed Table */}
                        {/* Breakdown by Category */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                            <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Breakdown by Category</h2>
                                    <p className="text-sm text-slate-500 font-medium">Detailed spending share</p>
                                </div>
                                <button
                                    onClick={() => {
                                        exportMonthlyReportWithAI(
                                            report,
                                            aiInsights,
                                            selectedDate.toLocaleString('default', { month: 'long' }),
                                            currency.symbol
                                        );
                                        toast.success('Report exported successfully!');
                                    }}
                                    className="flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 active:scale-95 group"
                                >
                                    <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                                    Export Insights
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Share</th>
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Indicator</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {report.categoryBreakdown.map((item, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || '#6366f1' }}
                                                        />
                                                        <span className="font-bold text-slate-700">{item.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="text-slate-500 font-medium">{item.percentage.toFixed(1)}%</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex justify-end">
                                                        <div className="h-2.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.percentage}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className="h-full rounded-full opacity-80"
                                                                style={{ backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || '#6366f1' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Monthly Transactions List */}
                        <motion.div variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-20">
                            <div className="p-8 border-b border-slate-50">
                                <h2 className="text-xl font-bold text-slate-900">Monthly Transactions</h2>
                                <p className="text-sm text-slate-500 font-medium">All expenses recorded in {selectedDate.toLocaleString('default', { month: 'long' })}</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction</th>
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                                            <th className="px-10 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {report.transactions.map((exp, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-6 text-sm text-slate-500 font-medium">
                                                    {new Date(exp.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="font-bold text-slate-900">{exp.title}</div>
                                                    {exp.note && <div className="text-xs text-slate-400 line-clamp-1 truncate max-w-[200px] mt-0.5 font-medium">{exp.note}</div>}
                                                </td>
                                                <td className="px-10 py-6 text-sm">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] uppercase tracking-wider">
                                                        {exp.category}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <span className="font-black text-slate-900">{formatCurrency(exp.amount)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {report.transactions.length === 0 && (
                                    <div className="py-20 text-center">
                                        <p className="text-slate-400 font-medium tracking-tight">No transactions found for this period</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
