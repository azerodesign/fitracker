import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, User, Lock } from 'lucide-react';
import { loginUser, loginWithGoogle } from '../utils/auth';
import BauhausDecor from '../components/BauhausDecor';
import Card from '../components/Card';
import BauhausButton from '../components/BauhausButton';

const LoginPage = ({ onLoginSuccess, onSwitchToRegister, onBack }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setError('Mohon isi semua field.');
            return;
        }

        // Show loading state if needed, or simple await
        const result = await loginUser(formData.username, formData.password);
        if (result.success) {
            onLoginSuccess(formData.username);
        } else {
            setError(result.message);
        }
    };

    const handleGoogleLogin = async () => {
        const result = await loginWithGoogle();
        if (result.error) {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1FAEE] flex items-center justify-center p-4 relative overflow-hidden">
            <BauhausDecor />
            <div className="relative z-10 w-full max-w-md">
                <button onClick={onBack} className="mb-4 font-bold flex items-center gap-2 hover:underline">
                    <ArrowRight className="rotate-180" size={16} /> Kembali
                </button>
                <Card title="Login" color="#FFF">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 text-sm font-bold flex items-center gap-2">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <div>
                            <label className="block font-bold text-sm mb-1">USERNAME</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full p-3 pl-10 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block font-bold text-sm mb-1">PASSWORD</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    className="w-full p-3 pl-10 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                        <BauhausButton type="submit" className="w-full flex justify-center mt-6">
                            Masuk
                        </BauhausButton>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <div className="mb-4">
                            <BauhausButton onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2" variant="warning">
                                <span>G</span> Sign in with Google
                            </BauhausButton>
                        </div>
                        <p>Belum punya akun?</p>
                        <button onClick={onSwitchToRegister} className="font-bold text-[#E63946] hover:underline uppercase tracking-wide">
                            Daftar Sekarang
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
