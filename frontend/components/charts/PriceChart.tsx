import Plot from './PlotWrapper';
import { Card } from '@/components/ui/Card';
import { StockData } from '@/types';
import { useMemo } from 'react';

interface PriceChartProps {
    data: StockData;
    ticker: string;
}

export function PriceChart({ data, ticker }: PriceChartProps) {
    const chartData = useMemo(() => [
        {
            x: data.historical.map(p => p.date),
            y: data.historical.map(p => p.close),
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: 'History',
            line: { color: '#06b6d4', width: 2 },
            fill: 'tozeroy' as const,
            fillcolor: 'rgba(6, 182, 212, 0.05)',
        },
        {
            x: data.forecast.map(p => p.date),
            y: data.forecast.map(p => p.upperBound),
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: 'Upper Bound',
            line: { width: 0 },
            showlegend: false,
            hoverinfo: 'skip' as const,
        },
        {
            x: data.forecast.map(p => p.date),
            y: data.forecast.map(p => p.lowerBound),
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: 'Confidence',
            fill: 'tonexty' as const,
            fillcolor: 'rgba(249, 115, 22, 0.1)',
            line: { width: 0 },
        },
        {
            x: data.forecast.map(p => p.date),
            y: data.forecast.map(p => p.predictedPrice),
            type: 'scatter' as const,
            mode: 'lines+markers' as const,
            name: 'Forecast',
            line: { color: '#f97316', width: 2, dash: 'dash' as const },
            marker: { size: 6, color: '#f97316' },
        },
    ], [data]);

    return (
        <Card className="h-full min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{ticker} Price Analysis</h2>
                    <p className="text-sm text-gray-400">Historical data & AI-driven 14-day Forecast</p>
                </div>
                <div className="flex gap-2 text-xs font-bold">
                    <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">HISTORY</span>
                    <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">FORECAST</span>
                </div>
            </div>

            <div className="w-full h-[350px]">
                <Plot
                    data={chartData}
                    layout={{
                        autosize: true,
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { l: 40, r: 20, t: 10, b: 40 },
                        showlegend: true,
                        legend: { x: 0, y: 1, orientation: 'h', font: { color: '#9ca3af' }, bgcolor: 'rgba(0,0,0,0)' },
                        xaxis: {
                            gridcolor: '#333',
                            color: '#6b7280',
                            showgrid: false,
                        },
                        yaxis: {
                            gridcolor: '#333',
                            color: '#6b7280',
                            tickprefix: '$',
                        },
                        hovermode: 'x unified',
                    }}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </Card>
    );
}
