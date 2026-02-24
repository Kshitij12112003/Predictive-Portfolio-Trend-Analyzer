import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, className, ...props }, ref) => {
        return (
            <div className="relative group">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none transition-all duration-300",
                        "focus:border-cyan-500 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
                        "placeholder:text-gray-600",
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';
