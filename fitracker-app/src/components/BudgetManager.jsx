import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Target } from 'lucide-react';
import Button from './Button';
import { supabase } from '../utils/supabaseClient';

const BudgetManager = ({ isOpen, onClose, userID, onBudgetsChange }) => {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userID) {
            fetchData();
        }
    }, [isOpen, userID]);

    const fetchData = async () => {
        setLoading(true);
        const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userID)
            .eq('type', 'Expense')
            .order('name');

        const { data: budData } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userID);

        if (catData) setCategories(catData);

        const budgetMap = {};
        if (budData) {
            budData.forEach(b => {
                budgetMap[b.category] = b.limit_amount;
            });
        }
        setBudgets(budgetMap);
        setLoading(false);
    };

    const handleLimitChange = (categoryName, value) => {
        setBudgets(prev => ({ ...prev, [categoryName]: value }));
    };

    const handleSaveAll = async () => {
        setLoading(true);
        const updates = categories.map(cat => ({
            user_id: userID,
            category: cat.name,
            limit_amount: budgets[cat.name] || 0
        }));

        const validUpdates = updates.filter(u => u.limit_amount !== undefined);

        const { error } = await supabase
            .from('budgets')
            .upsert(validUpdates, { onConflict: 'user_id, category' });

        if (!error) {
            onBudgetsChange();
            onClose();
        } else {
            alert("Error saving: " + error.message);
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-surface w-full max-w-md rounded-3xl shadow-soft relative flex flex-col max-h-[85vh] border border-border"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h3 className="font-bold text-xl text-text-main flex items-center gap-3">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                                    <Target size={24} />
                                </div>
                                Budget Limits
                            </h3>
                            <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-surface-hover rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-0 overflow-y-auto scrollbar-hide">
                            {loading ? (
                                <div className="p-10 text-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
                                    <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"></div>
                                    <p className="text-text-muted text-sm font-medium">Loading budgets...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="p-5 flex items-center gap-5 hover:bg-surface-hover transition-colors">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-soft shrink-0" style={{ backgroundColor: cat.color }}>
                                                {cat.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-base text-text-main mb-1">{cat.name}</div>
                                                <div className="relative">
                                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted text-xs font-bold">Rp</span>
                                                    <input
                                                        type="number"
                                                        placeholder="No Limit"
                                                        className="w-full pl-6 bg-transparent border-none p-0 text-lg font-mono font-bold text-text-main focus:ring-0 placeholder:text-text-muted placeholder:font-normal placeholder:text-sm transition-all"
                                                        value={budgets[cat.name] || ''}
                                                        onChange={(e) => handleLimitChange(cat.name, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-app-bg rounded-b-3xl flex justify-end gap-3">
                            <Button variant="ghost" onClick={onClose} size="md" className="rounded-full font-bold text-text-muted hover:text-text-main">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveAll} size="md" icon={Save} className="rounded-full shadow-soft-hover font-bold">
                                Save Changes
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BudgetManager;
