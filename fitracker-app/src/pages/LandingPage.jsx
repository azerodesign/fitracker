import React from 'react';
import { LogIn, UserPlus, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
    return (
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-800 dark:text-secondary-100 font-sans flex flex-col">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md border-b border-secondary-200 dark:border-secondary-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-saas-sm">
                            <TrendingUp size={18} strokeWidth={3} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-secondary-900 dark:text-white">Fitracker</h1>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <button
                            onClick={onLoginClick}
                            className="text-sm font-medium text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            Log in
                        </button>
                        <button
                            onClick={onRegisterClick}
                            className="text-sm font-medium bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 px-4 py-2 rounded-lg hover:bg-secondary-800 dark:hover:bg-secondary-100 transition-all shadow-saas-sm hover:shadow-saas-md"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 bg-gradient-to-b from-white to-secondary-50 dark:from-secondary-900 dark:to-secondary-950">
                <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800/50 px-3 py-1 rounded-full text-xs font-semibold text-primary-700 dark:text-primary-300 mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Financial Clarity for Modern Life
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-secondary-900 dark:text-white leading-tight">
                        Master your money <br />
                        <span className="text-primary-600">without the chaos.</span>
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl mx-auto text-secondary-500 dark:text-secondary-400 leading-relaxed">
                        Track expenses, set budgets, and visualize your financial health with clarity.
                        No clutter, just the insights you need.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onRegisterClick}
                            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl shadow-saas-lg hover:bg-primary-700 hover:shadow-saas-hover transition-all transform hover:-translate-y-0.5"
                        >
                            Start for Free <UserPlus size={18} />
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 font-semibold rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-saas-sm hover:bg-secondary-50 dark:hover:bg-secondary-700 hover:border-secondary-300 transition-all"
                        >
                            Log In <LogIn size={18} />
                        </button>
                    </div>

                    {/* Simple Feature Grid Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left max-w-3xl mx-auto">
                        <div className="p-6 bg-surface rounded-2xl border border-secondary-100 dark:border-secondary-800 shadow-saas-sm">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                                <Zap size={20} />
                            </div>
                            <h3 className="font-bold text-secondary-900 dark:text-white mb-2">Instant Tracking</h3>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Log transactions in seconds with our streamlined intuitive interface.</p>
                        </div>
                        <div className="p-6 bg-surface rounded-2xl border border-secondary-100 dark:border-secondary-800 shadow-saas-sm">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="font-bold text-secondary-900 dark:text-white mb-2">Smart Analytics</h3>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Visualize your spending patterns with beautiful, easy-to-read charts.</p>
                        </div>
                        <div className="p-6 bg-surface rounded-2xl border border-secondary-100 dark:border-secondary-800 shadow-saas-sm">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="font-bold text-secondary-900 dark:text-white mb-2">Secure & Private</h3>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">Your data is encrypted and safe. We prioritize your privacy above all.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800 py-8 text-center text-sm text-secondary-500">
                <p>&copy; {new Date().getFullYear()} Fitracker. Built for clarity.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
