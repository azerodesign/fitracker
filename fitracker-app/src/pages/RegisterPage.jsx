import React, { useState } from 'react';
import { AlertTriangle, Lock, User } from 'lucide-react';

import { registerUser, loginWithGoogle } from '../utils/auth';
import Button from '../components/Button';

const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin, onBack }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.username || !formData.password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (formData.password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await registerUser(formData.username, formData.password);
        setLoading(false);

        if (result.success) {
            alert('Registration successful! Please login.');
            onRegisterSuccess();
        } else {
            setError(result.message);
        }
    };

    const handleGoogleLogin = async () => {
        await loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">

                <div className="text-center mb-8">
                    <img src="/logo-new.png" alt="Fitracker Logo" className="w-16 h-16 rounded-2xl shadow-soft mb-4 mx-auto" />
                    <h2 className="text-3xl font-black text-text-main tracking-tight">Create Account</h2>
                    <p className="text-secondary-500 dark:text-secondary-400 mt-2">Start your journey to financial freedom</p>
                </div>

                <div className="bg-surface rounded-3xl shadow-soft border-transparent p-10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border-transparent shadow-sm">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase text-secondary-400 mb-2 ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3.5 bg-app-bg border-transparent rounded-full text-base font-medium text-text-main focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all shadow-inner"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-secondary-400 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3.5 bg-app-bg border-transparent rounded-full text-base font-medium text-text-main focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all shadow-inner"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-secondary-400 mb-2 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3.5 bg-app-bg border-transparent rounded-full text-base font-medium text-text-main focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all shadow-inner"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full py-3.5 mt-2 text-base font-bold shadow-soft-hover" disabled={loading} size="lg">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="bg-surface px-3 text-text-muted font-bold">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleGoogleLogin}
                        className="w-full flex justify-center items-center gap-3 py-3.5 rounded-full bg-surface border border-border hover:bg-surface-hover shadow-sm"
                        type="button"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-text-main font-bold">Google</span>
                    </Button>
                </div>

                <p className="mt-8 text-center text-sm text-secondary-500 dark:text-secondary-400">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-bold text-primary-600 hover:text-primary-700 hover:underline">
                        Sign In
                    </button>
                    {' • '}
                    <button onClick={onBack} className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300">
                        Home
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
