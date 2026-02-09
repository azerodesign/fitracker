import React from 'react';

const WalletList = ({ wallets, selectedWalletId, onWalletSelect, onManageClick, formatIDR }) => {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-secondary-400 uppercase tracking-wider ml-1">Wallets</span>
                <button onClick={onManageClick} className="text-xs text-primary-600 hover:text-primary-700 font-bold">Manage</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none px-1">
                {wallets.map(w => (
                    <div key={w.id}
                        onClick={() => onWalletSelect(w.id)}
                        className={`min-w-[160px] p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col gap-3 relative overflow-hidden group
                            ${selectedWalletId === w.id
                                ? 'border-transparent bg-primary-500 text-white shadow-soft-hover scale-[1.02]'
                                : 'border-transparent bg-bg-surface text-text-base shadow-soft hover:shadow-soft-hover hover:scale-[1.02]'}
                        `}
                    >
                        <div className="flex justify-between items-start z-10">
                            <div className={`w-3 h-3 rounded-full ${selectedWalletId === w.id ? 'bg-white' : 'bg-primary-500'}`} />
                            <span className={`text-[10px] uppercase font-black ${selectedWalletId === w.id ? 'text-primary-100' : 'text-text-dim'}`}>{w.type}</span>
                        </div>
                        <div className="z-10">
                            <p className={`font-bold text-sm truncate ${selectedWalletId === w.id ? 'text-white' : 'text-text-base'}`}>{w.name}</p>
                            <p className={`text-xs font-mono opacity-80 ${selectedWalletId === w.id ? 'text-primary-50' : 'text-text-dim'}`}>{formatIDR(w.balance || 0)}</p>
                        </div>
                        {/* Decoration */}
                        <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 ${selectedWalletId === w.id ? 'bg-white' : 'bg-primary-500'}`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WalletList;
