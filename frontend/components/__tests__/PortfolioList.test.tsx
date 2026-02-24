/**
 * Unit tests for PortfolioList component
 * Tests display, selection, deletion, and empty states
 */

import { render, screen, fireEvent } from '@testing-library/react';
import PortfolioList from '../PortfolioList';
import { PortfolioItem } from '../../types';

describe('PortfolioList', () => {
  const mockPortfolio: PortfolioItem[] = [
    {
      id: 1,
      ticker: 'AAPL',
      sharesOwned: 10.5,
      averageBuyPrice: 150.25,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      ticker: 'GOOGL',
      sharesOwned: 5.0,
      averageBuyPrice: 2800.50,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      ticker: 'MSFT',
      sharesOwned: 20.0,
      averageBuyPrice: 350.75,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ];

  const mockOnSelectStock = jest.fn();
  const mockOnDeleteStock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  describe('Display', () => {
    it('should render portfolio with all holdings', () => {
      render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      // Check title with count
      expect(screen.getByText('Portfolio (3)')).toBeInTheDocument();

      // Check all tickers are displayed
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();

      // Check shares are displayed with 2 decimal places
      expect(screen.getByText('10.50')).toBeInTheDocument();
      expect(screen.getByText('5.00')).toBeInTheDocument();
      expect(screen.getByText('20.00')).toBeInTheDocument();

      // Check prices are displayed with $ and 2 decimal places
      expect(screen.getByText('$150.25')).toBeInTheDocument();
      expect(screen.getByText('$2800.50')).toBeInTheDocument();
      expect(screen.getByText('$350.75')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      expect(screen.getByText('Ticker')).toBeInTheDocument();
      expect(screen.getByText('Shares')).toBeInTheDocument();
      expect(screen.getByText('Avg Price')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should highlight selected stock', () => {
      const { container } = render(
        <PortfolioList
          portfolio={mockPortfolio}
          selectedTicker="GOOGL"
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      // Find the row containing GOOGL
      const rows = container.querySelectorAll('tbody tr');
      const googlRow = Array.from(rows).find(row => 
        row.textContent?.includes('GOOGL')
      );

      expect(googlRow).toHaveClass('selected');
    });

    it('should render delete button for each stock', () => {
      render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      const deleteButtons = screen.getAllByRole('button');
      expect(deleteButtons).toHaveLength(3);
      
      // Check aria-labels
      expect(screen.getByLabelText('Delete AAPL')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete GOOGL')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete MSFT')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when portfolio is empty', () => {
      render(
        <PortfolioList
          portfolio={[]}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      expect(screen.getByText('Your portfolio is empty')).toBeInTheDocument();
      expect(screen.getByText('Add stocks using the form above to get started')).toBeInTheDocument();
    });

    it('should not display table when portfolio is empty', () => {
      const { container } = render(
        <PortfolioList
          portfolio={[]}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      expect(container.querySelector('table')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading message when isLoading is true', () => {
      render(
        <PortfolioList
          portfolio={[]}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
          isLoading={true}
        />
      );

      expect(screen.getByText('Loading portfolio...')).toBeInTheDocument();
    });

    it('should not display table when loading', () => {
      const { container } = render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
          isLoading={true}
        />
      );

      expect(container.querySelector('table')).not.toBeInTheDocument();
    });
  });

  describe('Stock Selection', () => {
    it('should call onSelectStock when row is clicked', () => {
      const { container } = render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      // Find and click the AAPL row
      const rows = container.querySelectorAll('tbody tr');
      const aaplRow = Array.from(rows).find(row => 
        row.textContent?.includes('AAPL')
      );

      fireEvent.click(aaplRow!);

      expect(mockOnSelectStock).toHaveBeenCalledTimes(1);
      expect(mockOnSelectStock).toHaveBeenCalledWith('AAPL');
    });

    it('should call onSelectStock with correct ticker for different stocks', () => {
      const { container } = render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      
      // Click GOOGL row
      const googlRow = Array.from(rows).find(row => 
        row.textContent?.includes('GOOGL')
      );
      fireEvent.click(googlRow!);

      expect(mockOnSelectStock).toHaveBeenCalledWith('GOOGL');
    });
  });

  describe('Stock Deletion', () => {
    it('should call onDeleteStock when delete button is clicked and confirmed', () => {
      render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      const deleteButton = screen.getByLabelText('Delete AAPL');
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete AAPL from your portfolio?'
      );
      expect(mockOnDeleteStock).toHaveBeenCalledTimes(1);
      expect(mockOnDeleteStock).toHaveBeenCalledWith('AAPL');
    });

    it('should not call onDeleteStock when deletion is cancelled', () => {
      global.confirm = jest.fn(() => false);

      render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      const deleteButton = screen.getByLabelText('Delete MSFT');
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockOnDeleteStock).not.toHaveBeenCalled();
    });

    it('should not trigger row selection when delete button is clicked', () => {
      render(
        <PortfolioList
          portfolio={mockPortfolio}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      const deleteButton = screen.getByLabelText('Delete GOOGL');
      fireEvent.click(deleteButton);

      // onSelectStock should not be called when clicking delete button
      expect(mockOnSelectStock).not.toHaveBeenCalled();
      expect(mockOnDeleteStock).toHaveBeenCalledWith('GOOGL');
    });
  });

  describe('Edge Cases', () => {
    it('should handle portfolio with single item', () => {
      const singleItem = [mockPortfolio[0]];
      
      render(
        <PortfolioList
          portfolio={singleItem}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      expect(screen.getByText('Portfolio (1)')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    it('should handle stocks with decimal shares', () => {
      const decimalShares: PortfolioItem[] = [
        {
          id: 1,
          ticker: 'TSLA',
          sharesOwned: 0.123,
          averageBuyPrice: 250.99,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      render(
        <PortfolioList
          portfolio={decimalShares}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      expect(screen.getByText('0.12')).toBeInTheDocument(); // Rounded to 2 decimals
      expect(screen.getByText('$250.99')).toBeInTheDocument();
    });

    it('should handle stocks with high prices', () => {
      const highPrice: PortfolioItem[] = [
        {
          id: 1,
          ticker: 'BRK.A',
          sharesOwned: 1.0,
          averageBuyPrice: 500000.00,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      render(
        <PortfolioList
          portfolio={highPrice}
          onSelectStock={mockOnSelectStock}
          onDeleteStock={mockOnDeleteStock}
        />
      );

      expect(screen.getByText('$500000.00')).toBeInTheDocument();
    });
  });
});
