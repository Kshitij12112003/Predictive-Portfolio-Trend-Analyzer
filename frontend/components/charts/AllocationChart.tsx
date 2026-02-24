import Plot from './PlotWrapper';
import { Card } from '@/components/ui/Card';
import { PortfolioItem } from '@/types';

interface AllocationChartProps {
    portfolio: PortfolioItem[];
}

export function AllocationChart({ portfolio }: AllocationChartProps) {
    const data = [{
        values: portfolio.map(p => p.sharesOwned * p.averageBuyPrice),
        labels: portfolio.map(p => p.ticker),
        type: 'pie' as const,
        hole: 0.6,
        textinfo: 'label+percent' as const,
        textposition: 'outside' as const,
        marker: {
            colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        },
        textfont: { color: '#9ca3af', family: 'Inter, sans-serif', size: 12 },
    }];

    return (
        <Card className="h-full min-h-[300px]">
            <h2 className="text-lg font-bold text-white mb-2">Asset Allocation</h2>
            <div className="w-full h-[250px]">
                <Plot
                    data={data}
                    layout={{
                        showlegend: false,
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { l: 20, r: 20, t: 20, b: 20 },
                        font: { color: '#fff' },
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </Card>
    );
}
