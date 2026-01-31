import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Wallet as WalletIcon, Check, AlertTriangle } from 'lucide-react';
import Card from './Card';
import BauhausButton from './BauhausButton';
import { supabase } from '../utils/supabaseClient';
import { COLORS } from '../constants';

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

        // Check duplicate
        if (wallets.some(w => w.name.toLowerCase() === newWallet.name.toLowerCase())) {
            setError('Nama dompet sudah ada.');
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
            onWalletsChange(); // Notify parent to refresh
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus dompet ini? Transaksi yang terkait mungkin akan kehilangan data dompet.')) return;

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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg relative bg-white border-2 border-black shadow-[8px_8px_0px_0px_#1D3557] max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b-2 border-black bg-[#457B9D] text-white">
                    <h3 className="font-black text-xl uppercase flex items-center gap-2">
                        <WalletIcon size={20} /> Manage Wallets
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Add Form */}
                    <form onSubmit={handleAdd} className="mb-8 p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                        <h4 className="font-bold text-sm uppercase mb-3 text-gray-500">Buat Dompet Baru</h4>
                        {error && (
                            <div className="mb-3 bg-red-100 text-red-600 p-2 text-xs font-bold flex gap-1">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}
                        <div className="flex gap-2 mb-3">
                            <select
                                className="border-2 border-black p-2 text-sm font-bold w-1/4"
                                value={newWallet.type}
                                onChange={e => setNewWallet({ ...newWallet, type: e.target.value })}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Bank">Bank</option>
                                <option value="E-Wallet">E-Wallet</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="text"
                                className="flex-1 border-2 border-black p-2 text-sm focus:outline-none focus:bg-[#FFF8E1]"
                                placeholder="Nama (e.g. GoPay)"
                                value={newWallet.name}
                                onChange={e => setNewWallet({ ...newWallet, name: e.target.value })}
                                maxLength={20}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Saldo Awal</label>
                            <input
                                type="number"
                                className="w-full border-2 border-black p-2 text-sm focus:outline-none focus:bg-[#FFF8E1]"
                                placeholder="0"
                                value={newWallet.balance}
                                onChange={e => setNewWallet({ ...newWallet, balance: e.target.value })}
                            />
                        </div>

                        <BauhausButton type="submit" size="sm" className="w-full flex justify-center items-center gap-2">
                            <Plus size={16} /> Tambah Dompet
                        </BauhausButton>
                    </form>

                    {/* List */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-sm uppercase mb-2 text-gray-500">Daftar Dompet ({wallets.length})</h4>
                        {loading ? (
                            <p className="text-center py-4 text-gray-400 font-mono">Loading...</p>
                        ) : wallets.length === 0 ? (
                            <p className="text-center py-4 text-gray-400 font-mono text-xs">Belum ada dompet.</p>
                        ) : (
                            wallets.map(wallet => (
                                <div key={wallet.id} className="flex justify-between items-center p-3 border border-black hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 flex items-center justify-center border border-black text-xs font-bold
                                            ${wallet.type === 'Cash' ? 'bg-[#F9C74F]' : wallet.type === 'Bank' ? 'bg-[#E63946] text-white' : 'bg-[#457B9D] text-white'}
                                        `}>
                                            {wallet.type[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{wallet.name}</p>
                                            <p className="text-xs text-gray-500">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(wallet.balance)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(wallet.id)}
                                        className="text-gray-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
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
