/**
 * Unit tests for ApiService
 * Tests API communication methods with mocked axios
 */

import axios from 'axios';
import ApiService from '../ApiService';
import { PortfolioItem, PricePoint, ForecastData } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
  let apiService: ApiService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    // Create new ApiService instance
    apiService = new ApiService('http://localhost:8000');
  });

  describe('addStock', () => {
    it('should add a stock successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Stock AAPL added successfully',
          portfolio_item: {
            id: 1,
            ticker: 'AAPL',
            shares_owned: 10,
            average_buy_price: 150.5,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.addStock('AAPL', 10, 150.5);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/portfolio/add', {
        ticker: 'AAPL',
        shares: 10,
        buy_price: 150.5,
      });

      expect(result).toEqual({
        id: 1,
        ticker: 'AAPL',
        sharesOwned: 10,
        averageBuyPrice: 150.5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should convert ticker to uppercase', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Stock AAPL added successfully',
          portfolio_item: {
            id: 1,
            ticker: 'AAPL',
            shares_owned: 10,
            average_buy_price: 150.5,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await apiService.addStock('aapl', 10, 150.5);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/portfolio/add', {
        ticker: 'AAPL',
        shares: 10,
        buy_price: 150.5,
      });
    });

    it('should throw error on failure', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid shares value',
            },
          },
        },
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(apiService.addStock('AAPL', -10, 150.5)).rejects.toThrow(
        'Failed to add stock: Invalid shares value'
      );
    });
  });

  describe('getPortfolio', () => {
    it('should get portfolio successfully', async () => {
      const mockResponse = {
        data: {
          portfolio: [
            {
              id: 1,
              ticker: 'AAPL',
              shares_owned: 10,
              average_buy_price: 150.5,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            {
              id: 2,
              ticker: 'GOOGL',
              shares_owned: 5,
              average_buy_price: 2800.0,
              created_at: '2024-01-02T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
            },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getPortfolio();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/portfolio');
      expect(result).toHaveLength(2);
      expect(result[0].ticker).toBe('AAPL');
      expect(result[1].ticker).toBe('GOOGL');
    });

    it('should return empty array for empty portfolio', async () => {
      const mockResponse = {
        data: {
          portfolio: [],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getPortfolio();

      expect(result).toEqual([]);
    });
  });

  describe('getHistoricalData', () => {
    it('should get historical data successfully', async () => {
      const mockResponse = {
        data: {
          ticker: 'AAPL',
          data: [
            { date: '2024-01-01', close: 150.0 },
            { date: '2024-01-02', close: 151.5 },
            { date: '2024-01-03', close: 149.8 },
          ],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getHistoricalData('AAPL');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/stock/history/AAPL', {
        params: { years: 2 },
      });
      expect(result).toHaveLength(3);
      expect(result[0].close).toBe(150.0);
    });

    it('should use custom years parameter', async () => {
      const mockResponse = {
        data: {
          ticker: 'AAPL',
          data: [],
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await apiService.getHistoricalData('AAPL', 5);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/stock/history/AAPL', {
        params: { years: 5 },
      });
    });
  });

  describe('getForecast', () => {
    it('should get forecast successfully', async () => {
      const mockResponse = {
        data: {
          ticker: 'AAPL',
          forecast: [
            {
              date: '2024-01-08',
              predicted_price: 155.0,
              lower_bound: 150.0,
              upper_bound: 160.0,
            },
            {
              date: '2024-01-09',
              predicted_price: 156.0,
              lower_bound: 151.0,
              upper_bound: 161.0,
            },
          ],
          signal: 'BUY',
          trend_percentage: 5.5,
          current_price: 150.0,
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getForecast('AAPL');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/stock/forecast/AAPL');
      expect(result.ticker).toBe('AAPL');
      expect(result.signal).toBe('BUY');
      expect(result.forecastPoints).toHaveLength(2);
      expect(result.forecastPoints[0].predictedPrice).toBe(155.0);
    });
  });

  describe('deleteStock', () => {
    it('should delete stock successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Stock AAPL removed successfully',
        },
      };

      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      await apiService.deleteStock('AAPL');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/api/portfolio/AAPL');
    });

    it('should throw error when stock not found', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            error: {
              code: 'STOCK_NOT_FOUND',
              message: 'Stock AAPL not found in portfolio',
            },
          },
        },
      };

      mockAxiosInstance.delete.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(apiService.deleteStock('AAPL')).rejects.toThrow(
        'Failed to delete stock: Stock AAPL not found in portfolio'
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const mockError = {
        message: 'Network Error',
        response: undefined,
      };

      // Mock all retry attempts to fail
      mockAxiosInstance.get.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(apiService.getPortfolio()).rejects.toThrow(
        'Failed to get portfolio: Unable to connect to the server'
      );

      // Should have retried 3 times (initial + 3 retries = 4 total)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4);
    }, 10000); // Increase timeout for retry logic

    it('should handle server errors with retry', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          },
        },
      };

      // Mock all retry attempts to fail
      mockAxiosInstance.get.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(apiService.getPortfolio()).rejects.toThrow(
        'Failed to get portfolio: Internal server error'
      );

      // Should have retried 3 times (initial + 3 retries = 4 total)
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4);
    }, 10000); // Increase timeout for retry logic

    it('should not retry on client errors (4xx)', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input',
            },
          },
        },
      };

      mockAxiosInstance.get.mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(apiService.getPortfolio()).rejects.toThrow(
        'Failed to get portfolio: Invalid input'
      );

      // Should not retry on 4xx errors
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });
});
