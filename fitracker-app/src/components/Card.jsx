import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, title, className = '', headerAction, noPadding = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-surface rounded-3xl shadow-soft ${noPadding ? '' : 'p-8'} ${className}`}
    >
        {(title || headerAction) && (
            <div className={`flex justify-between items-center mb-6 ${noPadding ? 'px-6 pt-6' : ''}`}>
                {title && <h3 className="text-lg font-bold text-text-main tracking-tight">{title}</h3>}
                {headerAction}
            </div>
        )}
        {children}
    </motion.div>
);

export default Card;
