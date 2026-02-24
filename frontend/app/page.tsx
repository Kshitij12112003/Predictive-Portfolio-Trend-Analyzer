'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { MetricCard } from '@/components/MetricCard';
import { PortfolioTable } from '@/components/PortfolioTable';
import { StockForm } from '@/components/StockForm';
import { PriceChart } from '@/components/charts/PriceChart';
import { AllocationChart } from '@/components/charts/AllocationChart';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { RiskChart } from '@/components/charts/RiskChart';
import { TechnicalIndicators } from '@/components/charts/TechnicalIndicators';
import { generateStockData, DEMO_PORTFOLIO } from '@/utils/mockData';
import { PortfolioItem, StockData } from '@/types';
import { DollarSign, PieChart, Activity, TrendingUp } from 'lucide-react';

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEMO_PORTFOLIO);
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  // Keep stockData null until client-side to prevent hydration mismatch
  const [stockData, setStockData] = useState<StockData | null>(null);

  // Generate stock data only on the client to avoid Math.random() hydration mismatch
  useEffect(() => {
    setStockData(generateStockData(selectedTicker));
  }, [selectedTicker]);

  const handleAddStock = (newItem: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newStock: PortfolioItem = {
      ...newItem,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPortfolio(prev => [...prev, newStock]);
  };

  const handleDelete = (ticker: string) => {
    if (confirm(`Delete ${ticker}?`)) {
      setPortfolio(prev => {
        const newPortfolio = prev.filter(s => s.ticker !== ticker);
        if (selectedTicker === ticker && newPortfolio.length > 0) {
          setSelectedTicker(newPortfolio[0].ticker);
        }
        return newPortfolio;
      });
    }
  };

  const totalValue = portfolio.reduce((sum, s) => sum + s.sharesOwned * s.averageBuyPrice, 0);
  const totalShares = portfolio.reduce((sum, s) => sum + s.sharesOwned, 0);
  const topHolding = [...portfolio].sort((a, b) => (b.sharesOwned * b.averageBuyPrice) - (a.sharesOwned * a.averageBuyPrice))[0];

  const signalTrend = stockData?.signal === 'BUY' ? 'up' : stockData?.signal === 'SELL' ? 'down' : 'neutral';

  return (
    <div className="min-h-screen bg-gray-950 pb-16">
      <DashboardHeader />

      <main className="max-w-[1920px] mx-auto px-4 md:px-6 py-8 space-y-6">

        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Total Portfolio Value"
            value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend="up"
            trendValue="+2.4% (Today)"
          />
          <MetricCard
            label="Total Holdings"
            value={portfolio.length}
            subValue={`${totalShares.toFixed(2)} Shares`}
            icon={PieChart}
          />
          <MetricCard
            label="Top Asset"
            value={topHolding?.ticker || 'N/A'}
            subValue={topHolding ? `$${(topHolding.sharesOwned * topHolding.averageBuyPrice).toLocaleString()}` : '-'}
            icon={Activity}
          />
          <MetricCard
            label="Market Sentiment"
            value={stockData?.signal ?? '—'}
            trend={signalTrend}
            trendValue={stockData ? `${stockData.trendPct.toFixed(2)}%` : ''}
            icon={TrendingUp}
            className={stockData?.signal === 'BUY' ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
          />
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-6">

          {/* ── Left Panel ── */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <StockForm onAdd={handleAddStock} />
            <div className="flex-1 min-h-[400px]">
              <PortfolioTable
                portfolio={portfolio}
                selectedTicker={selectedTicker}
                onSelect={setSelectedTicker}
                onDelete={handleDelete}
              />
            </div>
          </div>

          {/* ── Centre Panel ── */}
          <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
            {stockData
              ? <PriceChart data={stockData} ticker={selectedTicker} />
              : <div className="glass-card rounded-2xl h-[430px] flex items-center justify-center text-gray-500 animate-pulse">Loading chart…</div>
            }

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockData
                ? <TechnicalIndicators data={stockData} />
                : <div className="glass-card rounded-2xl h-[240px] animate-pulse" />
              }
              {stockData
                ? <VolumeChart data={stockData} />
                : <div className="glass-card rounded-2xl h-[240px] animate-pulse" />
              }
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            <AllocationChart portfolio={portfolio} />
            <RiskChart portfolio={portfolio} />

            {/* AI Signal Card */}
            {stockData && (
              <div className={`p-5 rounded-2xl text-white shadow-xl border ${stockData.signal === 'BUY'
                  ? 'bg-gradient-to-br from-emerald-600/80 to-teal-700/80 border-emerald-500/30'
                  : stockData.signal === 'SELL'
                    ? 'bg-gradient-to-br from-rose-600/80 to-red-700/80 border-rose-500/30'
                    : 'bg-gradient-to-br from-amber-600/80 to-orange-700/80 border-amber-500/30'
                }`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{stockData.signal === 'BUY' ? '🚀' : stockData.signal === 'SELL' ? '⚠️' : '⚖️'}</span>
                  <div>
                    <div className="font-black text-xl tracking-tight">{stockData.signal} SIGNAL</div>
                    <div className="text-sm text-white/70">{selectedTicker} · {stockData.trendPct >= 0 ? '+' : ''}{stockData.trendPct.toFixed(2)}% (14d)</div>
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {stockData.signal === 'BUY' && 'Strong bullish momentum detected. Model suggests accumulation.'}
                  {stockData.signal === 'SELL' && 'Bearish trend identified. Consider reducing exposure.'}
                  {stockData.signal === 'HOLD' && 'Market consolidation phase. Hold current positions.'}
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-full">Volatility {stockData.riskMetrics.volatility.toFixed(1)}%</span>
                  <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-full">Sharpe {stockData.riskMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
