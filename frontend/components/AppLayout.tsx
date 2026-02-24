/**
 * AppLayout Component
 * Main application layout with sidebar and dashboard area
 * Requirements: 4.1, 5.1, 6.5
 */

'use client';

import React from 'react';
import AddStockForm from './AddStockForm';
import PortfolioList from './PortfolioList';
import StockChart from './StockChart';
import SignalCard from './SignalCard';
import { PortfolioItem, PricePoint, ForecastPoint } from '@/types';

interface AppLayoutProps {
  // Portfolio data
  portfolio: PortfolioItem[];
  onAddStock: (ticker: string, shares: number, buyPrice: number) => Promise<void>;
  onDeleteStock: (ticker: string) => Promise<void>;
  onSelectStock: (ticker: string) => void;
  
  // Chart data
  selectedTicker: string;
  historicalData: PricePoint[];
  forecastData: ForecastPoint[];
  
  // Signal data
  signal: 'BUY' | 'SELL' | 'HOLD' | null;
  trendPercentage: number;
  
  // Loading states
  portfolioLoading: boolean;
  chartLoading: boolean;
  signalLoading: boolean;
  
  // Error states
  portfolioError: string;
  chartError: string;
  signalError: string;
}

/**
 * AppLayout component provides the main application structure
 * - Left sidebar: AddStockForm and PortfolioList
 * - Right main area: SignalCard and StockChart
 */
export default function AppLayout({
  portfolio,
  onAddStock,
  onDeleteStock,
  onSelectStock,
  selectedTicker,
  historicalData,
  forecastData,
  signal,
  trendPercentage,
  portfolioLoading,
  chartLoading,
  signalLoading,
  portfolioError,
  chartError,
  signalError,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            📈 StockShelf
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your portfolio and forecast stock trends
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Add Stock Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Add Stock
              </h2>
              <AddStockForm onAddStock={onAddStock} />
            </div>

            {/* Portfolio List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                My Portfolio
              </h2>
              {portfolioError ? (
                <div className="text-red-600 text-sm p-3 bg-red-50 rounded">
                  {portfolioError}
                </div>
              ) : (
                <PortfolioList
                  portfolio={portfolio}
                  onSelectStock={onSelectStock}
                  onDeleteStock={onDeleteStock}
                  selectedTicker={selectedTicker}
                  isLoading={portfolioLoading}
                />
              )}
            </div>
          </aside>

          {/* Main Dashboard Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* Signal Card */}
            {selectedTicker && (
              <SignalCard
                signal={signal || 'HOLD'}
                trendPercentage={trendPercentage}
                ticker={selectedTicker}
                loading={signalLoading}
                error={signalError}
              />
            )}

            {/* Stock Chart */}
            <StockChart
              ticker={selectedTicker || 'Select a stock'}
              historicalData={historicalData}
              forecastData={forecastData}
              loading={chartLoading}
              error={chartError}
            />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            StockShelf - Local Stock Portfolio Tracker with Prophet Forecasting
          </p>
        </div>
      </footer>
    </div>
  );
}
