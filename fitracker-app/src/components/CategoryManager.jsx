import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, Check, AlertTriangle } from 'lucide-react';
import Card from './Card';
import BauhausButton from './BauhausButton';
import { supabase } from '../utils/supabaseClient';
import { COLORS } from '../constants';

const CategoryManager = ({ isOpen, onClose, userID, onCategoriesChange }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', type: 'Expense', color: '#000000' });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && userID) {
            fetchCategories();
        }
    }, [isOpen, userID]);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userID)
            .order('name');

        if (error) console.error("Error fetching categories:", error);
        else setCategories(data || []);
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCategory.name.trim()) return;

        // Check duplicate
        if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase() && c.type === newCategory.type)) {
            setError('Kategori sudah ada.');
            return;
        }

        const toAdd = {
            user_id: userID,
            name: newCategory.name,
            type: newCategory.type,
            color: newCategory.color
        };

        const { data, error } = await supabase.from('categories').insert([toAdd]).select();

        if (error) {
            setError(error.message);
        } else {
            setCategories([...categories, data[0]]);
            setNewCategory({ name: '', type: 'Expense', color: '#000000' });
            setError('');
            onCategoriesChange(); // Notify parent to refresh
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus kategori ini? Transaksi lama tidak akan terhapus tapi kategori mungkin hilang dari filter.')) return;

        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            alert(error.message);
        } else {
            setCategories(categories.filter(c => c.id !== id));
            onCategoriesChange();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg relative bg-white border-2 border-black shadow-[8px_8px_0px_0px_#E63946] max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b-2 border-black bg-[#F9C74F]">
                    <h3 className="font-black text-xl uppercase flex items-center gap-2">
                        <Tag className="fill-black" size={20} /> Manage Category
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Add Form */}
                    <form onSubmit={handleAdd} className="mb-8 p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                        <h4 className="font-bold text-sm uppercase mb-3 text-gray-500">Buat Kategori Baru</h4>
                        {error && (
                            <div className="mb-3 bg-red-100 text-red-600 p-2 text-xs font-bold flex gap-1">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}
                        <div className="flex gap-2 mb-3">
                            <select
                                className="border-2 border-black p-2 text-sm font-bold"
                                value={newCategory.type}
                                onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}
                            >
                                <option value="Expense">EXP</option>
                                <option value="Income">INC</option>
                            </select>
                            <input
                                type="text"
                                className="flex-1 border-2 border-black p-2 text-sm focus:outline-none focus:bg-[#FFF8E1]"
                                placeholder="Nama Kategori (contoh: Boba)"
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                maxLength={20}
                            />
                        </div>
                        <BauhausButton type="submit" size="sm" className="w-full flex justify-center items-center gap-2">
                            <Plus size={16} /> Tambah
                        </BauhausButton>
                    </form>

                    {/* List */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-sm uppercase mb-2 text-gray-500">Daftar Kategori ({categories.length})</h4>
                        {loading ? (
                            <p className="text-center py-4 text-gray-400 font-mono">Loading...</p>
                        ) : categories.length === 0 ? (
                            <p className="text-center py-4 text-gray-400 font-mono text-xs">Belum ada kategori custom.</p>
                        ) : (
                            categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center p-2 border border-black hover:bg-gray-50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-1 py-0.5 border border-black ${cat.type === 'Income' ? 'bg-[#457B9D] text-white' : 'bg-[#E63946] text-white'}`}>
                                            {cat.type === 'Income' ? 'INC' : 'EXP'}
                                        </span>
                                        <span className="font-bold text-sm">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
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

export default CategoryManager;
