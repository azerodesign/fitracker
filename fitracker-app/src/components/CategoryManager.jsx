import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Tag, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { supabase } from '../utils/supabaseClient';

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

        if (categories.some(c => c.name.toLowerCase() === newCategory.name.toLowerCase() && c.type === newCategory.type)) {
            setError('Category already exists.');
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
            onCategoriesChange();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category? Old transactions might lose their category tag.')) return;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/40 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-bg-surface rounded-3xl shadow-soft flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border border-border-subtle">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border-subtle">
                    <h3 className="font-bold text-xl text-text-base flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                            <Tag size={24} />
                        </div>
                        Manage Categories
                    </h3>
                    <button onClick={onClose} className="p-2 text-text-dim hover:text-text-base hover:bg-surface-hover rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                    {/* Add Form */}
                    <form onSubmit={handleAdd} className="mb-8 bg-bg-main p-5 rounded-3xl border border-border-subtle">
                        <h4 className="font-bold text-xs uppercase text-text-dim mb-4 tracking-wider ml-1">Add New Category</h4>
                        {error && (
                            <div className="mb-4 bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 p-3 rounded-2xl text-xs font-bold flex gap-2 items-center">
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}
                        <div className="flex gap-4 mb-4">
                            <div className="relative min-w-[120px]">
                                <select
                                    className="bg-bg-surface border-transparent text-text-base text-sm font-bold rounded-full focus:ring-2 focus:ring-primary-500 outline-none px-4 py-3 w-full shadow-sm appearance-none cursor-pointer"
                                    value={newCategory.type}
                                    onChange={e => setNewCategory({ ...newCategory, type: e.target.value })}
                                >
                                    <option value="Expense">Expense</option>
                                    <option value="Income">Income</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-dim">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="bg-bg-surface border-transparent text-text-base text-sm font-bold rounded-full focus:ring-2 focus:ring-primary-500 outline-none px-4 py-3 w-full shadow-sm placeholder:font-normal placeholder:text-text-dim"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                maxLength={20}
                            />
                        </div>
                        <Button type="submit" size="md" className="w-full rounded-full shadow-soft-hover font-bold" icon={Plus}>
                            Add Category
                        </Button>
                    </form>

                    {/* List */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-xs uppercase text-text-dim mb-3 tracking-wider ml-1">Categories ({categories.length})</h4>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"></div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-10 bg-bg-main rounded-3xl border-dashed border-2 border-border-subtle">
                                <p className="text-text-dim text-sm font-medium">No custom categories yet.</p>
                            </div>
                        ) : (
                            categories.map(cat => (
                                <div key={cat.id} className="flex justify-between items-center p-4 bg-bg-surface border border-transparent shadow-sm rounded-2xl hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-inner
                                            ${cat.type === 'Income'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}
                                        `}>
                                            {cat.type === 'Income' ? 'INC' : 'EXP'}
                                        </span>
                                        <span className="font-bold text-text-base text-sm">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="text-text-dim hover:text-rose-600 dark:hover:text-rose-400 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
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

export default CategoryManager;
