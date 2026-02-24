import Plot from './PlotWrapper';
import { Card } from '@/components/ui/Card';
import { PortfolioItem } from '@/types';

interface RiskChartProps {
    portfolio: PortfolioItem[];
}

export function RiskChart({ portfolio }: RiskChartProps) {
    // Mock generation for risk data based on portfolio items
    // In a real app, this would come from the backend API
    const riskData = portfolio.map(item => ({
        ticker: item.ticker,
        return: (Math.random() * 40) - 10, // -10% to +30%
        risk: (Math.random() * 20) + 5, // 5% to 25% volatility
        size: item.sharesOwned * item.averageBuyPrice
    }));

    return (
        <Card className="h-full min-h-[300px]">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-white">Risk vs Return Analysis</h2>
                <p className="text-sm text-gray-400">Efficient Frontier approximation</p>
            </div>

            <div className="w-full h-[250px]">
                <Plot
                    data={[{
                        x: riskData.map(d => d.risk),
                        y: riskData.map(d => d.return),
                        text: riskData.map(d => d.ticker),
                        mode: 'text+markers' as const,
                        type: 'scatter',
                        marker: {
                            size: riskData.map(d => Math.sqrt(d.size) / 2),
                            color: riskData.map(d => d.return), // Color by return
                            colorscale: 'Viridis',
                            showscale: false
                        },
                        textposition: 'top center',
                        textfont: { color: '#fff', family: 'Inter, sans-serif', size: 10 }
                    }]}
                    layout={{
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { l: 40, r: 20, t: 10, b: 40 },
                        xaxis: {
                            title: { text: 'Risk (Volatility %)', font: { color: '#9ca3af' } },
                            color: '#9ca3af',
                            gridcolor: '#333'
                        },
                        yaxis: {
                            title: { text: 'Annual Return %', font: { color: '#9ca3af' } },
                            color: '#9ca3af',
                            gridcolor: '#333'
                        },
                        hovermode: 'closest'
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </Card>
    );
}
