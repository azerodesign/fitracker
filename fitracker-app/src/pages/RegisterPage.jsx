import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, UserPlus } from 'lucide-react';
import { registerUser, loginWithGoogle } from '../utils/auth';
import BauhausDecor from '../components/BauhausDecor';
import Card from '../components/Card';
import BauhausButton from '../components/BauhausButton';

const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin, onBack }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !confirmPassword) {
            setError('Mohon isi semua field.');
            return;
        }
        if (formData.password !== confirmPassword) {
            setError('Password tidak cocok.');
            return;
        }

        const result = await registerUser(formData.username, formData.password);
        if (result.success) {
            alert('Registrasi berhasil! Silakan login.');
            onRegisterSuccess();
        } else {
            setError(result.message);
        }
    };

    const handleGoogleLogin = async () => {
        await loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-[#F1FAEE] flex items-center justify-center p-4 relative overflow-hidden">
            <BauhausDecor />
            <div className="relative z-10 w-full max-w-md">
                <button onClick={onBack} className="mb-4 font-bold flex items-center gap-2 hover:underline">
                    <ArrowRight className="rotate-180" size={16} /> Kembali
                </button>
                <Card title="Register" color="#FFF">
                    {/* Decorative Header */}
                    <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#F9C74F] border-2 border-black rounded-full flex items-center justify-center z-20">
                        <UserPlus size={24} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 text-sm font-bold flex items-center gap-2">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <div>
                            <label className="block font-bold text-sm mb-1">USERNAME</label>
                            <input
                                type="text"
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-sm mb-1">PASSWORD</label>
                            <input
                                type="password"
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-sm mb-1">KONFIRMASI PASSWORD</label>
                            <input
                                type="password"
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F9C74F]"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <BauhausButton type="submit" variant="warning" className="w-full flex justify-center mt-6">
                            Buat Akun
                        </BauhausButton>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <div className="mb-4">
                            <BauhausButton onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2" variant="warning">
                                <span>G</span> Sign up with Google
                            </BauhausButton>
                        </div>
                        <p>Sudah punya akun?</p>
                        <button onClick={onSwitchToLogin} className="font-bold text-[#457B9D] hover:underline uppercase tracking-wide">
                            Login di sini
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
