import React from 'react';
import {
    LayoutDashboard,
    PieChart,
    Layers,
    Settings,
    LogOut,
    User,
    Wallet,
    BookOpen,
    X,
    ChevronLeft,
    ChevronRight,
    TrendingUp
} from 'lucide-react';

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

    const navItems = [
        { id: 'input', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'stats', label: 'Analytics', icon: PieChart },
        { id: 'budget', label: 'Budgets', icon: Layers },
        { id: 'wallet', label: 'Wallets', icon: Wallet },
        { id: 'docs', label: 'Guide', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const SidebarContent = ({ mobile = false }) => (
        <div className={`flex flex-col h-full bg-bg-main transition-all duration-300 border-r border-border-subtle ${!mobile ? 'rounded-3xl shadow-soft' : ''} ${isCollapsed && !mobile ? 'w-24' : 'w-72'}`}>

            {/* HEADER / LOGO */}
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-4">
                    <img src="/logo-new.png" alt="Fitracker Logo" className="w-10 h-10 rounded-xl shadow-soft shrink-0" />
                    {(!isCollapsed || mobile) && (
                        <h1 className="text-2xl font-bold tracking-tight text-text-base">Fitracker</h1>
                    )}
                </div>

                {mobile && (
                    <button onClick={() => setIsOpen(false)} className="ml-auto p-2 text-text-dim hover:text-text-base">
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* USER PROFILE */}
            <div className="px-6 pb-6">
                <div className={`flex items-center gap-4 p-3 rounded-2xl bg-bg-surface border border-border-subtle ${isCollapsed && !mobile ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                        <User size={20} />
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div className="min-w-0 overflow-hidden">
                            <p className="text-sm font-bold text-text-base truncate">{currentUser || 'User'}</p>
                            <p className="text-xs text-text-dim truncate">Free Plan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveTab(item.id);
                            if (mobile) setIsOpen(false);
                        }}
                        className={`
                            relative w-full flex items-center gap-4 p-4 rounded-pill text-sm font-bold transition-all duration-300
                            ${activeTab === item.id
                                ? 'bg-primary-500 text-white shadow-soft-hover translate-x-1'
                                : 'text-text-dim hover:bg-bg-surface hover:text-text-base'}
                             ${isCollapsed && !mobile ? 'justify-center px-0' : ''}
                        `}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-text-dim'} />
                        {(!isCollapsed || mobile) && (
                            <span>{item.label}</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* FOOTER / LOGOUT */}
            <div className="p-6">
                <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 p-4 text-sm font-medium text-text-dim hover:bg-danger-50 hover:text-danger-600 rounded-pill transition-colors ${isCollapsed && !mobile ? 'justify-center' : ''}`}
                    title="Logout"
                >
                    <LogOut size={20} />
                    {(!isCollapsed || mobile) && <span>Log out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Floating) */}
            <div className={`hidden md:block fixed left-4 top-4 bottom-4 z-40 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
                <SidebarContent mobile={false} />
            </div>

            {/* Mobile Overlay & Sidebar */}
            <div className={`md:hidden fixed inset-0 z-50 pointer-events-none transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-80 h-full bg-bg-main shadow-2xl pointer-events-auto">
                    <SidebarContent mobile={true} />
                </div>
            </div>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
