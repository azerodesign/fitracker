import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Card from './Card';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight, Wallet, Download, Calendar, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface/95 p-3 border border-border/50 shadow-soft rounded-xl text-xs backdrop-blur-md z-50">
                <p className="font-bold text-text-main mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                        <span className="text-text-secondary capitalize">{entry.name}:</span>
                        <span className="font-bold font-mono" style={{ color: entry.color || entry.fill }}>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Stat Card Component
const StatCard = ({ title, amount, icon: Icon, colorClass, trend, trendUp }) => (
    <div className="bg-surface p-5 rounded-3xl shadow-sm border border-secondary-100 dark:border-secondary-800 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-3 rounded-2xl ${colorClass.bg} ${colorClass.text}`}>
                <Icon size={20} strokeWidth={2.5} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {trend}
                </div>
            )}
        </div>
        <div>
            <p className="text-secondary-500 dark:text-secondary-400 text-xs font-bold uppercase tracking-wide mb-1">{title}</p>
            <h3 className="text-xl font-black text-secondary-900 dark:text-white tracking-tight">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}
            </h3>
        </div>
    </div>
);

const Analytics = ({ transactions, categories }) => {
    const [dateRange, setDateRange] = useState('This Month');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 1. Calculate Totals for Summary Cards
    const summaryData = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
        const netSavings = totalIncome - totalExpense;

        return { totalIncome, totalExpense, netSavings };
    }, [transactions]);

    // 2. Prepare Data for Area Chart (Last 7 Days)
    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayTxs = transactions.filter(t => t.date === date);
            const income = dayTxs.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
            const expense = dayTxs.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
            return {
                name: format(new Date(date), 'dd MMM'),
                Income: income,
                Expense: expense
            };
        });
    }, [transactions]);

    // 3. Prepare Data for Pie Chart
    const pieData = useMemo(() => {
        const expenseTxs = transactions.filter(t => t.type === 'Expense');
        const categoryTotals = {};

        expenseTxs.forEach(tx => {
            if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
            categoryTotals[tx.category] += tx.amount;
        });

        return Object.keys(categoryTotals).map(catName => ({
            name: catName,
            value: categoryTotals[catName],
            color: categories.find(c => c.name === catName)?.color || '#94a3b8'
        })).sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ACTION BAR */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-secondary-900 dark:text-white tracking-tight flex items-center gap-2">
                        <TrendingUp className="text-primary-600" /> Financial Overview
                    </h1>
                    <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-1">Track your income, expenses, and savings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 bg-surface border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800 font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-95"
                        >
                            <Calendar size={16} />
                            {dateRange}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-surface rounded-xl shadow-soft border border-secondary-100 dark:border-secondary-700 z-50 p-2 animate-in fade-in zoom-in duration-200">
                                {['Last 7 Days', 'This Month', 'Last 3 Months', 'This Year'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setDateRange(option);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${dateRange === option
                                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                            : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 p-2.5 rounded-xl transition-all shadow-sm border border-primary-100 dark:border-primary-800/30" title="Download Report">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Income"
                    amount={summaryData.totalIncome}
                    icon={ArrowDownRight}
                    colorClass={{ bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' }}
                    trend="12% vs last mo"
                    trendUp={true}
                />
                <StatCard
                    title="Total Expense"
                    amount={summaryData.totalExpense}
                    icon={ArrowUpRight}
                    colorClass={{ bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' }}
                    trend="5% vs last mo"
                    trendUp={false}
                />
                <StatCard
                    title="Net Savings"
                    amount={summaryData.netSavings}
                    icon={Wallet}
                    colorClass={{ bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }}
                    trend="8% vs last mo"
                    trendUp={true}
                />
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. CASH FLOW AREA CHART */}
                <Card title="Cash Flow Analysis" className="min-h-[400px]">
                    <div className="h-[320px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="Income"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Expense"
                                    stroke="#F43F5E"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* 2. EXPENSE BREAKDOWN */}
                <Card title="Expense Distribution" className="min-h-[400px]">
                    {pieData.length > 0 ? (
                        <div className="h-[320px] w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={6}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value, entry) => (
                                            <span className="text-secondary-600 dark:text-secondary-300 font-bold text-xs ml-2">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-32 pb-4">
                                <span className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mb-1">Total Expense</span>
                                <span className="text-2xl font-black text-secondary-900 dark:text-white">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', notation: 'compact', maximumFractionDigits: 1 }).format(pieData.reduce((a, b) => a + b.value, 0))}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-secondary-300 dark:text-secondary-600 gap-4">
                            <div className="bg-secondary-50 dark:bg-secondary-800/50 p-6 rounded-full">
                                <PieChartIcon size={48} strokeWidth={1} />
                            </div>
                            <p className="font-medium text-sm">No expense data to analyze yet.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
