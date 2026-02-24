import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'danger' | 'ghost';
    children: React.ReactNode;
    className?: string; // Add className prop
}

export const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => { // Destructure className
    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/25",
        danger: "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30",
        ghost: "bg-white/5 hover:bg-white/10 text-white",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2",
                variants[variant],
                className // Apply custom className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};
