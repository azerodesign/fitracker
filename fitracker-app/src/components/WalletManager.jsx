import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Wallet as WalletIcon, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { supabase } from '../utils/supabaseClient';

const WalletManager = ({ isOpen, onClose, userID, onWalletsChange }) => {
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newWallet, setNewWallet] = useState({ name: '', type: 'Cash', color: '#000000', balance: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && userID) {
            fetchWallets();
        }
    }, [isOpen, userID]);

    const fetchWallets = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', userID)
            .order('name');

        if (error) console.error("Error fetching wallets:", error);
        else setWallets(data || []);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newWallet.name.trim()) return;

        if (wallets.some(w => w.name.toLowerCase() === newWallet.name.toLowerCase())) {
            setError('Wallet name already exists.');
            return;
        }

        const toAdd = {
            user_id: userID,
            name: newWallet.name,
            type: newWallet.type,
            balance: parseFloat(newWallet.balance) || 0,
            color: newWallet.color
        };

        const { data, error } = await supabase.from('wallets').insert([toAdd]).select();

        if (error) {
            setError(error.message);
        } else {
            setWallets([...wallets, data[0]]);
            setNewWallet({ name: '', type: 'Cash', color: '#000000', balance: 0 });
            setError('');
            onWalletsChange();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this wallet? Transactions related to it usually remain but lose wallet tag.')) return;

        const { error } = await supabase.from('wallets').delete().eq('id', id);
        if (error) {
            alert(error.message);
        } else {
            setWallets(wallets.filter(w => w.id !== id));
            onWalletsChange();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-secondary-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-surface rounded-3xl shadow-soft flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <h3 className="font-bold text-xl text-text-main flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                            <WalletIcon size={24} />
                        </div>
                        Manage Wallets
                    </h3>
                    <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                    {/* Add Form */}
                    <form onSubmit={handleAdd} className="mb-8 bg-app-bg p-5 rounded-3xl border border-border">
                        <h4 className="font-bold text-xs uppercase text-text-muted mb-4 tracking-wider ml-1">Add New Wallet</h4>
                        {error && (
                            <div className="mb-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 p-3 rounded-2xl text-xs font-bold flex gap-2 items-center">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <select
                                    className="bg-surface border-transparent text-text-main text-sm font-bold rounded-full focus:ring-2 focus:ring-primary-500 outline-none px-4 py-3 w-full shadow-sm appearance-none cursor-pointer"
                                    value={newWallet.type}
                                    onChange={e => setNewWallet({ ...newWallet, type: e.target.value })}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Bank">Bank</option>
                                    <option value="E-Wallet">E-Wallet</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="bg-surface border-transparent text-text-main text-sm font-bold rounded-full focus:ring-2 focus:ring-primary-500 outline-none px-4 py-3 w-full shadow-sm placeholder:font-normal"
                                placeholder="Wallet Name"
                                value={newWallet.name}
                                onChange={e => setNewWallet({ ...newWallet, name: e.target.value })}
                                maxLength={20}
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block text-[10px] font-bold uppercase text-text-muted mb-2 ml-1">Starting Balance</label>
                            <input
                                type="number"
                                className="bg-surface border-transparent text-text-main text-lg font-mono font-bold rounded-full focus:ring-2 focus:ring-primary-500 outline-none px-5 py-3 w-full shadow-sm"
                                placeholder="0"
                                value={newWallet.balance}
                                onChange={e => setNewWallet({ ...newWallet, balance: e.target.value })}
                            />
                        </div>

                        <Button type="submit" size="md" className="w-full rounded-full shadow-soft-hover font-bold" icon={Plus}>
                            Add Wallet
                        </Button>
                    </form>

                    {/* List */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase text-text-muted mb-3 tracking-wider ml-1">My Wallets ({wallets.length})</h4>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
                            </div>
                        ) : wallets.length === 0 ? (
                            <div className="text-center py-10 bg-app-bg rounded-3xl border-dashed border-2 border-border">
                                <p className="text-text-muted text-sm font-medium">No wallets found.</p>
                            </div>
                        ) : (
                            wallets.map(wallet => (
                                <div key={wallet.id} className="flex justify-between items-center p-4 bg-surface border border-transparent shadow-sm rounded-2xl hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black shadow-inner
                                            ${wallet.type === 'Cash'
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                : wallet.type === 'Bank'
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'}
                                        `}>
                                            {wallet.type[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-main">{wallet.name}</p>
                                            <p className="text-xs font-mono text-text-muted font-medium">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(wallet.balance)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(wallet.id)}
                                        className="text-text-muted hover:text-rose-600 dark:hover:text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletManager;
