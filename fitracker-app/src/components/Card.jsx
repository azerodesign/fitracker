import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';

const Card = ({ children, title, color = COLORS.white, className = '', headerAction }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`p-6 border-2 border-[#1D3557] shadow-[6px_6px_0px_0px_#1D3557] ${className}`}
        style={{ backgroundColor: color }}
    >
        <div className="flex justify-between items-start mb-4">
            {title && <h3 className="text-xl font-black uppercase tracking-tighter text-[#1D3557]">{title}</h3>}
            {headerAction}
        </div>
        {children}
    </motion.div>
);

export default Card;
