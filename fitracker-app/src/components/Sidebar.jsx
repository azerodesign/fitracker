import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    PieChart,
    Layers,
    Settings,
    LogOut,
    User,
    Wallet,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    BookOpen
} from 'lucide-react';
import BauhausButton from './BauhausButton';

const Sidebar = ({
    activeTab,
    setActiveTab,
    onLogout,
    isOpen,
    setIsOpen,
    currentUser,
    isCollapsed,
    setIsCollapsed
}) => {

    // Bauhaus Design Constants
    const borderColor = "border-black";
    const borderWidth = "border-4";
    const shadowStyle = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    const hoverShadow = "hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]";

    const navItems = [
        { id: 'input', label: 'Input', icon: LayoutDashboard, color: 'bg-[#F9C74F]' }, // Yellow
        { id: 'stats', label: 'Stats', icon: PieChart, color: 'bg-[#4285F4]' },      // Blue
        { id: 'budget', label: 'Budget', icon: Layers, color: 'bg-[#E63946]' },      // Red
        { id: 'wallet', label: 'Wallets', icon: Wallet, color: 'bg-[#34A853]' },     // Green
        { id: 'settings', label: 'Settings', icon: Settings, color: 'bg-black text-white' }, // Black
        { id: 'docs', label: 'Docs', icon: BookOpen, color: 'bg-[#FF9100]' },     // Orange
    ];

    const SidebarContent = ({ mobile = false }) => (
        <div className={`flex flex-col h-full bg-[#f0f0f0] border-r-4 border-black font-sans selection:bg-[#F9C74F] selection:text-black transition-all duration-300 ${isCollapsed && !mobile ? 'w-20' : 'w-72'}`}>
            {/* LOGO */}
            <div className={`p-4 md:p-6 bg-white border-b-4 border-black flex items-center justify-between ${isCollapsed && !mobile ? 'flex-col gap-4' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4285F4] rounded-full border-4 border-black flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 bg-[#E63946] transform rotate-45"></div>
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div>
                            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-[#38bdf8]">FiTracker</h1>
                            <p className="text-[10px] font-bold text-gray-500 mt-[-4px] tracking-widest uppercase">BY AZERO</p>
                        </div>
                    )}
                </div>
                {/* Mobile Close Button */}
                {mobile && (
                    <button onClick={() => setIsOpen(false)} className="md:hidden border-2 border-black p-1 hover:bg-gray-200">
                        <X size={24} />
                    </button>
                )}
                {/* Desktop Collapse Button */}
                {!mobile && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden md:flex items-center justify-center w-8 h-8 bg-white border-2 border-black hover:bg-gray-100 ${isCollapsed ? 'mt-2' : ''}`}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                )}
            </div>

            {/* USER INFO */}
            <div className={`p-4 md:p-6 border-b-4 border-black bg-white transition-all overflow-hidden`}>
                <div className={`flex items-center gap-3 ${isCollapsed && !mobile ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F9C74F] rounded-none border-4 border-black flex items-center justify-center transform hover:rotate-6 transition-transform shrink-0">
                        <User size={20} />
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div className="min-w-0">
                            <p className="text-xs uppercase font-bold text-gray-400">Owner Account</p>
                            <h3 className="text-lg font-black truncate text-[#0f172a]">{currentUser || 'Azero'}</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 p-2 md:p-4 space-y-2 md:space-y-4 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            if (mobile) setIsOpen(false);
                        }}
                        className={`
                            relative w-full flex items-center gap-4 p-3 md:p-4 text-left transition-all
                            border-4 border-black
                            ${activeTab === item.id
                                ? `${item.color} ${item.id === 'settings' ? 'text-white' : 'text-black'} ${shadowStyle} translate-x-[-2px] translate-y-[-2px]`
                                : 'bg-white hover:bg-gray-50'}
                             ${isCollapsed && !mobile ? 'justify-center px-0' : ''}
                        `}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={24} strokeWidth={3} className="shrink-0" />
                        {(!isCollapsed || mobile) && (
                            <span className="font-black uppercase tracking-wide truncate">{item.label}</span>
                        )}

                        {/* Active Indicator (Bauhaus Shape) */}
                        {activeTab === item.id && (!isCollapsed || mobile) && (
                            <div className="absolute right-4 w-3 h-3 bg-white border-2 border-black rotate-45"></div>
                        )}
                    </button>
                ))}
            </nav>

            {/* FOOTER */}
            <div className="p-4 md:p-6 border-t-4 border-black bg-white">
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center justify-center gap-2 bg-[#1D3557] text-white p-3 md:p-4 border-4 border-black font-black uppercase ${shadowStyle} ${hoverShadow} transition-all`}
                >
                    <LogOut size={20} />
                    {(!isCollapsed || mobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Fixed) */}
            <div className={`hidden md:block fixed left-0 top-0 h-screen transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-72'}`}>
                <SidebarContent mobile={false} />
            </div>

            {/* Mobile Overlay & Sidebar */}
            <div className={`md:hidden fixed inset-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-72 h-full">
                    <SidebarContent mobile={true} />
                </div>
            </div>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
