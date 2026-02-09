import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // primary, secondary, danger, ghost, outline
    size = 'md', // sm, md, lg
    className = '',
    disabled = false,
    loading = false,
    icon: Icon
}) => {

    const baseStyles = "inline-flex items-center justify-center font-medium rounded-pill transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-soft hover:shadow-soft-hover active:scale-[0.98]",
        secondary: "bg-surface text-text-muted hover:bg-surface-hover border border-border input-transition shadow-sm active:scale-[0.98]",
        danger: "bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 hover:bg-danger-100 dark:hover:bg-danger-900/30 shadow-none border border-transparent",
        ghost: "bg-transparent text-text-muted hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400",
        outline: "bg-transparent border-2 border-border text-text-muted hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-6 py-3 text-base gap-3"
    };

    const variantClass = variants[variant] || variants.primary;
    const sizeClass = sizes[size] || sizes.md;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
        >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (Icon && <Icon className="w-4 h-4" />)}
            {children}
        </button>
    );
};

export default Button;
