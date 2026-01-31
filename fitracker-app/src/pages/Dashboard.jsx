import React, { useState, useEffect } from 'react';
import { Plus, Trash2, PieChart, Layers, X, FileText, ArrowRight, Download, Upload, AlertTriangle, Settings as SettingsIcon, Target, Save, Tag, Wallet as WalletIcon, CheckCircle, Menu, User, BookOpen, Info, HelpCircle } from 'lucide-react';
import { COLORS } from '../constants';
import BauhausDecor from '../components/BauhausDecor';
import BauhausButton from '../components/BauhausButton';
import Card from '../components/Card';
import CategoryManager from '../components/CategoryManager';
import WalletManager from '../components/WalletManager';
import BudgetManager from '../components/BudgetManager';
import GmailConnectModal from '../components/GmailConnectModal';
import Sidebar from '../components/Sidebar';
import { supabase } from '../utils/supabaseClient';
import { getCurrentUser } from '../utils/auth';

const Dashboard = ({ onLogout, currentUser }) => {
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
        wallet_id: '', // NEW
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
    // Load User and Data
    useEffect(() => {
        const fetchUserAndData = async () => {
            const user = await getCurrentUser();
            if (user) {
                setUserID(user.id);
                // Parallel fetching logic or sequential if needed
                fetchWallets(user.id);
                fetchCategories(user.id);
                fetchTransactions(user.id);
                fetchBudgets(user.id);
                fetchIntegrationStatus(user.id);

                // Handle Gmail OAuth Code
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
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        try {
            const { data, error } = await supabase.functions.invoke('gmail-auth', {
                body: { code, redirect_uri: window.location.origin }
            });

            if (error || (data && data.error)) {
                throw new Error(error?.message || data?.error || "Unknown error");
            }

            // AUTO-SYNC TRIGGER
            const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-gopay');
            if (syncError) console.warn("Auto-sync failed:", syncError);
            else alert(`Gmail connected! Synced ${syncData.added} new transactions.`);

        } catch (err) {
            console.error("Auth Error:", err);
            alert("Failed to connect Gmail: " + err.message + "\n\n(Ensure you deployed 'supabase functions deploy gmail-auth' and 'sync-gopay')");
        }
        setSyncLoading(false);
        setSyncLoading(false);
        fetchIntegrationStatus(uid); // Refresh status
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

    const handleManualSync = async () => {
        setSyncLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('sync-gopay');
            if (error) throw error;
            alert(`Sync complete! Added ${data.added} new transactions.`);
            fetchTransactions(userID); // Refresh list
            fetchIntegrationStatus(userID); // Refresh status
        } catch (err) {
            alert("Sync failed: " + err.message);
        }
        setSyncLoading(false);
    };

    const fetchWallets = async (uid) => {
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', uid)
            .order('name');

        if (!error && data) {
            if (data.length === 0) {
                // Default Wallet
                const defaultWallet = { user_id: uid, name: 'Main Wallet', type: 'Cash', balance: 0, color: '#F9C74F' };
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
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', uid)
            .order('name');

        if (!error && data) {
            if (data.length === 0) {
                // Initialize Defaults
                const defaults = [
                    { user_id: uid, name: 'Food', type: 'Expense', color: '#E63946' },
                    { user_id: uid, name: 'Transport', type: 'Expense', color: '#457B9D' },
                    { user_id: uid, name: 'Shopping', type: 'Expense', color: '#F9C74F' },
                    { user_id: uid, name: 'Salary', type: 'Income', color: '#1D3557' },
                    { user_id: uid, name: 'Other', type: 'Expense', color: '#A8DADC' }
                ];
                const { data: newCats } = await supabase.from('categories').insert(defaults).select();
                setUserCategories(newCats || []);
                if (newCats?.length > 0) setFormData(prev => ({ ...prev, category: newCats[0].name }));
            } else {
                setUserCategories(data);
                // Set default category for form if not set
                setFormData(prev => ({ ...prev, category: prev.category || data[0]?.name || '' }));
            }
        }
    };

    const fetchTransactions = async (uid) => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', uid)
            .order('date', { ascending: false });

        if (!error) setTransactions(data);
    };

    const fetchBudgets = async (uid) => {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', uid);

        if (!error) {
            const budgetMap = {};
            data.forEach(b => budgetMap[b.category] = b.limit_amount);
            setBudgets(budgetMap);
        }
    };


    // Derived Categories Lists
    const categories = userCategories.map(c => c.name); // Backwards compatibility for now
    const expenseCategories = userCategories.filter(c => c.type === 'Expense').map(c => c.name);
    const incomeCategories = userCategories.filter(c => c.type === 'Income').map(c => c.name);

    // Filter categories for Dropdown based on Type Selection
    const getCategoriesByType = (type) => {
        return userCategories.filter(c => c.type === type).map(c => c.name);
    };

    // --- ACTIONS ---

    // Settings Actions
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
        // TODO: Implement import logic for Supabase if needed (batch insert)
        alert("Import not yet implemented for cloud database.");
    };

    const handleResetData = async () => {
        if (window.confirm('APAKAH ANDA YAKIN? Semua data akan dihapus permanen.')) {
            await supabase.from('transactions').delete().eq('user_id', userID);
            await supabase.from('budgets').delete().eq('user_id', userID);
            setTransactions([]);
            setBudgets({});
            alert('Data telah di-reset.');
        }
    };

    // Cycle Modes
    const toggleInputMode = () => {
        if (inputMode === 'single') setInputMode('bulk');
        else if (inputMode === 'bulk') setInputMode('text');
        else setInputMode('single');
    };

    const getModeLabel = () => {
        if (inputMode === 'single') return { icon: <X size={14} />, text: "Single Mode" };
        if (inputMode === 'bulk') return { icon: <Layers size={14} />, text: "Bulk Table" };
        return { icon: <FileText size={14} />, text: "Text Parser" };
    };

    const handleParseText = () => {
        const lines = textInput.split('\n').filter(l => l.trim());
        const parsedData = lines.map(line => {
            const parts = line.split(',').map(s => s.trim());
            const type = parts[0] || 'Expense';
            const amount = parts[1] || 0;
            const category = parts[2] || userCategories[0]?.name || 'Other';
            let date = parts[3] || new Date().toISOString().split('T')[0];
            const wallet_id = userWallets[0]?.id || '';

            return { type, amount, category, date, wallet_id };
        });

        setBulkFormData(parsedData);
        setInputMode('bulk');
    };

    // Single Add
    const handleAddTransaction = async (e) => {
        e.preventDefault();

        if (!userID) {
            alert("User ID not found. Please relogin.");
            return;
        }

        const { type, amount, category, date, wallet_id } = formData; // Add wallet_id

        if (!amount || !category || !wallet_id) return;

        const val = parseFloat(amount);
        const newTx = {
            user_id: userID,
            type,
            amount: val,
            category,
            date,
            wallet_id
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([newTx])
            .select();

        if (!error) {
            setTransactions([data[0], ...transactions]);
            // Reset but keep wallet/category potentially
            setFormData({ ...formData, amount: '' });
            fetchWallets(userID); // Refresh balances
        } else {
            alert("Error saving transaction: " + error.message);
        }
    };

    // Bulk Actions
    const handleAddBulkRow = () => {
        setBulkFormData([
            ...bulkFormData,
            { type: 'Expense', amount: '', category: userCategories[0]?.name || 'Food', wallet_id: userWallets[0]?.id || '', date: new Date().toISOString().split('T')[0] }
        ]);
    };

    const handleBulkChange = (index, field, value) => {
        const newData = [...bulkFormData];
        newData[index][field] = value;
        setBulkFormData(newData);
    };

    const handleRemoveBulkRow = (index) => {
        if (bulkFormData.length === 1) return;
        const newData = bulkFormData.filter((_, i) => i !== index);
        setBulkFormData(newData);
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
            wallet_id: row.wallet_id || userWallets[0]?.id // Fallback
        }));

        const { data, error } = await supabase
            .from('transactions')
            .insert(newTxs)
            .select();

        if (!error) {
            setTransactions([...data, ...transactions]);
            setBulkFormData([
                { type: 'Expense', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0] },
                { type: 'Expense', amount: '', category: 'Transport', date: new Date().toISOString().split('T')[0] }
            ]);
            setTextInput('');
            setInputMode('single');
        } else {
            alert("Error saving bulk transactions: " + error.message);
        }
    };

    // Text Mode Logic (Removed duplicate)

    const handleDelete = async (id) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    const handleSetBudget = async (category, limit) => {
        const val = parseFloat(limit);
        // Optimistic Update
        setBudgets({ ...budgets, [category]: val });

        const { error } = await supabase
            .from('budgets')
            .upsert({ user_id: userID, category, limit_amount: val }, { onConflict: 'user_id, category' });

        if (error) console.error("Error saving budget", error);
    };

    // Calculations
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    // --- RENDER FUNCTIONS ---

    const renderInputPage = () => (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* MODALS */}
            <CategoryManager isOpen={isCategoryManagerOpen} onClose={() => setIsCategoryManagerOpen(false)} userID={userID} onCategoriesChange={() => fetchCategories(userID)} />
            <WalletManager isOpen={isWalletManagerOpen} onClose={() => setIsWalletManagerOpen(false)} userID={userID} onWalletsChange={() => fetchWallets(userID)} />

            <div className={`${inputMode !== 'single' ? 'md:col-span-12' : 'md:col-span-5'}`}>
                <Card className="min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-black text-white p-2 font-bold transform -rotate-2">IN</div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Input</h2>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={toggleInputMode} className="flex items-center gap-1 text-xs font-bold uppercase border-2 border-black px-2 py-1 hover:bg-[#F9C74F]">
                                {getModeLabel().icon} {getModeLabel().text}
                            </button>
                        </div>
                    </div>

                    {/* WALLET CARDS */}
                    <div className="mb-6 p-4 bg-[#F1FAEE] border-2 border-black flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                                <WalletIcon size={16} /> Wallets
                            </h3>
                            <button
                                onClick={() => setIsWalletManagerOpen(true)}
                                className="text-xs text-[#E63946] font-bold underline hover:text-black flex items-center gap-1"
                            >
                                <SettingsIcon size={12} /> Manage
                            </button>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {userWallets.map(w => (
                                <div key={w.id} className="min-w-[120px] p-2 bg-white border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold uppercase text-gray-500">{w.type}</span>
                                        <div className="w-2 h-2 rounded-full border border-black" style={{ backgroundColor: w.color || '#000' }} />
                                    </div>
                                    <div className="font-bold text-xs truncate mb-1">{w.name}</div>
                                    <div className="font-mono text-xs text-right text-gray-700 bg-gray-100 p-1">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(w.balance || 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {inputMode === 'text' && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#FFF8E1] p-3 border-l-4 border-[#F9C74F] text-xs font-mono">
                                <p>Format: <b>Type, Amount, Category, Date</b></p>
                                <p>Ex: Expense, 50000, Food, 2024-01-20</p>
                                <p>*Default Wallet: {userWallets[0]?.name}</p>
                            </div>
                            <textarea
                                className="w-full h-32 p-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                placeholder={`Expense, 20000, Food, ${new Date().toISOString().split('T')[0]}`}
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                            />
                            <BauhausButton onClick={handleParseText} className="flex justify-center items-center gap-2">
                                <FileText size={18} /> Parse Text
                            </BauhausButton>
                        </div>
                    )}

                    {inputMode === 'bulk' && (
                        <form onSubmit={handleSaveBulk}>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-4">
                                {bulkFormData.map((row, index) => (
                                    <div key={index} className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-black relative group">
                                        <div className="absolute -left-2 -top-2 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-[80px]">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tipe</label>
                                            <select
                                                className="w-full p-2 border-2 border-black text-sm"
                                                value={row.type}
                                                onChange={e => handleBulkChange(index, 'type', e.target.value)}
                                            >
                                                <option value="Expense">EXP</option>
                                                <option value="Income">INC</option>
                                            </select>
                                        </div>
                                        <div className="flex-[2] min-w-[120px]">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Jumlah</label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border-2 border-black text-sm"
                                                placeholder="0"
                                                value={row.amount}
                                                onChange={e => handleBulkChange(index, 'amount', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-[2] min-w-[120px]">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Wallet</label>
                                            <select
                                                className="w-full p-2 border-2 border-black text-sm"
                                                value={row.wallet_id}
                                                onChange={e => handleBulkChange(index, 'wallet_id', e.target.value)}
                                            >
                                                {userWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-[2] min-w-[120px]">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Kategori</label>
                                            <select
                                                className="w-full p-2 border-2 border-black text-sm"
                                                value={row.category}
                                                onChange={e => handleBulkChange(index, 'category', e.target.value)}
                                            >
                                                {getCategoriesByType(row.type).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex-[2] w-full md:w-auto">
                                            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tanggal</label>
                                            <input
                                                type="date"
                                                className="w-full p-2 border-2 border-black text-sm"
                                                value={row.date}
                                                onChange={e => handleBulkChange(index, 'date', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBulkRow(index)}
                                            className="p-2 bg-red-100 border-2 border-transparent hover:border-black text-red-500"
                                            disabled={bulkFormData.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={handleAddBulkRow}
                                    className="flex-1 py-2 border-2 border-dashed border-black hover:bg-gray-50 font-bold text-sm uppercase flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Row
                                </button>
                                <BauhausButton type="submit" className="flex-1 flex justify-center items-center gap-2">
                                    <Save size={18} /> Save All ({bulkFormData.filter(r => r.amount).length})
                                </BauhausButton>
                            </div>
                        </form>
                    )}

                    {inputMode === 'single' && (
                        // --- SINGLE FORM ---
                        <form onSubmit={handleAddTransaction} className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block font-bold text-sm mb-1">TIPE</label>
                                    <select
                                        className="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Income">Income (+)</option>
                                        <option value="Expense">Expense (-)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block font-bold text-sm mb-1">DOMPET</label>
                                    <select
                                        className="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                        value={formData.wallet_id}
                                        onChange={e => setFormData({ ...formData, wallet_id: e.target.value })}
                                    >
                                        {userWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-sm mb-1">JUMLAH (IDR)</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block font-bold text-sm">KATEGORI</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryManagerOpen(true)}
                                        className="text-xs text-[#E63946] font-bold uppercase underline hover:text-black flex items-center gap-1"
                                    >
                                        <SettingsIcon size={12} /> Manage
                                    </button>
                                </div>
                                <select
                                    className="w-full p-3 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {getCategoriesByType(formData.type).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-sm mb-1">TANGGAL</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            <BauhausButton type="submit" className="mt-4 flex justify-center items-center gap-2">
                                <Plus size={20} /> Add Transaction
                            </BauhausButton>
                        </form>
                    )}
                </Card>
            </div>

            {/* Recent Transactions (Hide when in Bulk/Text Mode) */}
            {inputMode === 'single' && (
                <div className="md:col-span-7">
                    <div className="bg-[#1D3557] text-white p-4 border-2 border-black shadow-[6px_6px_0px_0px_#E63946] mb-4">
                        <h3 className="font-bold text-lg uppercase tracking-wider">Transaksi Terakhir</h3>
                    </div>
                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10 opacity-50 font-mono">Belum ada data transaksi.</div>
                        ) : (
                            transactions.slice(0, 5).map(tx => (
                                <div key={tx.id} className="group relative flex justify-between items-center bg-white border-2 border-black p-4 hover:shadow-[4px_4px_0px_0px_#F9C74F] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 ${tx.type === 'Income' ? 'bg-[#457B9D]' : 'bg-[#E63946]'} rotate-45 border border-black`} />
                                        <div>
                                            <p className="font-bold text-sm">{tx.category}</p>
                                            <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                                                {tx.date}
                                                {/* Optional: Show Wallet Name if available in join */}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-bold ${tx.type === 'Income' ? 'text-[#457B9D]' : 'text-[#E63946]'}`}>
                                            {tx.type === 'Income' ? '+' : '-'} {formatIDR(tx.amount)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(tx.id)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const renderStatsPage = () => {
        // --- PREPARE DATA ---

        // 1. Category Summary
        const categoryStats = categories.map(cat => {
            const inc = transactions.filter(t => t.category === cat && t.type === 'Income').reduce((a, b) => a + b.amount, 0);
            const exp = transactions.filter(t => t.category === cat && t.type === 'Expense').reduce((a, b) => a + b.amount, 0);
            return { cat, inc, exp };
        });

        // 2. Trend Data Generation Logic
        const generateChartData = () => {
            const today = new Date();
            let dataPoints = [];

            if (trendView === 'daily') {
                // Last 7 days
                dataPoints = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() - (6 - i));
                    const dateStr = d.toISOString().split('T')[0];
                    return {
                        key: dateStr,
                        label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                        filter: (t) => t.date === dateStr
                    };
                });
            } else if (trendView === 'weekly') {
                // Last 8 Weeks
                dataPoints = Array.from({ length: 8 }, (_, i) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() - ((7 - i) * 7));

                    // Get start of week (Monday)
                    const day = d.getDay();
                    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                    const startOfWeek = new Date(d);
                    startOfWeek.setDate(diff);
                    startOfWeek.setHours(0, 0, 0, 0);

                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(endOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);

                    return {
                        key: startOfWeek.toISOString(),
                        label: startOfWeek.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                        filter: (t) => {
                            const tDate = new Date(t.date);
                            return tDate >= startOfWeek && tDate <= endOfWeek;
                        }
                    };
                });
            } else if (trendView === 'monthly') {
                // Last 6 Months
                dataPoints = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date(today);
                    d.setMonth(d.getMonth() - (5 - i));
                    d.setDate(1); // First day
                    const monthKey = d.toISOString().slice(0, 7); // YYYY-MM
                    return {
                        key: monthKey,
                        label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
                        filter: (t) => t.date.startsWith(monthKey)
                    };
                });
            } else if (trendView === 'yearly') {
                // Last 3 Years
                dataPoints = Array.from({ length: 3 }, (_, i) => {
                    const d = new Date(today);
                    d.setFullYear(d.getFullYear() - (2 - i));
                    const yearKey = d.getFullYear().toString();
                    return {
                        key: yearKey,
                        label: yearKey,
                        filter: (t) => t.date.startsWith(yearKey)
                    };
                });
            }

            return dataPoints.map(point => {
                const relevantTxs = transactions.filter(point.filter);
                const inc = relevantTxs.filter(t => t.type === 'Income').reduce((a, b) => a + b.amount, 0);
                const exp = relevantTxs.filter(t => t.type === 'Expense').reduce((a, b) => a + b.amount, 0);
                return { ...point, inc, exp };
            });
        };

        const chartData = generateChartData();
        const maxChartVal = Math.max(...chartData.map(d => Math.max(d.inc, d.exp)), 100);

        return (
            <div className="space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative overflow-hidden p-6 bg-[#457B9D] border-2 border-black shadow-[6px_6px_0px_0px_#1D3557] text-white">
                        <div className="absolute top-[-20px] right-[-20px] w-20 h-20 bg-white/20 rounded-full"></div>
                        <p className="text-sm font-bold opacity-80 uppercase mb-2">Total Income</p>
                        <h2 className="text-2xl font-mono font-bold">{formatIDR(totalIncome)}</h2>
                    </div>
                    <div className="relative overflow-hidden p-6 bg-[#E63946] border-2 border-black shadow-[6px_6px_0px_0px_#1D3557] text-white">
                        <div className="absolute bottom-[-10px] left-[-10px] w-0 h-0 border-l-[40px] border-l-transparent border-b-[40px] border-b-white/20 border-r-[40px] border-r-transparent"></div>
                        <p className="text-sm font-bold opacity-80 uppercase mb-2">Total Expense</p>
                        <h2 className="text-2xl font-mono font-bold">{formatIDR(totalExpense)}</h2>
                    </div>
                    <div className="p-6 bg-[#F9C74F] border-2 border-black shadow-[6px_6px_0px_0px_#1D3557] text-[#1D3557]">
                        <p className="text-sm font-bold opacity-80 uppercase mb-2">Net Balance</p>
                        <h2 className="text-3xl font-mono font-black">{formatIDR(balance)}</h2>
                    </div>
                </div>

                {/* --- SECTION 1: TREND CHART (TIME SERIES) --- */}
                <Card
                    title="Financial Trend"
                    className="min-h-[300px]"
                    headerAction={
                        <div className="flex gap-2 text-xs font-bold">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setTrendView(view)}
                                    className={`px-2 py-1 uppercase border-2 border-black transition-all ${trendView === view
                                        ? 'bg-[#1D3557] text-white shadow-[2px_2px_0px_0px_#E63946]'
                                        : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                >
                                    {view === 'daily' ? 'Day' : view === 'weekly' ? 'Week' : view === 'monthly' ? 'Month' : 'Year'}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <div className="flex justify-around items-end h-64 gap-2 pt-4 border-b-2 border-black pb-2">
                        {chartData.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono">
                                No data available for this range
                            </div>
                        ) : (
                            chartData.map((d, idx) => (
                                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                                    <div className="flex gap-1 items-end w-full justify-center h-full max-w-[40px]">
                                        {/* Expense Bar (Red) */}
                                        <div
                                            style={{ height: `${Math.max((d.exp / maxChartVal) * 80, 2)}%` }}
                                            className="w-1/2 bg-[#E63946] border-t-2 border-x-2 border-black min-h-[4px] transition-all duration-500 relative"
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] p-1 whitespace-nowrap z-10 pointer-events-none">
                                                Exp: {formatIDR(d.exp)}
                                            </div>
                                        </div>
                                        {/* Income Bar (Blue) */}
                                        <div
                                            style={{ height: `${Math.max((d.inc / maxChartVal) * 80, 2)}%` }}
                                            className="w-1/2 bg-[#457B9D] border-t-2 border-x-2 border-black min-h-[4px] transition-all duration-500 relative"
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] p-1 whitespace-nowrap z-10 pointer-events-none">
                                                Inc: {formatIDR(d.inc)}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[10px] md:text-xs font-bold font-mono whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">{d.label}</p>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* --- SECTION 2: DETAILED BREAKDOWN (STRUCTURE) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Expense Breakdown */}
                    <Card title="Expense Structure" color="#FFF">
                        <div className="space-y-4">
                            {categoryStats.filter(c => c.exp > 0).length === 0 ? (
                                <p className="text-gray-400 text-sm italic">Belum ada pengeluaran.</p>
                            ) : (
                                categoryStats.filter(c => c.exp > 0).sort((a, b) => b.exp - a.exp).map(c => {
                                    const percent = (c.exp / totalExpense) * 100;
                                    return (
                                        <div key={c.cat} className="group">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span>{c.cat}</span>
                                                <span className="text-[#E63946]">{formatIDR(c.exp)}</span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-100 border border-black relative">
                                                <div
                                                    className="h-full bg-[#E63946]"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-[10px] font-mono text-gray-500 mt-1">
                                                {percent.toFixed(1)}% of Total
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </Card>

                    {/* Income Breakdown */}
                    <Card title="Income Sources" color="#FFF">
                        <div className="space-y-4">
                            {categoryStats.filter(c => c.inc > 0).length === 0 ? (
                                <p className="text-gray-400 text-sm italic">Belum ada pemasukan.</p>
                            ) : (
                                categoryStats.filter(c => c.inc > 0).sort((a, b) => b.inc - a.inc).map(c => {
                                    const percent = (c.inc / totalIncome) * 100;
                                    return (
                                        <div key={c.cat} className="group">
                                            <div className="flex justify-between text-sm font-bold mb-1">
                                                <span>{c.cat}</span>
                                                <span className="text-[#457B9D]">{formatIDR(c.inc)}</span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-100 border border-black relative">
                                                <div
                                                    className="h-full bg-[#457B9D]"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-[10px] font-mono text-gray-500 mt-1">
                                                {percent.toFixed(1)}% of Total
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </Card>
                </div>

                {/* Full List */}
                <div className="border-2 border-black bg-white">
                    <div className="bg-black text-white p-3 font-bold uppercase flex justify-between">
                        <span>Riwayat Lengkap</span>
                        <span>{transactions.length} items</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex justify-between p-2 border-b border-gray-200 hover:bg-gray-50 text-sm font-mono">
                                <span className="w-24 text-gray-500">{tx.date}</span>
                                <span className="flex-1 font-bold truncate pr-2">{tx.description || tx.category}</span>
                                <span className={tx.type === 'Income' ? 'text-blue-600' : 'text-red-600'}>
                                    {formatIDR(tx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderBudgetPage = () => (
        <div className="space-y-6">
            <div className="bg-[#F9C74F] p-6 border-2 border-black shadow-[6px_6px_0px_0px_#E63946] mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black uppercase text-[#1D3557]">Budget Planner</h2>
                    <p className="text-sm font-bold opacity-80">Track monthly spending limits</p>
                </div>
                <BauhausButton onClick={() => setIsBudgetManagerOpen(true)} className="flex items-center gap-2">
                    <SettingsIcon size={16} /> Manage Limits
                </BauhausButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCategories.filter(c => c.type === 'Expense').map(cat => {
                    // Calculate spent for this category in current month
                    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                    const spent = transactions
                        .filter(t => t.category === cat.name && t.type === 'Expense' && t.date.startsWith(currentMonth))
                        .reduce((acc, curr) => acc + curr.amount, 0);

                    const limit = budgets[cat.name] || 0;

                    // Skip showing if no limit set and no spending (optional, but cleaner)
                    if (limit === 0 && spent === 0) return null;

                    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

                    let barColor = COLORS.blue;
                    if (percentage >= 75) barColor = COLORS.yellow;
                    if (percentage > 100) barColor = COLORS.red;

                    return (
                        <div key={cat.id} className="bg-white border-2 border-black p-4 relative overflow-hidden group hover:shadow-[4px_4px_0px_0px_#1D3557] transition-all">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-black text-lg uppercase flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: cat.color }}></div>
                                    {cat.name}
                                </h3>
                                <div className="text-xs font-bold bg-black text-white px-2 py-1">
                                    {limit > 0 ? `${Math.round(percentage)}%` : 'NO LIMIT'}
                                </div>
                            </div>

                            <div className="h-4 w-full border-2 border-black bg-gray-100 relative mt-2 mb-2">
                                <div
                                    className="h-full border-r-2 border-black transition-all duration-500"
                                    style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}
                                />
                            </div>

                            <div className="flex justify-between text-xs font-mono font-bold">
                                <span className={spent > limit && limit > 0 ? "text-red-500" : "text-gray-700"}>
                                    {formatIDR(spent)}
                                </span>
                                <span className="text-gray-500">
                                    Limit: {limit > 0 ? formatIDR(limit) : '∞'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {Object.keys(budgets).length === 0 && (
                <div className="text-center p-10 border-2 border-dashed border-black opacity-50 font-mono">
                    No budgets set. Click "Manage Limits" to start.
                </div>
            )}
        </div>
    );

    const renderWalletPage = () => (
        <div className="space-y-6">
            <Card title="My Wallets" color={COLORS.green}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userWallets.map(wallet => (
                        <div key={wallet.id} className="p-4 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-lg uppercase truncate">{wallet.name}</h3>
                                <span className="text-xs font-bold px-2 py-1 border-2 border-black bg-gray-100 uppercase">{wallet.type}</span>
                            </div>
                            <p className="text-2xl font-black mb-4">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(wallet.balance)}
                            </p>
                            <div className="absolute top-0 right-0 w-8 h-8 bg-[#34A853] border-l-2 border-b-2 border-black"></div>
                        </div>
                    ))}

                    {/* Add Wallet Button Placeholder */}
                    <button
                        onClick={() => setIsWalletManagerOpen(true)}
                        className="p-4 border-4 border-black border-dashed flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-black hover:bg-gray-50 hover:border-solid transition-all min-h-[140px]"
                    >
                        <Plus size={32} />
                        <span className="font-black uppercase">Add New Wallet</span>
                    </button>
                </div>
            </Card>
        </div>
    );

    const renderDocsPage = () => (
        <div className="space-y-8 pb-12">
            <div className="bg-[#457B9D] text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#1D3557] relative overflow-hidden">
                <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 rounded-full"></div>
                <h2 className="text-3xl font-black uppercase mb-1 relative z-10">Fitracker Docs</h2>
                <p className="text-sm font-bold opacity-90 font-mono relative z-10">BUATAN AZERO FOR YOU</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* GETTING STARTED */}
                <Card title="Quick Start" color={COLORS.yellow}>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-black text-white flex items-center justify-center font-black">1</div>
                            <p className="text-sm"><b>Setup Wallets:</b> Go to the <b>Wallets</b> tab and add your Bank, E-Wallet, or Cash accounts.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-black text-white flex items-center justify-center font-black">2</div>
                            <p className="text-sm"><b>Log Transactions:</b> Use the <b>Input</b> tab to record your daily income and expenses.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-black text-white flex items-center justify-center font-black">3</div>
                            <p className="text-sm"><b>Set Budgets:</b> Manage your spending limits in the <b>Budgets</b> section to stay on track.</p>
                        </div>
                    </div>
                </Card>

                {/* GOPAY SYNC */}
                <Card title="GoPay Auto-Sync" color={COLORS.blue}>
                    <div className="space-y-4">
                        <p className="text-sm">Fitracker uses "Bring Your Own Key" (BYOK) for security. You'll need a <b>Google Client ID</b> and <b>Secret</b>.</p>
                        <div className="p-3 bg-blue-50 border-2 border-black text-xs font-mono">
                            <p className="font-bold mb-1">Requirements:</p>
                            <ul className="list-disc ml-4 space-y-1">
                                <li>Google Cloud Project</li>
                                <li>Gmail API Enabled</li>
                                <li>OAuth Redirect URI set to your app URL</li>
                            </ul>
                        </div>
                        <BauhausButton onClick={() => setIsGmailConnectOpen(true)} className="w-full text-xs">
                            Setup Sync Now
                        </BauhausButton>
                    </div>
                </Card>

                {/* DATA SECURITY */}
                <Card title="Data Privacy" color={COLORS.green}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-600" />
                            <p className="text-sm font-bold">End-to-End Control</p>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Your financial data is stored securely on Supabase. We do not have access to your bank accounts; we only parse emails you explicitly authorize.
                        </p>
                        <div className="flex items-center gap-3">
                            <Download size={20} className="text-blue-600" />
                            <p className="text-sm font-bold">Export Anytime</p>
                        </div>
                        <p className="text-xs text-gray-600">
                            You can export your entire transaction history as JSON in the <b>Settings</b> page.
                        </p>
                    </div>
                </Card>

                {/* FAQ */}
                <Card title="Frequently Asked" color="#F1FAEE">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-black text-xs uppercase mb-1">How often does sync run?</h4>
                            <p className="text-xs text-gray-500">Sync runs automatically every 15 minutes if configured correctly.</p>
                        </div>
                        <div>
                            <h4 className="font-black text-xs uppercase mb-1">Can I use multiple currencies?</h4>
                            <p className="text-xs text-gray-500">Currently, we support IDR, USD, and EUR. Change this in Settings.</p>
                        </div>
                        <div>
                            <h4 className="font-black text-xs uppercase mb-1">Is this open source?</h4>
                            <p className="text-xs text-gray-500">Yes, Fitracker is built for the community using React and Supabase.</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* VERSION INFO */}
            <div className="text-center p-8 bg-gray-50 border-2 border-dashed border-black">
                <p className="text-xs font-mono text-gray-400">FITRACKER v1.1.0-bauhaus • BUATAN AZERO</p>
                <p className="text-[10px] text-gray-400 mt-1">Smarter Financial Tracking for Your Freedom</p>
            </div>
        </div>
    );

    const handleUpdateProfile = async () => {
        if (!newUsername.trim()) {
            alert("Username cannot be empty");
            return;
        }

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

    const renderSettingsPage = () => (
        <div className="space-y-6">
            <div className="bg-[#1D3557] text-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_#E63946] mb-8">
                <h2 className="text-2xl font-black uppercase">Pengaturan</h2>
                <p className="text-sm font-bold opacity-80 font-mono">APP CONFIG & DATA MANAGEMENT</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PROFILE CARD */}
                <Card title="Profil Pengguna" className="h-full">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <User size={20} /> User Profile
                            </h3>
                            <div className="flex items-center justify-between p-4 border-2 border-black rounded-lg bg-gray-50">
                                <div className="flex-1 mr-4">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Username</p>
                                    {isEditingProfile ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                className="border-2 border-black p-1 px-2 text-sm font-bold w-full bg-white"
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-xl font-black text-[#38bdf8]">{appSettings.username}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditingProfile ? (
                                        <>
                                            <BauhausButton onClick={handleUpdateProfile} className="bg-[#34A853] text-white p-2">
                                                <CheckCircle size={16} />
                                            </BauhausButton>
                                            <BauhausButton onClick={() => setIsEditingProfile(false)} className="bg-[#E63946] text-white p-2">
                                                <X size={16} />
                                            </BauhausButton>
                                        </>
                                    ) : (
                                        <BauhausButton onClick={() => { setNewUsername(appSettings.username); setIsEditingProfile(true); }} className="bg-[#F9C74F] text-black">
                                            Edit
                                        </BauhausButton>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold text-sm mb-1 uppercase">Mata Uang (Simbol)</label>
                            <select
                                className="w-full p-3 border-2 border-black bg-white"
                                value={appSettings.currency}
                                onChange={e => setAppSettings({ ...appSettings, currency: e.target.value })}
                            >
                                <option value="IDR">IDR (Rp)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* DATA MANAGEMENT CARD */}
                <Card title="Backup & Restore" className="h-full" color="#F1FAEE">
                    <div className="flex flex-col gap-4 h-full justify-center">
                        <BauhausButton onClick={handleExportData} className="flex justify-center items-center gap-2">
                            <Download size={18} /> Export Data (JSON)
                        </BauhausButton>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportData}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <BauhausButton variant="warning" className="w-full flex justify-center items-center gap-2">
                                <Upload size={18} /> Import Data (JSON)
                            </BauhausButton>
                        </div>
                    </div>
                </Card>

                {/* DANGER ZONE */}
                <div className="md:col-span-2">
                    <div className="border-2 border-red-500 bg-red-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 text-red-600">
                            <AlertTriangle size={32} />
                            <div>
                                <h3 className="font-black text-lg uppercase">Danger Zone</h3>
                                <p className="text-sm">Hapus data permanen untuk user <b>{currentUser}</b>.</p>
                            </div>
                        </div>
                        <BauhausButton variant="danger" onClick={handleResetData} className="flex justify-center items-center gap-2">
                            <Trash2 size={18} /> Reset My Data
                        </BauhausButton>
                    </div>
                </div>

                {/* INTEGRATIONS CARD */}
                <div className="md:col-span-2">
                    <Card title="Integrations & Sync" color={integrationStatus?.is_active ? "#34A853" : "#4285F4"}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-1 bg-white rounded-full overflow-hidden w-12 h-12 flex-shrink-0 flex items-center justify-center">
                                    {integrationStatus?.picture ? (
                                        <img src={integrationStatus.picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png" alt="Gmail" className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg uppercase truncate max-w-[200px]">
                                        {integrationStatus?.email
                                            ? integrationStatus.email.split('@')[0]
                                            : "GoPay Auto-Sync"}
                                    </h3>
                                    <p className="text-xs opacity-90">
                                        {integrationStatus?.last_synced_at
                                            ? `Last synced: ${new Date(integrationStatus.last_synced_at).toLocaleTimeString()} (${new Date(integrationStatus.last_synced_at).toLocaleDateString()})`
                                            : "Otomatis catat transaksi dari email struk GoJEK."}
                                    </p>
                                </div>
                            </div>
                            <BauhausButton onClick={() => setIsGmailConnectOpen(true)} className={`flex justify-center items-center gap-2 bg-white ${integrationStatus?.is_active ? 'text-[#34A853]' : 'text-[#4285F4]'} hover:bg-gray-100 border-white`}>
                                <SettingsIcon size={18} /> {integrationStatus?.is_active ? "Re-Configure" : "Connect"}
                            </BauhausButton>
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-2 text-center text-xs text-gray-400 mt-8 mb-4">
                    <p>Fitracker v1.1 • Created with ❤️ by Azero</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F1FAEE] text-[#1D3557] font-sans selection:bg-[#F9C74F] selection:text-black flex">
            {syncLoading && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center text-white">
                    <div className="w-16 h-16 border-4 border-[#F9C74F] border-t-white rounded-full animate-spin mb-4"></div>
                    <h2 className="text-xl font-black uppercase tracking-widest animate-pulse">Connecting to Gmail...</h2>
                </div>
            )}

            {/* SIDEBAR */}
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

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>

                {/* MOBILE HEADER (Only visible on mobile) */}
                <div className="md:hidden bg-white border-b-4 border-black p-4 flex justify-between items-center sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 border-2 border-black hover:bg-gray-100">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl font-black italic text-[#38bdf8]">FITRACKER</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                    {/* TOP DECORATION */}
                    <BauhausDecor />


                    {/* MAIN CONTENT AREA */}
                    <main className="relative z-10 max-w-4xl mx-auto p-6">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'input' && renderInputPage()}
                            {activeTab === 'stats' && renderStatsPage()}
                            {activeTab === 'budget' && renderBudgetPage()}
                            {activeTab === 'wallet' && renderWalletPage()}
                            {activeTab === 'settings' && renderSettingsPage()}
                            {activeTab === 'docs' && renderDocsPage()}
                        </div>
                    </main>

                    {/* FOOTER DECORATION */}
                    <div className="fixed bottom-0 left-0 w-full h-2 bg-[#E63946] z-50">
                        <div className="absolute right-10 bottom-0 w-20 h-4 bg-[#1D3557]" />
                        <div className="absolute right-32 bottom-0 w-10 h-6 bg-[#F9C74F]" />
                    </div>

                    <CategoryManager
                        isOpen={isCategoryManagerOpen}
                        onClose={() => setIsCategoryManagerOpen(false)}
                        userID={userID}
                        onCategoriesChange={() => fetchCategories(userID)}
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
        </div>
    );
};

export default Dashboard;
