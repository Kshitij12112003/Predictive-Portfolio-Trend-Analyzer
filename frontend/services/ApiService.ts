/**
 * ApiService - Centralized API communication for StockShelf frontend
 * Handles all backend communication with error handling and retry logic
 * Requirements: 4.4, 9.4
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { PortfolioItem, PricePoint, ForecastData } from '../types';

/**
 * API error response structure from backend
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Response from add stock endpoint
 */
interface AddStockResponse {
  success: boolean;
  message: string;
  portfolio_item: {
    id: number;
    ticker: string;
    shares_owned: number;
    average_buy_price: number;
    created_at: string;
    updated_at: string;
  };
}

/**
 * Response from get portfolio endpoint
 */
interface GetPortfolioResponse {
  portfolio: Array<{
    id: number;
    ticker: string;
    shares_owned: number;
    average_buy_price: number;
    created_at: string;
    updated_at: string;
  }>;
}

/**
 * Response from delete stock endpoint
 */
interface DeleteStockResponse {
  success: boolean;
  message: string;
}

/**
 * Response from historical data endpoint
 */
interface HistoricalDataResponse {
  ticker: string;
  data: Array<{
    date: string;
    close: number;
  }>;
}

/**
 * Response from forecast endpoint
 */
interface ForecastResponse {
  ticker: string;
  forecast: Array<{
    date: string;
    predicted_price: number;
    lower_bound: number;
    upper_bound: number;
  }>;
  signal: 'BUY' | 'SELL' | 'HOLD';
  trend_percentage: number;
  current_price: number;
}

/**
 * ApiService class for backend communication
 * Provides methods for all API endpoints with error handling and retry logic
 */
class ApiService {
  private client: AxiosInstance;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor(baseURL: string = 'http://localhost:8000') {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Retry logic for failed requests
   * Implements exponential backoff for retries
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        // Exponential backoff
        const delay = this.retryDelay * (this.maxRetries - retries + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Determine if an error is retryable
   * Network errors and 5xx server errors are retryable
   */
  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      // Network errors (no response)
      if (!error.response) {
        return true;
      }
      // Server errors (5xx)
      if (error.response.status >= 500) {
        return true;
      }
    }
    return false;
  }

  /**
   * Extract error message from API error response
   */
  private extractErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      // Check if response has error structure
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error.message;
      }
      
      // Check for detail field (FastAPI default)
      if (axiosError.response?.data && 'detail' in axiosError.response.data) {
        const detail = (axiosError.response.data as any).detail;
        if (typeof detail === 'string') {
          return detail;
        }
        if (detail?.error?.message) {
          return detail.error.message;
        }
      }
      
      // Network error
      if (!axiosError.response) {
        return 'Unable to connect to the server. Please check if the backend is running.';
      }
      
      // Generic HTTP error
      return `Request failed with status ${axiosError.response.status}`;
    }
    
    // Unknown error
    return error instanceof Error ? error.message : 'An unknown error occurred';
  }

  /**
   * Add a stock to the portfolio
   * @param ticker - Stock ticker symbol (e.g., "AAPL")
   * @param shares - Number of shares
   * @param buyPrice - Purchase price per share
   * @returns Promise with the added portfolio item
   */
  async addStock(
    ticker: string,
    shares: number,
    buyPrice: number
  ): Promise<PortfolioItem> {
    try {
      const response = await this.retryRequest(() =>
        this.client.post<AddStockResponse>('/api/portfolio/add', {
          ticker: ticker.toUpperCase(),
          shares,
          buy_price: buyPrice,
        })
      );

      // Convert snake_case to camelCase
      const item = response.data.portfolio_item;
      return {
        id: item.id,
        ticker: item.ticker,
        sharesOwned: item.shares_owned,
        averageBuyPrice: item.average_buy_price,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      };
    } catch (error) {
      throw new Error(`Failed to add stock: ${this.extractErrorMessage(error)}`);
    }
  }

  /**
   * Get all portfolio holdings
   * @returns Promise with array of portfolio items
   */
  async getPortfolio(): Promise<PortfolioItem[]> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get<GetPortfolioResponse>('/api/portfolio')
      );

      // Convert snake_case to camelCase
      return response.data.portfolio.map(item => ({
        id: item.id,
        ticker: item.ticker,
        sharesOwned: item.shares_owned,
        averageBuyPrice: item.average_buy_price,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      throw new Error(`Failed to get portfolio: ${this.extractErrorMessage(error)}`);
    }
  }

  /**
   * Get historical stock data
   * @param ticker - Stock ticker symbol
   * @param years - Number of years of historical data (default: 2)
   * @returns Promise with array of price points
   */
  async getHistoricalData(ticker: string, years: number = 2): Promise<PricePoint[]> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get<HistoricalDataResponse>(
          `/api/stock/history/${ticker.toUpperCase()}`,
          { params: { years } }
        )
      );

      return response.data.data;
    } catch (error) {
      throw new Error(`Failed to get historical data: ${this.extractErrorMessage(error)}`);
    }
  }

  /**
   * Get forecast for a stock
   * @param ticker - Stock ticker symbol
   * @returns Promise with forecast data including predictions and signal
   */
  async getForecast(ticker: string): Promise<ForecastData> {
    try {
      const response = await this.retryRequest(() =>
        this.client.get<ForecastResponse>(
          `/api/stock/forecast/${ticker.toUpperCase()}`
        )
      );

      // Convert snake_case to camelCase
      return {
        ticker: response.data.ticker,
        forecastPoints: response.data.forecast.map(point => ({
          date: point.date,
          predictedPrice: point.predicted_price,
          lowerBound: point.lower_bound,
          upperBound: point.upper_bound,
        })),
        signal: response.data.signal,
        trendPercentage: response.data.trend_percentage,
        currentPrice: response.data.current_price,
      };
    } catch (error) {
      throw new Error(`Failed to get forecast: ${this.extractErrorMessage(error)}`);
    }
  }

  /**
   * Delete a stock from the portfolio
   * @param ticker - Stock ticker symbol to delete
   * @returns Promise with success status
   */
  async deleteStock(ticker: string): Promise<void> {
    try {
      await this.retryRequest(() =>
        this.client.delete<DeleteStockResponse>(
          `/api/portfolio/${ticker.toUpperCase()}`
        )
      );
    } catch (error) {
      throw new Error(`Failed to delete stock: ${this.extractErrorMessage(error)}`);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export default ApiService;
