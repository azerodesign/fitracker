import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';

const BauhausButton = ({ onClick, children, variant = 'primary', className = '', type = 'button', disabled = false }) => {
    const bg = disabled ? '#ccc' : (variant === 'primary' ? COLORS.blue : variant === 'danger' ? COLORS.red : COLORS.yellow);
    const text = variant === 'warning' ? COLORS.black : COLORS.white;

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { y: -2, boxShadow: "6px 6px 0px 0px #1D3557" } : {}}
            whileTap={!disabled ? { y: 2, x: 2, boxShadow: "0px 0px 0px 0px #1D3557" } : {}}
            className={`
        relative px-6 py-3 font-bold uppercase tracking-wider border-2 border-[#1D3557]
        shadow-[4px_4px_0px_0px_#1D3557]
        disabled:opacity-50 disabled:shadow-none disabled:translate-y-[2px]
        ${className}
      `}
            style={{ backgroundColor: bg, color: text }}
        >
            {children}
        </motion.button>
    );
};

export default BauhausButton;
