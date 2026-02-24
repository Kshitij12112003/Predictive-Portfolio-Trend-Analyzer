import Plot from './PlotWrapper';
import { Card } from '@/components/ui/Card';
import { StockData } from '@/types';

interface VolumeChartProps {
    data: StockData;
}

export function VolumeChart({ data }: VolumeChartProps) {
    return (
        <Card className="h-full">
            <h2 className="text-lg font-bold text-white mb-2">Trading Volume</h2>
            <div className="w-full h-[200px]">
                <Plot
                    data={[{
                        x: data.historical.slice(-30).map(p => p.date),
                        y: data.historical.slice(-30).map(p => p.volume),
                        type: 'bar' as const,
                        marker: { color: '#3b82f6' },
                    }]}
                    layout={{
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        margin: { l: 40, r: 10, t: 10, b: 30 },
                        xaxis: { showgrid: false, color: '#6b7280' },
                        yaxis: { showgrid: true, gridcolor: '#333', color: '#6b7280' },
                    }}
                    config={{ displayModeBar: false }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                />
            </div>
        </Card>
    );
}
