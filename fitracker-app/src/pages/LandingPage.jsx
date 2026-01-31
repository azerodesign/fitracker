import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import BauhausDecor from '../components/BauhausDecor';

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
    return (
        <div className="min-h-screen bg-[#F1FAEE] text-[#1D3557] font-sans selection:bg-[#F9C74F] selection:text-black flex flex-col relative overflow-hidden">
            <BauhausDecor />

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center p-6 border-b-4 border-black bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E63946] rounded-full border-2 border-black flex items-center justify-center text-white">
                        <div className="w-4 h-4 bg-[#F9C74F] transform rotate-45" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">FiTracker<br /><span className="text-[#457B9D]">Plan</span></h1>
                </div>
                <div className="hidden md:flex gap-4">
                    <button onClick={onLoginClick} className="font-bold hover:text-[#E63946]">LOGIN</button>
                    <button onClick={onRegisterClick} className="font-bold hover:text-[#E63946]">REGISTER</button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 py-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-block bg-[#F9C74F] border-2 border-black px-4 py-1 text-sm font-bold uppercase shadow-[4px_4px_0px_0px_#1D3557] mb-4">
                        Keuangan untuk yang Serius & Tenang
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight text-[#1D3557]">
                        Struktur.<br />
                        <span className="text-[#E63946] decoration-[#F9C74F] underline decoration-8 underline-offset-4">Esensi.</span><br />
                        Kendali.
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl mx-auto font-mono text-gray-600 leading-relaxed">
                        Aplikasi pencatat keuangan dengan filosofi Bauhaus.
                        Tanpa distraksi. Fokus pada fungsi.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onLoginClick}
                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1D3557] text-white font-bold uppercase text-lg tracking-wider border-2 border-black shadow-[8px_8px_0px_0px_#E63946] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#E63946] active:translate-y-[0px] active:shadow-[4px_4px_0px_0px_#E63946] transition-all"
                        >
                            <LogIn size={20} /> Login
                        </button>
                        <button
                            onClick={onRegisterClick}
                            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#1D3557] font-bold uppercase text-lg tracking-wider border-2 border-black shadow-[8px_8px_0px_0px_#457B9D] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#457B9D] active:translate-y-[0px] active:shadow-[4px_4px_0px_0px_#457B9D] transition-all"
                        >
                            <UserPlus size={20} /> Register
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#1D3557] text-white p-6 text-center border-t-4 border-black font-mono text-xs">
                <p>&copy; 2024 FITRACKER PLAN. DESIGNED FOR PRODUCTIVITY.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
