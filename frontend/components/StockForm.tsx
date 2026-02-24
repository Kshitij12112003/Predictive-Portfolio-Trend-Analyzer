import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { PortfolioItem } from '@/types';

interface StockFormProps {
    onAdd: (item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function StockForm({ onAdd }: StockFormProps) {
    const [formData, setFormData] = useState({ ticker: '', shares: '', buyPrice: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ticker || !formData.shares || !formData.buyPrice) {
            setError('All fields are required');
            return;
        }

        onAdd({
            ticker: formData.ticker.toUpperCase(),
            sharesOwned: parseFloat(formData.shares),
            averageBuyPrice: parseFloat(formData.buyPrice),
        });

        setFormData({ ticker: '', shares: '', buyPrice: '' });
        setError('');
    };

    return (
        <Card className="h-full">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PlusCircle className="text-cyan-400" /> Add Position
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Ticker Symbol"
                    placeholder="e.g. AAPL"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Shares"
                        type="number"
                        placeholder="0"
                        value={formData.shares}
                        onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    />
                    <Input
                        label="Avg Price"
                        type="number"
                        placeholder="0.00"
                        value={formData.buyPrice}
                        onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    />
                </div>

                {error && <p className="text-rose-400 text-sm font-bold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">{error}</p>}

                <Button className="w-full mt-4 group">
                    Add Position
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Button>
            </form>
        </Card>
    );
}
