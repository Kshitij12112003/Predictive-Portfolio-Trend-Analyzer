import { PortfolioItem } from '@/types';

export interface StockData {
    historical: { date: string; close: number; volume: number; high: number; low: number; open: number }[];
    forecast: { date: string; predictedPrice: number; lowerBound: number; upperBound: number }[];
    signal: 'BUY' | 'SELL' | 'HOLD';
    trendPct: number;
    currentPrice: number;
    rsi: { date: string; value: number }[];
    riskMetrics: { volatility: number; sharpeRatio: number; maxDrawdown: number };
}

export const generateStockData = (ticker: string): StockData => {
    const prices: Record<string, number> = { AAPL: 150, GOOGL: 2800, MSFT: 350, TSLA: 245, NVDA: 480, AMZN: 145, META: 300, NFLX: 400 };
    const basePrice = prices[ticker] || 150;
    const historical = [];
    const forecast = [];
    const today = new Date();

    // Generate 90 days of historical data
    let current = basePrice;
    for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const volatility = basePrice * 0.02; // 2% daily volatility
        const change = (Math.random() - 0.5) * volatility;
        current += change;

        // Ensure price doesn't go below 1
        if (current < 1) current = 1;

        historical.push({
            date: date.toISOString().split('T')[0],
            close: current,
            open: current - (Math.random() - 0.5) * volatility * 0.5,
            high: current + Math.random() * volatility * 0.5,
            low: current - Math.random() * volatility * 0.5,
            volume: Math.floor(Math.random() * 10000000) + 5000000,
        });
    }

    const currentPrice = historical[historical.length - 1].close;
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const trendStrength = Math.random() * 2; // Random strength

    // Generate 14 days forecast
    for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const predicted = currentPrice + i * trendStrength * trendDirection + (Math.random() - 0.5) * 5;
        const uncertainty = i * 2; // Uncertainty grows with time

        forecast.push({
            date: date.toISOString().split('T')[0],
            predictedPrice: predicted,
            lowerBound: predicted - uncertainty,
            upperBound: predicted + uncertainty,
        });
    }

    // Calculate RSI (simplified)
    const rsi = historical.map((d, i) => ({
        date: d.date,
        value: 50 + (Math.sin(i / 5) * 30) + (Math.random() - 0.5) * 10
    })).slice(-30); // Last 30 days

    const finalPrice = forecast[forecast.length - 1].predictedPrice;
    const trendPct = ((finalPrice - currentPrice) / currentPrice) * 100;

    // Logic for Signal
    let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (trendPct > 5) signal = 'BUY';
    else if (trendPct < -5) signal = 'SELL';

    // Risk Metrics
    const riskMetrics = {
        volatility: (Math.random() * 20 + 10), // 10-30%
        sharpeRatio: (Math.random() * 2 + 0.5), // 0.5 - 2.5
        maxDrawdown: (Math.random() * 15 + 5) // 5-20%
    };

    return { historical, forecast, signal, trendPct, currentPrice, rsi, riskMetrics };
};

export const DEMO_PORTFOLIO: PortfolioItem[] = [
    { id: 1, ticker: 'AAPL', sharesOwned: 10, averageBuyPrice: 150.25, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, ticker: 'GOOGL', sharesOwned: 5, averageBuyPrice: 2800.50, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    { id: 3, ticker: 'MSFT', sharesOwned: 15, averageBuyPrice: 350.75, createdAt: '2024-01-03', updatedAt: '2024-01-03' },
    { id: 4, ticker: 'TSLA', sharesOwned: 8, averageBuyPrice: 245.80, createdAt: '2024-01-04', updatedAt: '2024-01-04' },
    { id: 5, ticker: 'NVDA', sharesOwned: 12, averageBuyPrice: 480.30, createdAt: '2024-01-05', updatedAt: '2024-01-05' },
];
