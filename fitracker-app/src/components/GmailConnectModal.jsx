import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Lock, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import Button from './Button';
import { supabase } from '../utils/supabaseClient';

const GmailConnectModal = ({ isOpen, onClose, userID }) => {
    const [credentials, setCredentials] = useState({ clientId: '', clientSecret: '' });
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input Keys, 2: Auth Link
    const [authUrl, setAuthUrl] = useState('');

    const handleGenerateLink = async (e) => {
        e.preventDefault();
        if (!credentials.clientId || !credentials.clientSecret) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('integrations')
                .upsert({
                    user_id: userID,
                    provider: 'gmail',
                    client_id: credentials.clientId,
                    client_secret: credentials.clientSecret,
                    is_active: false
                }, { onConflict: 'user_id, provider' });

            if (error) throw error;

            const redirectUri = window.location.origin;
            const scope = 'https://www.googleapis.com/auth/gmail.readonly';
            const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${credentials.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

            setAuthUrl(url);
            setStep(2);
        } catch (err) {
            alert("Error saving keys: " + err.message);
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
                        className="bg-surface w-full max-w-lg rounded-3xl shadow-soft relative flex flex-col overflow-hidden border border-border"
                    >
                        {/* Header */}
                        <div className="bg-surface p-6 flex justify-between items-center border-b border-border">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-text-main">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
                                    <Key size={24} />
                                </div>
                                Connect Gmail
                            </h2>
                            <button onClick={onClose} className="text-text-muted hover:text-text-main hover:bg-surface-hover p-2 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-6">
                            {step === 1 ? (
                                <form onSubmit={handleGenerateLink} className="space-y-6">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-5 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                                        <div className="flex items-center gap-2 mb-2 font-bold text-amber-700 dark:text-amber-300 text-sm">
                                            <AlertTriangle size={18} /> Private Cloud Mode
                                        </div>
                                        <p className="leading-relaxed">You must provide your own Google Cloud credentials.</p>
                                        <p className="mt-2 text-amber-800/80 dark:text-amber-300/80">Add redirect URI: <code className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-md text-amber-900 dark:text-amber-100 font-mono font-bold">{window.location.origin}</code></p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-text-muted mb-2 ml-1">Client ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-app-bg border-transparent rounded-full p-4 font-mono text-xs focus:ring-2 focus:ring-primary-500 focus:bg-surface outline-none transition-all shadow-inner font-bold text-text-main"
                                            value={credentials.clientId}
                                            onChange={e => setCredentials({ ...credentials, clientId: e.target.value })}
                                            placeholder="xxx.apps.googleusercontent.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-text-muted mb-2 ml-1">Client Secret</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                className="w-full bg-app-bg border-transparent rounded-full p-4 font-mono text-xs focus:ring-2 focus:ring-primary-500 focus:bg-surface outline-none transition-all shadow-inner font-bold text-text-main"
                                                value={credentials.clientSecret}
                                                onChange={e => setCredentials({ ...credentials, clientSecret: e.target.value })}
                                                required
                                            />
                                            <Lock size={16} className="absolute right-4 top-4 text-text-muted" />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button disabled={loading} type="submit" className="w-full rounded-full shadow-soft-hover h-12 font-bold text-base">
                                            {loading ? "Saving..." : "Save & Generate Link"}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center space-y-8 py-4">
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto border-8 border-emerald-50 dark:border-emerald-900/10 text-emerald-600 dark:text-emerald-400 shadow-soft">
                                        <Check size={40} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl text-text-main mb-2">Keys Saved!</h3>
                                        <p className="text-text-muted">Authorize Fitracker to read your transaction emails.</p>
                                    </div>

                                    <a
                                        href={authUrl}
                                        className="block w-full bg-primary-600 text-white font-bold py-4 rounded-full shadow-soft-hover hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ExternalLink size={20} /> Authorize with Google
                                    </a>

                                    <div className="text-xs text-text-muted bg-app-bg p-3 rounded-xl inline-block">
                                        Redirects to: <span className="font-mono font-bold text-text-main">{window.location.origin}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GmailConnectModal;
