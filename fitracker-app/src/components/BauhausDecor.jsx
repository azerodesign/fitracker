import React from 'react';
import { motion } from 'framer-motion';

const BauhausDecor = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-[-50px] w-64 h-64 rounded-full bg-[#E63946]"
        />
        <motion.div
            animate={{ y: [0, 20, 0], rotate: [-12, -5, -12] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[30%] left-[-40px] w-0 h-0 border-l-[100px] border-l-transparent border-b-[150px] border-b-[#F9C74F] border-r-[100px] border-r-transparent transform -rotate-12"
        />
        <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [45, 50, 45] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-10 right-10 w-40 h-40 bg-[#457B9D] transform rotate-45"
        />
        <motion.div
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 left-20 w-10 h-10 bg-[#1D3557] rounded-full"
        />
        <motion.div
            animate={{ height: ["24rem", "28rem", "24rem"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 left-10 w-4 h-96 bg-[#E63946]"
        />
    </div>
);

export default BauhausDecor;
