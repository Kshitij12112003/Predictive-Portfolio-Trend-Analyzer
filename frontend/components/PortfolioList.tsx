/**
 * PortfolioList Component
 * Displays all portfolio holdings with selection and deletion capabilities
 * Requirements: 3.5, 3.6
 */

'use client';

import { PortfolioItem } from '../types';

interface PortfolioListProps {
  portfolio: PortfolioItem[];
  selectedTicker?: string;
  onSelectStock: (ticker: string) => void;
  onDeleteStock: (ticker: string) => void;
  isLoading?: boolean;
}

export default function PortfolioList({
  portfolio,
  selectedTicker,
  onSelectStock,
  onDeleteStock,
  isLoading = false,
}: PortfolioListProps) {
  /**
   * Handle delete button click
   */
  const handleDelete = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection when clicking delete
    if (window.confirm(`Are you sure you want to delete ${ticker} from your portfolio?`)) {
      onDeleteStock(ticker);
    }
  };

  /**
   * Handle row click to select stock
   */
  const handleRowClick = (ticker: string) => {
    onSelectStock(ticker);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="portfolio-list">
        <h3>Portfolio</h3>
        <div className="loading">Loading portfolio...</div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  // Empty portfolio state
  if (portfolio.length === 0) {
    return (
      <div className="portfolio-list">
        <h3>Portfolio</h3>
        <div className="empty-state">
          <p>Your portfolio is empty</p>
          <p className="empty-hint">Add stocks using the form above to get started</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  // Portfolio with holdings
  return (
    <div className="portfolio-list">
      <h3>Portfolio ({portfolio.length})</h3>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Shares</th>
              <th>Avg Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item) => (
              <tr
                key={item.id}
                className={selectedTicker === item.ticker ? 'selected' : ''}
                onClick={() => handleRowClick(item.ticker)}
              >
                <td className="ticker-cell">
                  <strong>{item.ticker}</strong>
                </td>
                <td>{item.sharesOwned.toFixed(2)}</td>
                <td>${item.averageBuyPrice.toFixed(2)}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDelete(item.ticker, e)}
                    aria-label={`Delete ${item.ticker}`}
                    title={`Delete ${item.ticker}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .portfolio-list {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    max-width: 500px;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 1.25rem;
    color: #333;
  }

  .loading {
    padding: 20px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .empty-state {
    padding: 30px 20px;
    text-align: center;
    color: #666;
  }

  .empty-state p {
    margin: 8px 0;
  }

  .empty-hint {
    font-size: 0.9rem;
    color: #999;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 6px;
    overflow: hidden;
  }

  thead {
    background-color: #4a90e2;
    color: white;
  }

  th {
    padding: 12px 10px;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
  }

  th:last-child {
    text-align: center;
    width: 80px;
  }

  tbody tr {
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  tbody tr:hover {
    background-color: #f5f5f5;
  }

  tbody tr.selected {
    background-color: #e3f2fd;
  }

  tbody tr.selected:hover {
    background-color: #bbdefb;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  td {
    padding: 12px 10px;
    font-size: 0.95rem;
    color: #333;
  }

  .ticker-cell {
    color: #4a90e2;
  }

  .ticker-cell strong {
    font-weight: 600;
  }

  td:last-child {
    text-align: center;
  }

  .delete-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .delete-btn:hover {
    background-color: #c0392b;
  }

  .delete-btn:active {
    transform: scale(0.95);
  }

  @media (max-width: 600px) {
    .portfolio-list {
      padding: 15px;
    }

    th, td {
      padding: 8px 6px;
      font-size: 0.85rem;
    }

    th:last-child,
    td:last-child {
      width: 60px;
    }

    .delete-btn {
      width: 24px;
      height: 24px;
      font-size: 1.3rem;
    }
  }
`;
