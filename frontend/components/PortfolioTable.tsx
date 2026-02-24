import { PortfolioItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, TrendingUp } from 'lucide-react';

interface PortfolioTableProps {
    portfolio: PortfolioItem[];
    selectedTicker: string;
    onSelect: (ticker: string) => void;
    onDelete: (ticker: string) => void;
}

export function PortfolioTable({ portfolio, selectedTicker, onSelect, onDelete }: PortfolioTableProps) {
    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" /> Your Holdings
                </h2>
                <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-gray-400">{portfolio.length} ASSETS</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {portfolio.map((stock) => {
                    const isSelected = selectedTicker === stock.ticker;
                    return (
                        <div
                            key={stock.id}
                            onClick={() => onSelect(stock.ticker)}
                            className={`
                group p-4 rounded-xl cursor-pointer transition-all duration-300 border
                ${isSelected
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}
              `}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                                            {stock.ticker}
                                        </span>
                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        {stock.sharesOwned} shares @ ${stock.averageBuyPrice.toFixed(2)}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                        ${(stock.sharesOwned * stock.averageBuyPrice).toLocaleString()}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(stock.ticker); }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-500/20 rounded-lg text-rose-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
