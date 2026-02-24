import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export function MetricCard({ label, value, subValue, icon: Icon, trend, trendValue, className }: MetricCardProps) {
    return (
        <Card className={cn("relative overflow-hidden group", className)}>
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-24 h-24" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                </div>

                <div className="text-3xl font-black text-white tracking-tight mb-1">
                    {value}
                </div>

                {(subValue || trendValue) && (
                    <div className="flex items-center gap-2 text-sm">
                        {subValue && <span className="text-gray-500">{subValue}</span>}
                        {trendValue && (
                            <span className={cn(
                                "font-bold",
                                trend === 'up' ? "text-emerald-400" : trend === 'down' ? "text-rose-400" : "text-gray-400"
                            )}>
                                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
