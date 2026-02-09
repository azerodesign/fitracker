import React from 'react';
import { Smartphone, Tag, Trash2, FileText, Wallet as WalletIcon } from 'lucide-react';
import Card from './Card';

const TransactionHistory = ({ transactions, totalIncome, totalExpense, balance, onDelete, formatIDR }) => {
    return (
        <div className="lg:col-span-7 space-y-6">
            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-none shadow-soft" noPadding>
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Income</p>
                            <p className="text-xl font-black text-secondary-900">{formatIDR(totalIncome)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Smartphone size={20} />
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-soft" noPadding>
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Expense</p>
                            <p className="text-xl font-black text-secondary-900">{formatIDR(totalExpense)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <Tag size={20} />
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-soft" noPadding>
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
                            <p className="text-xl font-black text-secondary-900">{formatIDR(balance)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <WalletIcon size={20} />
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Recent Transactions" className="min-h-[400px]">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-secondary-400">
                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm">No transactions yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.slice(0, 10).map((tx) => (
                            <div key={tx.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-800/50 border border-transparent hover:border-secondary-100 dark:hover:border-secondary-700 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'Income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                                        {tx.type === 'Income' ? <Smartphone size={18} /> : <Tag size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-secondary-900">{tx.category}</p>
                                        <p className="text-xs text-secondary-400">{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono font-bold text-sm ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {tx.type === 'Income' ? '+' : '-'} {formatIDR(tx.amount)}
                                    </span>
                                    <button onClick={() => onDelete(tx.id)} className="opacity-0 group-hover:opacity-100 p-2 text-secondary-300 hover:text-rose-500 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TransactionHistory;
