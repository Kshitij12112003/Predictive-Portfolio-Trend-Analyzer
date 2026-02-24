/**
 * TypeScript interfaces for StockShelf application
 * Defines data models for portfolio management, stock data, and forecasting
 */

/**
 * Represents a stock holding in the user's portfolio
 * Requirements: 4.4, 5.1, 5.2
 */
export interface PortfolioItem {
  id: number;
  ticker: string;
  sharesOwned: number;
  averageBuyPrice: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a single historical price data point
 * Requirements: 4.4, 5.1, 5.2
 */
export interface PricePoint {
  date: string;
  close: number;
}

/**
 * Represents a single forecast prediction point with confidence bounds
 * Requirements: 4.4, 5.1, 5.2
 */
export interface ForecastPoint {
  date: string;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface TechnicalIndicator {
  date: string;
  value: number;
}

export interface StockData {
  historical: { date: string; close: number; volume: number; high: number; low: number; open: number }[];
  forecast: ForecastPoint[];
  signal: 'BUY' | 'SELL' | 'HOLD';
  trendPct: number;
  currentPrice: number;
  rsi: TechnicalIndicator[];
  riskMetrics: RiskMetrics;
}

export interface ForecastData {
  ticker: string;
  forecastPoints: ForecastPoint[];
  signal: "BUY" | "SELL" | "HOLD";
  trendPercentage: number;
  currentPrice: number;
}
