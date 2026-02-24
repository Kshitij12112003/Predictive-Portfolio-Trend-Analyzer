import { Zap } from 'lucide-react';

export function DashboardHeader() {
    return (
        <header className="relative z-10 glass border-b border-white/5 sticky top-0">
            <div className="max-w-[1920px] mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                        <Zap className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent tracking-tight">
                            StockShelf <span className="text-cyan-400">Pro</span>
                        </h1>
                        <p className="text-xs text-gray-400 font-medium tracking-wide">AI-POWERED PREDICTIVE ANALYTICS</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400">MARKET LIVE</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 border-2 border-white/20" />
                </div>
            </div>
        </header>
    );
}
