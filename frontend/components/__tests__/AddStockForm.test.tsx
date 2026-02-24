/**
 * Unit tests for AddStockForm component
 * Tests validation, form submission, and error handling
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddStockForm from '../AddStockForm';
import { apiService } from '../../services/ApiService';
import { PortfolioItem } from '../../types';

// Mock the API service
jest.mock('../../services/ApiService', () => ({
  apiService: {
    addStock: jest.fn(),
  },
}));

describe('AddStockForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<AddStockForm />);

      expect(screen.getByLabelText(/ticker symbol/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/number of shares/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/buy price/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add stock/i })).toBeInTheDocument();
    });
  });

  describe('Validation - Empty Fields (Requirement 4.1)', () => {
    it('should show error when ticker is empty', async () => {
      render(<AddStockForm />);

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ticker symbol is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when shares is empty', async () => {
      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/number of shares is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when buy price is empty', async () => {
      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/buy price is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation - Positive Numbers (Requirements 4.2, 4.3)', () => {
    it('should show error when shares is zero', async () => {
      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '0' } });
      fireEvent.change(priceInput, { target: { value: '150' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/shares must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('should show error when shares is negative', async () => {
      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '-5' } });
      fireEvent.change(priceInput, { target: { value: '150' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/shares must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('should show error when buy price is zero', async () => {
      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '0' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/buy price must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('should show error when buy price is negative', async () => {
      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '-150' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/buy price must be a positive number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission (Requirement 4.4)', () => {
    it('should call API with correct data when form is valid', async () => {
      const mockStock: PortfolioItem = {
        id: 1,
        ticker: 'AAPL',
        sharesOwned: 10,
        averageBuyPrice: 150.50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiService.addStock as jest.Mock).mockResolvedValue(mockStock);

      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.addStock).toHaveBeenCalledWith('AAPL', 10, 150.50);
      });
    });
  });

  describe('Success Handling (Requirement 4.5)', () => {
    it('should display success message after successful submission', async () => {
      const mockStock: PortfolioItem = {
        id: 1,
        ticker: 'AAPL',
        sharesOwned: 10,
        averageBuyPrice: 150.50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiService.addStock as jest.Mock).mockResolvedValue(mockStock);

      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully added AAPL to portfolio/i)).toBeInTheDocument();
      });
    });

    it('should clear form after successful submission', async () => {
      const mockStock: PortfolioItem = {
        id: 1,
        ticker: 'AAPL',
        sharesOwned: 10,
        averageBuyPrice: 150.50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiService.addStock as jest.Mock).mockResolvedValue(mockStock);

      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i) as HTMLInputElement;
      const sharesInput = screen.getByLabelText(/number of shares/i) as HTMLInputElement;
      const priceInput = screen.getByLabelText(/buy price/i) as HTMLInputElement;
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(tickerInput.value).toBe('');
        expect(sharesInput.value).toBe('');
        expect(priceInput.value).toBe('');
      });
    });

    it('should call onStockAdded callback when provided', async () => {
      const mockStock: PortfolioItem = {
        id: 1,
        ticker: 'AAPL',
        sharesOwned: 10,
        averageBuyPrice: 150.50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiService.addStock as jest.Mock).mockResolvedValue(mockStock);

      const onStockAdded = jest.fn();
      render(<AddStockForm onStockAdded={onStockAdded} />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onStockAdded).toHaveBeenCalledWith(mockStock);
      });
    });
  });

  describe('Error Handling (Requirement 4.6)', () => {
    it('should display error message when API call fails', async () => {
      (apiService.addStock as jest.Mock).mockRejectedValue(
        new Error('Failed to add stock: Invalid ticker symbol')
      );

      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'INVALID' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to add stock: invalid ticker symbol/i)).toBeInTheDocument();
      });
    });

    it('should not clear form when submission fails', async () => {
      (apiService.addStock as jest.Mock).mockRejectedValue(
        new Error('Failed to add stock: Server error')
      );

      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i) as HTMLInputElement;
      const sharesInput = screen.getByLabelText(/number of shares/i) as HTMLInputElement;
      const priceInput = screen.getByLabelText(/buy price/i) as HTMLInputElement;
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to add stock: server error/i)).toBeInTheDocument();
      });

      // Form should still have values
      expect(tickerInput.value).toBe('AAPL');
      expect(sharesInput.value).toBe('10');
      expect(priceInput.value).toBe('150.50');
    });
  });

  describe('UI Behavior', () => {
    it('should disable form during submission', async () => {
      const mockStock: PortfolioItem = {
        id: 1,
        ticker: 'AAPL',
        sharesOwned: 10,
        averageBuyPrice: 150.50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      // Delay the resolution to test loading state
      (apiService.addStock as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockStock), 100))
      );

      render(<AddStockForm />);

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      const sharesInput = screen.getByLabelText(/number of shares/i);
      const priceInput = screen.getByLabelText(/buy price/i);
      
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });
      fireEvent.change(sharesInput, { target: { value: '10' } });
      fireEvent.change(priceInput, { target: { value: '150.50' } });

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      // Check that button shows loading state
      expect(screen.getByRole('button', { name: /adding.../i })).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add stock/i })).not.toBeDisabled();
      });
    });

    it('should clear validation errors when user types', async () => {
      render(<AddStockForm />);

      const submitButton = screen.getByRole('button', { name: /add stock/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ticker symbol is required/i)).toBeInTheDocument();
      });

      const tickerInput = screen.getByLabelText(/ticker symbol/i);
      fireEvent.change(tickerInput, { target: { value: 'A' } });

      expect(screen.queryByText(/ticker symbol is required/i)).not.toBeInTheDocument();
    });
  });
});
