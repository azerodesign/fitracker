import React from 'react';
import { X, Layers, FileText, Plus, Trash2, Save } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import WalletList from './WalletList';

const TransactionForm = ({
    // Mode state
    inputMode,
    setInputMode,

    // Form data
    formData,
    setFormData,
    bulkFormData,
    setBulkFormData,
    textInput,
    setTextInput,

    // Data
    userCategories,
    userWallets,

    // Callbacks
    onAddTransaction,
    onSaveBulk,
    onParseText,

    // Modal triggers
    setIsCategoryManagerOpen,
    setIsWalletManagerOpen,

    // Utilities
    formatIDR,
    getCategoriesByType
}) => {
    const toggleInputMode = () => {
        if (inputMode === 'single') setInputMode('bulk');
        else if (inputMode === 'bulk') setInputMode('text');
        else setInputMode('single');
    };

    const getModeLabel = () => {
        if (inputMode === 'single') return { icon: X, text: "Single" };
        if (inputMode === 'bulk') return { icon: Layers, text: "Bulk" };
        return { icon: FileText, text: "Parse" };
    };

    const ModeIcon = getModeLabel().icon;

    return (
        <div className={`${inputMode !== 'single' ? 'lg:col-span-12' : 'lg:col-span-5'}`}>
            <Card className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-text-main">Add Transaction</h2>
                    <Button size="xs" variant="outline" onClick={toggleInputMode} className="text-xs">
                        <ModeIcon className="w-3 h-3 mr-1" /> {getModeLabel().text} Mode
                    </Button>
                </div>

                {/* Wallets Scroller */}
                <WalletList
                    wallets={userWallets}
                    selectedWalletId={formData.wallet_id}
                    onWalletSelect={(walletId) => setFormData({ ...formData, wallet_id: walletId })}
                    onManageClick={() => setIsWalletManagerOpen(true)}
                    formatIDR={formatIDR}
                />

                {/* SINGLE MODE FORM */}
                {inputMode === 'single' && (
                    <form onSubmit={onAddTransaction} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-text-dim uppercase mb-2 ml-1">Type</label>
                                <div className="grid grid-cols-2 gap-2 bg-bg-surface p-1.5 rounded-full border border-border-subtle">
                                    {['Expense', 'Income'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type })}
                                            className={`py-2 px-3 text-xs font-bold rounded-full transition-all duration-300 ${formData.type === type ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-text-dim hover:text-text-base'}`}
                                        >
                                            {type === 'Income' ? '+' : '-'} {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-dim uppercase mb-2 ml-1">Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-bg-surface border border-border-subtle rounded-full text-sm text-text-base focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-dim uppercase mb-2 ml-1">Amount</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim font-bold text-sm">Rp</span>
                                <input
                                    type="number"
                                    className="w-full pl-12 pr-6 py-4 bg-bg-surface border border-border-subtle rounded-3xl text-2xl font-black text-slate-900 dark:text-white placeholder:text-text-dim focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="block text-xs font-bold text-text-dim uppercase">Category</label>
                                <button type="button" onClick={() => setIsCategoryManagerOpen(true)} className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline">Manage</button>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {getCategoriesByType(formData.type).slice(0, 5).map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, category: cat })}
                                        className={`py-2.5 px-2 text-xs font-bold rounded-2xl border-2 transition-all truncate ${formData.category === cat ? 'bg-[#2D70FD] border-[#2D70FD] text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 border-border-dim text-text-base dark:text-slate-100 hover:bg-surface-hover shadow-sm'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button type="button" onClick={() => setIsCategoryManagerOpen(true)} className="py-2.5 px-2 text-xs font-bold rounded-2xl border-2 border-dashed border-border-subtle text-text-dim hover:bg-surface-hover hover:text-text-base hover:border-primary-300">More...</button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-3 shadow-lg shadow-primary-500/20">
                            Add Transaction
                        </Button>
                    </form>
                )}

                {/* TEXT PARSING MODE */}
                {inputMode === 'text' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 text-amber-800 dark:text-amber-200 text-xs">
                            <span className="font-bold">Format:</span> Type, Amount, Category, Date <br />
                            <span className="opacity-75">Example: Expense, 50000, Food, 2024-01-01</span>
                        </div>
                        <textarea
                            className="w-full h-32 p-3 text-sm font-mono border border-border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none bg-surface text-text-main"
                            placeholder="Paste your data here..."
                            value={textInput}
                            onChange={e => setTextInput(e.target.value)}
                        />
                        <Button onClick={onParseText} className="w-full">Parse Text</Button>
                    </div>
                )}

                {/* BULK INPUT MODE */}
                {inputMode === 'bulk' && (
                    <form onSubmit={onSaveBulk}>
                        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {bulkFormData.map((row, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-bg-surface p-4 rounded-3xl shadow-sm border border-border-subtle group hover:border-primary-200 dark:hover:border-primary-700/50 transition-colors">
                                    {/* Type Select */}
                                    <div className="w-full sm:w-[120px]">
                                        <label className="text-[10px] font-bold text-text-dim uppercase mb-1 block sm:hidden">Type</label>
                                        <select
                                            value={row.type}
                                            onChange={e => {
                                                const n = [...bulkFormData];
                                                n[idx].type = e.target.value;
                                                setBulkFormData(n);
                                            }}
                                            className="w-full px-4 py-3 bg-bg-main border border-border-subtle rounded-2xl text-sm font-bold text-text-dim focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer"
                                        >
                                            <option value="Expense">Expense</option>
                                            <option value="Income">Income</option>
                                        </select>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="flex-1 w-full">
                                        <label className="text-[10px] font-bold text-text-dim uppercase mb-1 block sm:hidden">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim font-bold text-xs">Rp</span>
                                            <input
                                                type="number"
                                                value={row.amount}
                                                onChange={e => {
                                                    const n = [...bulkFormData];
                                                    n[idx].amount = e.target.value;
                                                    setBulkFormData(n);
                                                }}
                                                placeholder="0"
                                                className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border-subtle rounded-2xl text-sm font-bold text-text-base placeholder:text-text-dim focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Category Select */}
                                    <div className="flex-1 w-full">
                                        <label className="text-[10px] font-bold text-text-dim uppercase mb-1 block sm:hidden">Category</label>
                                        <select
                                            value={row.category}
                                            onChange={e => {
                                                const n = [...bulkFormData];
                                                n[idx].category = e.target.value;
                                                setBulkFormData(n);
                                            }}
                                            className="w-full px-4 py-3 bg-bg-main border border-border-subtle rounded-2xl text-sm font-bold text-text-dim focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer"
                                        >
                                            {getCategoriesByType(row.type).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const n = bulkFormData.filter((_, i) => i !== idx);
                                            setBulkFormData(n);
                                        }}
                                        className="p-3 text-text-dim hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-colors sm:mt-0 mt-2 self-end sm:self-center"
                                        title="Remove Row"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => setBulkFormData([...bulkFormData, { type: 'Expense', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] }])}
                                className="flex-1 py-3 px-4 rounded-2xl border-2 border-dashed border-border text-text-muted font-bold text-sm hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Add Another Line
                            </button>
                            <Button type="submit" className="flex-1 py-3 shadow-lg shadow-primary-500/20" size="lg">
                                <Save size={18} className="mr-2" /> Save All Transactions
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default TransactionForm;
