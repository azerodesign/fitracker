import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Target, AlertTriangle } from 'lucide-react';
import BauhausButton from './BauhausButton';
import { supabase } from '../utils/supabaseClient';
import { COLORS } from '../constants';

const BudgetManager = ({ isOpen, onClose, userID, onBudgetsChange }) => {
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch categories and existing budgets when opening
    useEffect(() => {
        if (isOpen && userID) {
            fetchData();
        }
    }, [isOpen, userID]);

    const fetchData = async () => {
        setLoading(true);
        // 1. Fetch Expense Categories
        const { data: catData } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userID)
            .eq('type', 'Expense')
            .order('name');

        // 2. Fetch Existing Budgets
        const { data: budData } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userID);

        if (catData) setCategories(catData);

        // Map budgets by category name
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

    const handleSave = async (categoryName) => {
        const amount = budgets[categoryName];
        if (!amount || amount < 0) return;

        // Upsert logic (checking uniq constraint on user_id + category)
        const { error } = await supabase
            .from('budgets')
            .upsert({
                user_id: userID,
                category: categoryName,
                limit_amount: amount
            }, { onConflict: 'user_id, category' });

        if (!error) {
            // Optional: visual feedback
        } else {
            alert("Failed to save budget: " + error.message);
        }
    };

    const handleSaveAll = async () => {
        setLoading(true);
        const updates = categories.map(cat => ({
            user_id: userID,
            category: cat.name,
            limit_amount: budgets[cat.name] || 0
        }));

        // Filter out 0 or undefined if we want to clean up, but keeping 0 is fine for "no limit" or "0 limit"
        // Actually, let's only upsert ones that have values. 
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_#E63946] relative flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-[#1D3557] p-4 flex justify-between items-center border-b-4 border-black">
                            <h2 className="text-xl font-black text-[#F1FAEE] uppercase tracking-wider flex items-center gap-2">
                                <Target className="text-[#F9C74F]" /> Budget Limits
                            </h2>
                            <button onClick={onClose} className="text-white hover:text-[#F9C74F] transition-colors">
                                <X size={24} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto bg-[#F1FAEE]">
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center font-mono animate-pulse">Loading budgets...</div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="bg-white p-3 border-2 border-black shadow-sm flex items-center gap-3">
                                            <div className="w-3 h-full self-stretch" style={{ backgroundColor: cat.color }}></div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm uppercase">{cat.name}</div>
                                                <input
                                                    type="number"
                                                    placeholder="Set Limit (IDR)"
                                                    className="w-full mt-1 p-1 border-b-2 border-gray-300 focus:border-[#E63946] focus:outline-none font-mono text-sm"
                                                    value={budgets[cat.name] || ''}
                                                    onChange={(e) => handleLimitChange(cat.name, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t-4 border-black bg-white flex justify-end gap-2">
                            <BauhausButton onClick={onClose} className="bg-white text-black text-xs">
                                Cancel
                            </BauhausButton>
                            <BauhausButton onClick={handleSaveAll} className="text-xs flex items-center gap-2">
                                <Save size={14} /> Save Changes
                            </BauhausButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BudgetManager;
