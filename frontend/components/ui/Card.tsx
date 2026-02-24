import { cn } from '@/utils/cn';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
}

export function Card({ children, className, gradient, ...props }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-2xl p-6 backdrop-blur-xl border border-white/5 shadow-xl transition-all duration-300",
                gradient
                    ? "bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10"
                    : "bg-white/5 hover:bg-white/10",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
