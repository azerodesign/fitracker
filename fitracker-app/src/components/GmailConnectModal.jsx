import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Lock, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import BauhausButton from './BauhausButton';
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
            // Save initial credentials
            const { error } = await supabase
                .from('integrations')
                .upsert({
                    user_id: userID,
                    provider: 'gmail',
                    client_id: credentials.clientId,
                    client_secret: credentials.clientSecret,
                    is_active: false // Not active until token received
                }, { onConflict: 'user_id, provider' });

            if (error) throw error;

            // Generate Auth URL
            // We use standard Google OAuth URL construction
            // Redirect URI must be: [Current Origin]/auth/callback ?? 
            // OR simply a manual code copy-paste if redirect is hard to handle in SPA without backend?
            // Let's try redirect to localhost for now (Development) or Current URL

            const redirectUri = window.location.origin; // e.g., http://localhost:5173
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white w-full max-w-lg border-4 border-black shadow-[8px_8px_0px_0px_#4285F4] relative flex flex-col"
                    >
                        <div className="bg-[#4285F4] p-4 flex justify-between items-center border-b-4 border-black text-white">
                            <h2 className="text-xl font-black uppercase flex items-center gap-2">
                                <Key className="text-white" /> Connect Gmail
                            </h2>
                            <button onClick={onClose}><X size={24} /></button>
                        </div>

                        <div className="p-6 bg-[#F1FAEE]">
                            {step === 1 ? (
                                <form onSubmit={handleGenerateLink} className="space-y-4">
                                    <div className="bg-yellow-100 border-2 border-yellow-500 p-3 text-xs font-mono mb-4 text-yellow-800">
                                        <AlertTriangle size={16} className="inline mr-1 mb-1" />
                                        <strong>Private Server Mode:</strong> You must provide your own Google Cloud credentials.
                                        Ensure Redirect URI <u>{window.location.origin}</u> is added in Google Console.
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Client ID</label>
                                        <input
                                            type="text"
                                            className="w-full border-2 border-black p-2 font-mono text-xs focus:ring-2 focus:ring-[#4285F4]"
                                            value={credentials.clientId}
                                            onChange={e => setCredentials({ ...credentials, clientId: e.target.value })}
                                            placeholder="xxx.apps.googleusercontent.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Client Secret</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                className="w-full border-2 border-black p-2 font-mono text-xs focus:ring-2 focus:ring-[#4285F4]"
                                                value={credentials.clientSecret}
                                                onChange={e => setCredentials({ ...credentials, clientSecret: e.target.value })}
                                                required
                                            />
                                            <Lock size={14} className="absolute right-3 top-3 text-gray-400" />
                                        </div>
                                    </div>

                                    <BauhausButton disabled={loading} type="submit" className="w-full flex justify-center mt-4">
                                        {loading ? "Saving..." : "Save & Generate Link"}
                                    </BauhausButton>
                                </form>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
                                        <Check size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="font-bold text-lg">Keys Saved!</h3>
                                    <p className="text-sm text-gray-600">Click below to authorize fitracker to access your Gmail.</p>

                                    <a
                                        href={authUrl}
                                        className="block w-full bg-[#4285F4] text-white font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={18} /> Authorize with Google
                                    </a>

                                    <p className="text-[10px] text-gray-400 mt-4">
                                        You will be redirected back here after login.
                                        Check URL for ?code=...
                                    </p>
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
