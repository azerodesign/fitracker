import React from 'react';
import { Rocket, Wallet, Layers, BarChart3, HelpCircle, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import Card from './Card';

const DocSection = ({ icon: Icon, title, children, className }) => (
    <Card className={`h-auto ${className}`} noPadding>
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-sm">
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-lg text-text-base">{title}</h3>
            </div>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed">
                {children}
            </div>
        </div>
    </Card>
);

const Documentation = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-base tracking-tight">Documentation</h1>
                    <p className="text-text-dim mt-1">Master your finances with this quick guide.</p>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

                {/* 1. GETTING STARTED */}
                <div className="space-y-6">
                    <DocSection icon={Rocket} title="Getting Started">
                        <p>Follow these steps to start tracking:</p>
                        <ul className="space-y-3 mt-2">
                            {[
                                { step: 1, text: "Create a Wallet (Bank, Cash, etc.)" },
                                { step: 2, text: "Set monthly Budgets" },
                                { step: 3, text: "Log your first Transaction" }
                            ].map(item => (
                                <li key={item.step} className="flex items-center gap-3 bg-bg-surface p-3 rounded-2xl border border-border-subtle">
                                    <span className="w-6 h-6 rounded-full bg-bg-main text-primary-600 dark:text-primary-400 font-bold text-xs flex items-center justify-center shadow-sm border border-border-subtle">
                                        {item.step}
                                    </span>
                                    <span className="font-semibold text-text-base">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </DocSection>

                    <DocSection icon={HelpCircle} title="FAQ">
                        <div className="space-y-4">
                            <div>
                                <p className="font-bold text-text-base mb-1">Is my data safe?</p>
                                <p>Yes! Data is primarily stored on your device only or securely in your private cloud database if logged in.</p>
                            </div>
                            <div className="border-t border-border-subtle pt-3">
                                <p className="font-bold text-text-base mb-1">Can I export data?</p>
                                <p>Absolutely. Go to <span className="font-bold text-primary-600 dark:text-primary-400">Settings &gt; Data Management</span> to download a JSON backup.</p>
                            </div>
                        </div>
                    </DocSection>
                </div>

                {/* 2. CORE CONCEPTS */}
                <div className="space-y-6">
                    <DocSection icon={Wallet} title="Managing Finances">
                        <div className="space-y-4">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-1">
                                    <Wallet size={16} /> Wallets
                                </h4>
                                <p className="text-emerald-700 dark:text-emerald-400 text-xs">
                                    Real-world accounts (e.g., Bank BCA, Cash, GoPay). They hold your current balance.
                                </p>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                                <h4 className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2 mb-1">
                                    <FileText size={16} /> Budgets
                                </h4>
                                <p className="text-rose-700 dark:text-rose-400 text-xs">
                                    Spending limits for specific categories (e.g., Food limit 2jt/month). They don't hold money, they just warn you.
                                </p>
                            </div>
                        </div>
                    </DocSection>

                    <DocSection icon={BarChart3} title="Analytics">
                        <p>Understanding your charts:</p>
                        <ul className="list-disc pl-4 space-y-1 marker:text-primary-500">
                            <li><span className="font-bold">Cash Flow:</span> Shows money coming in vs going out over the last 7 days.</li>
                            <li><span className="font-bold">Expense Breakdown:</span> A pie chart showing where you spend the most money by category.</li>
                        </ul>
                    </DocSection>
                </div>

                {/* 3. ADVANCED FEATURES */}
                <div className="space-y-6">
                    <DocSection icon={Layers} title="Input Modes">
                        <p>We offer three ways to input data:</p>
                        <div className="space-y-3">
                            <div className="group hover:bg-bg-surface p-2 rounded-xl transition-colors border border-transparent hover:border-border-subtle">
                                <p className="font-bold text-text-base">1. Single Mode</p>
                                <p className="text-xs text-text-dim">Best for adding one transaction quick and easy.</p>
                            </div>
                            <div className="group hover:bg-bg-surface p-2 rounded-xl transition-colors border border-transparent hover:border-border-subtle">
                                <p className="font-bold text-text-base">2. Bulk Mode</p>
                                <p className="text-xs text-text-dim">Excel-like interface. Add 10+ items at once.</p>
                            </div>
                            <div className="group hover:bg-bg-surface p-2 rounded-xl transition-colors border border-transparent hover:border-border-subtle">
                                <p className="font-bold text-text-base">3. Text Parse Mode</p>
                                <p className="text-xs text-text-dim">Paste text like "Expense, 50k, Food" and we'll format it.</p>
                            </div>
                        </div>
                    </DocSection>

                    <Card className="h-auto bg-gradient-to-br from-primary-600 to-primary-800 text-white" noPadding>
                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <CheckCircle size={20} /> Pro Tip
                            </h3>
                            <p className="text-primary-100 text-sm mb-4">
                                Connect your Gmail account to automatically sync GoPay & OVO receipts!
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl text-xs backdrop-blur-sm transition-all w-full text-center">
                                Go to Settings
                            </button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default Documentation;
