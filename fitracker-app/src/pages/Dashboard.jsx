import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, PieChart, Layers, X, FileText, ArrowRight, Download, Upload, AlertTriangle, Settings as SettingsIcon, Target, Save, Tag, Wallet as WalletIcon, CheckCircle, Menu, User, BookOpen, Info, HelpCircle, ChevronDown, ChevronUp, ChevronRight, RefreshCw, Smartphone, Camera, Moon, Bell, Volume2, Link, Mail, Check } from 'lucide-react';
import Button from '../components/Button';

import Card from '../components/Card';
import CategoryManager from '../components/CategoryManager';
import WalletManager from '../components/WalletManager';
import BudgetManager from '../components/BudgetManager';
import GmailConnectModal from '../components/GmailConnectModal';
import Sidebar from '../components/Sidebar';
import Analytics from '../components/Analytics';
import Documentation from '../components/Documentation';
import { supabase } from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/auth';
import TransactionForm from '../components/TransactionForm';
import TransactionHistory from '../components/TransactionHistory';
import { useTheme } from '../context/ThemeContext';

const Dashboard = ({ onLogout, currentUser }) => {
    const { theme, toggleTheme } = useTheme();
    // State
    const [activeTab, setActiveTab] = useState('input');
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState({});
    const [trendView, setTrendView] = useState('daily');
    const [userID, setUserID] = useState(null);

    // Categories & Wallets State
    const [userCategories, setUserCategories] = useState([]);
    const [userWallets, setUserWallets] = useState([]);
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [isWalletManagerOpen, setIsWalletManagerOpen] = useState(false);
    const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
    const [isGmailConnectOpen, setIsGmailConnectOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Sidebar State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop Sidebar State
    const [syncLoading, setSyncLoading] = useState(false);
    const [integrationStatus, setIntegrationStatus] = useState(null); // { email, picture, last_synced_at }

    // Settings State
    const [appSettings, setAppSettings] = useState({
        username: currentUser || 'Azero',
        currency: 'IDR'
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newUsername, setNewUsername] = useState('');

    // Input Modes
    const [inputMode, setInputMode] = useState('single');

    // Single Input State
    const [formData, setFormData] = useState({
        type: 'Expense',
        amount: '',
        category: '',
        wallet_id: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Bulk Input State
    const [bulkFormData, setBulkFormData] = useState([
        { type: 'Expense', amount: '', category: '', wallet_id: '', date: new Date().toISOString().split('T')[0] },
        { type: 'Expense', amount: '', category: '', wallet_id: '', date: new Date().toISOString().split('T')[0] }
    ]);

    // Text Mode State
    const [textInput, setTextInput] = useState('');

    // Load User and Data
    useEffect(() => {
        const fetchUserAndData = async () => {
            const user = await getCurrentUser();
            if (user) {
                setUserID(user.id);
                fetchWallets(user.id);
                fetchCategories(user.id);
                fetchTransactions(user.id);
                fetchBudgets(user.id);
                fetchIntegrationStatus(user.id);

                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');
                if (code) {
                    handleGmailAuth(code, user.id);
                }
            }
        };
        fetchUserAndData();
    }, [currentUser]);

    const handleGmailAuth = async (code, uid) => {
        setSyncLoading(true);
        window.history.replaceState({}, document.title, window.location.pathname);

        try {
            const { data, error } = await supabase.functions.invoke('gmail-auth', {
                body: { code, redirect_uri: window.location.origin }
            });

            if (error || (data && data.error)) {
                throw new Error(error?.message || data?.error || "Unknown error");
            }

            const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-gopay');
            if (syncError) console.warn("Auto-sync failed:", syncError);
            else alert(`Gmail connected! Synced ${syncData.added} new transactions.`);

        } catch (err) {
            console.error("Auth Error:", err);
            alert("Failed to connect Gmail: " + err.message);
        }
        setSyncLoading(false);
        fetchIntegrationStatus(uid);
    };

    const fetchIntegrationStatus = async (uid) => {
        const { data } = await supabase
            .from('integrations')
            .select('*')
            .eq('user_id', uid)
            .eq('provider', 'gmail')
            .maybeSingle();
        if (data) setIntegrationStatus(data);
    };

    const fetchWallets = async (uid) => {
        const { data, error } = await supabase.from('wallets').select('*').eq('user_id', uid).order('name');
        if (!error && data) {
            if (data.length === 0) {
                const defaultWallet = { user_id: uid, name: 'Main Wallet', type: 'Cash', balance: 0, color: '#3b82f6' };
                const { data: newWallet } = await supabase.from('wallets').insert([defaultWallet]).select();
                setUserWallets(newWallet || []);
                if (newWallet?.length > 0) setFormData(prev => ({ ...prev, wallet_id: newWallet[0].id }));
            } else {
                setUserWallets(data);
                setFormData(prev => ({ ...prev, wallet_id: prev.wallet_id || data[0]?.id || '' }));
            }
        }
    };

    const fetchCategories = async (uid) => {
        const { data, error } = await supabase.from('categories').select('*').eq('user_id', uid).order('name');
        if (!error && data) {
            if (data.length === 0) {
                const defaults = [
                    { user_id: uid, name: 'Food', type: 'Expense', color: '#ef4444' },
                    { user_id: uid, name: 'Transport', type: 'Expense', color: '#3b82f6' },
                    { user_id: uid, name: 'Shopping', type: 'Expense', color: '#f59e0b' },
                    { user_id: uid, name: 'Salary', type: 'Income', color: '#10b981' },
                    { user_id: uid, name: 'Other', type: 'Expense', color: '#64748b' }
                ];
                const { data: newCats } = await supabase.from('categories').insert(defaults).select();
                setUserCategories(newCats || []);
                if (newCats?.length > 0) setFormData(prev => ({ ...prev, category: newCats[0].name }));
            } else {
                setUserCategories(data);
                setFormData(prev => ({ ...prev, category: prev.category || data[0]?.name || '' }));
            }
        }
    };

    const fetchTransactions = async (uid) => {
        const { data, error } = await supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false });
        if (!error) setTransactions(data);
    };

    const fetchBudgets = async (uid) => {
        const { data, error } = await supabase.from('budgets').select('*').eq('user_id', uid);
        if (!error) {
            const budgetMap = {};
            data.forEach(b => budgetMap[b.category] = b.limit_amount);
            setBudgets(budgetMap);
        }
    };

    // Derived Data
    const expenseCategories = userCategories.filter(c => c.type === 'Expense').map(c => c.name);
    const getCategoriesByType = (type) => userCategories.filter(c => c.type === type).map(c => c.name);

    // Actions
    const handleExportData = () => {
        const dataStr = JSON.stringify({ transactions, budgets, appSettings }, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `fitracker_backup_${currentUser}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportData = (event) => {
        alert("Import not yet implemented for cloud database.");
    };

    const handleResetData = async () => {
        if (window.confirm('Are you sure? This will delete ALL data permanently.')) {
            await supabase.from('transactions').delete().eq('user_id', userID);
            await supabase.from('budgets').delete().eq('user_id', userID);
            setTransactions([]);
            setBudgets({});
            alert('Data reset.');
        }
    };

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

    const handleParseText = () => {
        const lines = textInput.split('\n').filter(l => l.trim());
        const parsedData = lines.map(line => {
            const parts = line.split(',').map(s => s.trim());
            return {
                type: parts[0] || 'Expense',
                amount: parts[1] || 0,
                category: parts[2] || userCategories[0]?.name || 'Other',
                date: parts[3] || new Date().toISOString().split('T')[0],
                wallet_id: userWallets[0]?.id || ''
            };
        });
        setBulkFormData(parsedData);
        setInputMode('bulk');
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!userID) return alert("User ID not found. Please relogin.");
        const { type, amount, category, date, wallet_id } = formData;
        if (!amount || !category || !wallet_id) return;

        const newTx = { user_id: userID, type, amount: parseFloat(amount), category, date, wallet_id };
        const { data, error } = await supabase.from('transactions').insert([newTx]).select();

        if (!error) {
            setTransactions([data[0], ...transactions]);
            setFormData({ ...formData, amount: '' });
            fetchWallets(userID);
        } else {
            alert("Error saving transaction: " + error.message);
        }
    };

    const handleSaveBulk = async (e) => {
        e.preventDefault();
        const validRows = bulkFormData.filter(row => row.amount && row.date);
        if (validRows.length === 0) return;

        const newTxs = validRows.map(row => ({
            user_id: userID,
            type: row.type,
            amount: parseFloat(row.amount),
            category: row.category,
            date: row.date,
            wallet_id: row.wallet_id || userWallets[0]?.id
        }));

        const { data, error } = await supabase.from('transactions').insert(newTxs).select();
        if (!error) {
            setTransactions([...data, ...transactions]);
            setBulkFormData([{ type: 'Expense', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] }]);
            setTextInput('');
            setInputMode('single');
        } else alert("Error: " + error.message);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) setTransactions(transactions.filter(t => t.id !== id));
    };

    const handleUpdateProfile = async () => {
        if (!newUsername.trim()) return alert("Username cannot be empty");
        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: newUsername }
            });
            if (error) throw error;
            setAppSettings(prev => ({ ...prev, username: newUsername }));
            setIsEditingProfile(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
        }
    };


    // Helpers
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;
    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: appSettings.currency, maximumFractionDigits: 0 }).format(num);


    // --- RENDERERS ---

    const renderInputPage = () => {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* MANAGER MODALS */}
                <CategoryManager isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} userID={userID} onCategoriesChange={() => fetchCategories(userID)} />
                <WalletManager isOpen={isWalletManagerOpen} onClose={() => setIsWalletManagerOpen(false)} userID={userID} onWalletsChange={() => fetchWallets(userID)} />

                {/* TRANSACTION FORM */}
                <TransactionForm
                    inputMode={inputMode}
                    setInputMode={setInputMode}
                    formData={formData}
                    setFormData={setFormData}
                    bulkFormData={bulkFormData}
                    setBulkFormData={setBulkFormData}
                    textInput={textInput}
                    setTextInput={setTextInput}
                    userCategories={userCategories}
                    userWallets={userWallets}
                    onAddTransaction={handleAddTransaction}
                    onSaveBulk={handleSaveBulk}
                    onParseText={handleParseText}
                    setIsCategoryManagerOpen={setIsCategoryManagerOpen}
                    setIsWalletManagerOpen={setIsWalletManagerOpen}
                    formatIDR={formatIDR}
                    getCategoriesByType={getCategoriesByType}
                />

                {/* TRANSACTION HISTORY */}
                {inputMode === 'single' && (
                    <TransactionHistory
                        transactions={transactions}
                        totalIncome={totalIncome}
                        totalExpense={totalExpense}
                        balance={balance}
                        onDelete={handleDelete}
                        formatIDR={formatIDR}
                    />
                )}
            </div>
        );
    };

    const renderStatsPage = () => (
        <Analytics transactions={transactions} categories={userCategories} />
    );

    const renderBudgetPage = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-secondary-900">Budget Planner</h2>
                <Button onClick={() => setIsBudgetManagerOpen(true)} size="sm" icon={SettingsIcon}>Manage Limits</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCategories.filter(c => c.type === 'Expense').map(cat => {
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    const spent = transactions
                        .filter(t => t.category === cat.name && t.type === 'Expense' && t.date.startsWith(currentMonth))
                        .reduce((acc, curr) => acc + curr.amount, 0);
                    const limit = budgets[cat.name] || 0;
                    if (limit === 0 && spent === 0) return null;
                    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

                    let barColor = 'bg-primary-500';
                    if (percentage >= 75) barColor = 'bg-amber-500';
                    if (percentage > 100) barColor = 'bg-rose-500';

                    return (
                        <Card key={cat.id} noPadding className="overflow-hidden">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                        <h3 className="font-bold text-secondary-900">{cat.name}</h3>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${percentage > 100 ? 'bg-rose-100 text-rose-700' : 'bg-secondary-100 text-secondary-600'}`}>
                                        {limit > 0 ? `${Math.round(percentage)}%` : 'No Limit'}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-secondary-100 rounded-full overflow-hidden mb-3">
                                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                                </div>
                                <div className="flex justify-between text-xs font-mono font-medium">
                                    <span className={spent > limit && limit > 0 ? "text-rose-600 font-bold" : "text-secondary-600"}>{formatIDR(spent)}</span>
                                    <span className="text-secondary-400">Limit: {limit > 0 ? formatIDR(limit) : '∞'}</span>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
            {Object.keys(budgets).length === 0 && (
                <div className="text-center p-12 border-2 border-dashed border-secondary-200 rounded-xl">
                    <p className="text-secondary-400 mb-4">No budgets set yet.</p>
                    <Button variant="secondary" onClick={() => setIsBudgetManagerOpen(true)}>Create Budget</Button>
                </div>
            )}
        </div>
    );

    const renderWalletPage = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-text-base">My Wallets</h2>
                <Button onClick={() => setIsWalletManagerOpen(true)} size="sm" icon={Plus}>Add Wallet</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userWallets.map(wallet => (
                    <Card key={wallet.id} noPadding className="relative overflow-hidden group hover:shadow-saas-md transition-all">
                        <div className="p-6 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-bg-surface/50 text-text-base shadow-sm">
                                    <WalletIcon size={20} />
                                </div>
                                <span className="bg-bg-surface text-text-dim px-2 py-1 rounded-md text-[10px] font-bold uppercase">{wallet.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-base mb-1">{wallet.name}</h3>
                            <p className="text-2xl font-black text-primary-600">{formatIDR(wallet.balance)}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-50 to-transparent -mr-8 -mt-8 rounded-full opacity-50"></div>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderDocsPage = () => (
        <Documentation />
    );

    const renderSettingsPage = () => {
        const user = currentUser || { email: 'user@example.com' };
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* User Profile Card */}
                        <Card title="User Profile" icon={User}>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold border-4 border-white dark:border-secondary-800 shadow-soft">
                                        {appSettings.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <div className="text-center sm:text-left flex-1">
                                    <h3 className="text-xl font-bold text-text-base">{appSettings.username || 'Guest User'}</h3>
                                    <p className="text-text-dim text-sm mb-4">Manage your account settings and preferences.</p>

                                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface rounded-lg border border-border-subtle">
                                            <Mail size={14} className="text-text-dim" />
                                            <span className="text-xs font-semibold text-text-dim">{user?.email || 'No Email'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                            <div className={`w-2 h-2 rounded-full ${integrationStatus?.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                            <span className={`text-xs font-semibold ${integrationStatus?.is_active ? 'text-emerald-700 dark:text-emerald-400' : 'text-text-dim'}`}>
                                                {integrationStatus?.is_active ? 'Gmail Connected' : 'Not Connected'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsGmailConnectOpen(true)}
                                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-soft hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    <Link size={16} /> Connect Gmail
                                </button>
                            </div>
                        </Card>

                        {/* App Preferences (NEW) */}
                        <Card title="App Preferences" icon={SettingsIcon}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 hover:bg-surface-hover rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                            <Moon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-base text-sm">Dark Mode</p>
                                            <p className="text-xs text-text-muted">Switch between light and dark themes</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={toggleTheme}
                                        className={`relative inline-block w-12 h-6 rounded-full cursor-pointer transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-border-dim'}`}
                                    >
                                        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-200 shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 hover:bg-surface-hover rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                            <Bell size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-base text-sm">Notifications</p>
                                            <p className="text-xs text-text-muted">Receive alerts about budget limits</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-block w-12 h-6 rounded-full bg-primary-500 cursor-pointer transition-colors">
                                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-6 transition-transform" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 hover:bg-surface-hover rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                            <Volume2 size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-base text-sm">Sound Effects</p>
                                            <p className="text-xs text-text-muted">Play sounds on interactions</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-block w-12 h-6 rounded-full bg-primary-500 cursor-pointer transition-colors">
                                        <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-6 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-6">
                        {/* Data Management (Revamped) */}
                        <Card title="Data Management" icon={Save}>
                            <div className="space-y-3">
                                <button
                                    onClick={handleExportData}
                                    className="w-full flex items-center justify-between p-4 bg-bg-main hover:bg-surface-hover rounded-xl border border-border-dim text-text-muted font-bold text-sm transition-all group"
                                >
                                    <span className="flex items-center gap-3">
                                        <Download size={18} className="text-primary-600" />
                                        Export Data (JSON)
                                    </span>
                                    <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                                </button>

                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleImportData}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <button className="w-full flex items-center justify-between p-4 bg-bg-main hover:bg-surface-hover rounded-xl border border-border-dim text-text-muted font-bold text-sm transition-all group">
                                        <span className="flex items-center gap-3">
                                            <Upload size={18} className="text-blue-600" />
                                            Import Data
                                        </span>
                                        <ChevronRight size={16} className="text-text-muted group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </Card>

                        {/* Danger Zone (NEW) */}
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-3xl p-6">
                            <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-2 flex items-center gap-2">
                                <AlertTriangle size={20} /> Danger Zone
                            </h3>
                            <p className="text-red-600/80 dark:text-red-300/80 text-xs mb-4 leading-relaxed">
                                Once you delete your data, there is no going back. Please be certain.
                            </p>
                            <button
                                onClick={handleResetData}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                Reset All Data
                            </button>
                        </div>

                        <Card title="About" icon={HelpCircle} className="h-auto">
                            <div className="text-sm text-secondary-600 space-y-2">
                                <p>Fitracker v1.0.0</p>
                                <p>© 2024 Fitracker Inc.</p>
                                <div className="pt-2 flex gap-4">
                                    <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
                                    <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-app-bg font-sans text-text-main selection:bg-primary-100 selection:text-primary-900 flex">
            {syncLoading && (
                <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-secondary-900/95 flex flex-col items-center justify-center">
                    <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                    <p className="text-lg font-bold text-secondary-900 dark:text-white">Syncing Data...</p>
                </div>
            )}

            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                currentUser={appSettings.username}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-32' : 'md:ml-80'} items-center`}>
                {/* MOBILE HEADER */}
                <div className="md:hidden w-full bg-surface border-b border-border p-4 flex justify-between items-center sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-text-muted hover:bg-surface-hover rounded-lg">
                        <Menu size={24} />
                    </button>
                    <span className="text-lg font-bold text-text-main">Fitracker</span>
                    <div className="w-10"></div>
                </div>

                <main className="p-4 md:p-8 w-full max-w-6xl space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'input' && (
                            <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {renderInputPage()}
                            </motion.div>
                        )}
                        {activeTab === 'stats' && (
                            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {renderStatsPage()}
                            </motion.div>
                        )}
                        {activeTab === 'budget' && (
                            <motion.div key="budget" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {renderBudgetPage()}
                            </motion.div>
                        )}
                        {activeTab === 'wallet' && (
                            <motion.div key="wallet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {renderWalletPage()}
                            </motion.div>
                        )}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {renderSettingsPage()}
                            </motion.div>
                        )}
                        {activeTab === 'docs' && (
                            <motion.div key="docs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                {renderDocsPage()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <CategoryManager
                    isOpen={isCategoryManagerOpen}
                    onClose={() => setIsCategoryManagerOpen(false)}
                    userID={userID}
                    onCategoriesChange={() => fetchCategories(userID)}
                />
                <WalletManager
                    isOpen={isWalletManagerOpen}
                    onClose={() => setIsWalletManagerOpen(false)}
                    userID={userID}
                    onWalletsChange={() => fetchWallets(userID)}
                />
                <BudgetManager
                    isOpen={isBudgetManagerOpen}
                    onClose={() => setIsBudgetManagerOpen(false)}
                    userID={userID}
                    onBudgetsChange={() => fetchBudgets(userID)}
                />
                <GmailConnectModal
                    isOpen={isGmailConnectOpen}
                    onClose={() => setIsGmailConnectOpen(false)}
                    userID={userID}
                />
            </div>
        </div>
    );
};

export default Dashboard;
