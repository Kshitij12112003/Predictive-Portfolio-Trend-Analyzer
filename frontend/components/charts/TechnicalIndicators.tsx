import Plot from './PlotWrapper';
import { Card } from '@/components/ui/Card';
import { StockData } from '@/types';

interface TechnicalIndicatorsProps {
    data: StockData;
}

export function TechnicalIndicators({ data }: TechnicalIndicatorsProps) {
    return (
        <Card className="h-full">
            <div className="mb-2 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Technical Indicators</h2>
                <span className="text-xs font-bold text-cyan-400 px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20">RSI (14)</span>
            </div>

            <div className="w-full h-[200px]">
                <Plot
                    data={[
                        {
                            x: data.rsi.map(d => d.date),
                            y: data.rsi.map(d => d.value),
                            type: 'scatter' as const,
                            mode: 'lines' as const,
                            line: { color: '#8b5cf6', width: 2 },
                            name: 'RSI'
                        },
                        {
                            x: [data.rsi[0].date, data.rsi[data.rsi.length - 1].date],
                            y: [70, 70],
                            mode: 'lines',
                            line: { color: 'rgba(239, 68, 68, 0.5)', width: 1, dash: 'dash' },
                            name: 'Overbought'
                        },
                        {
                            x: [data.rsi[0].date, data.rsi[data.rsi.length - 1].date],
                            y: [30, 30],
                            mode: 'lines',
                            line: { color: 'rgba(16, 185, 129, 0.5)', width: 1, dash: 'dash' },
                            name: 'Oversold'
                        }
                    ]}
                    layout={{
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { l: 40, r: 10, t: 10, b: 30 },
                        xaxis: { showgrid: false, color: '#6b7280' },
                        yaxis: {
                            range: [0, 100],
                            showgrid: true,
                            gridcolor: '#333',
                            color: '#6b7280',
                            tickvals: [30, 70]
                        },
                        showlegend: false,
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </Card>
    );
}
