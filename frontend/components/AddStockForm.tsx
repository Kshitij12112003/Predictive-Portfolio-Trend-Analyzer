/**
 * AddStockForm Component
 * Form for adding stocks to the portfolio with validation and error handling
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { apiService } from '../services/ApiService';
import { PortfolioItem } from '../types';

interface AddStockFormProps {
  onAddStock?: (ticker: string, shares: number, buyPrice: number) => Promise<void>;
}

interface FormData {
  ticker: string;
  shares: string;
  buyPrice: string;
}

interface ValidationErrors {
  ticker?: string;
  shares?: string;
  buyPrice?: string;
}

export default function AddStockForm({ onAddStock }: AddStockFormProps) {
  const [formData, setFormData] = useState<FormData>({
    ticker: '',
    shares: '',
    buyPrice: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Validate form fields
   * Requirements: 4.1, 4.2, 4.3
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate ticker - non-empty
    if (!formData.ticker.trim()) {
      errors.ticker = 'Ticker symbol is required';
    }

    // Validate shares - non-empty and positive number
    if (!formData.shares.trim()) {
      errors.shares = 'Number of shares is required';
    } else {
      const sharesNum = parseFloat(formData.shares);
      if (isNaN(sharesNum)) {
        errors.shares = 'Shares must be a valid number';
      } else if (sharesNum <= 0) {
        errors.shares = 'Shares must be a positive number';
      }
    }

    // Validate buy price - non-empty and positive number
    if (!formData.buyPrice.trim()) {
      errors.buyPrice = 'Buy price is required';
    } else {
      const priceNum = parseFloat(formData.buyPrice);
      if (isNaN(priceNum)) {
        errors.buyPrice = 'Buy price must be a valid number';
      } else if (priceNum <= 0) {
        errors.buyPrice = 'Buy price must be a positive number';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  /**
   * Handle form submission
   * Requirements: 4.4, 4.5, 4.6
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call parent handler if provided, otherwise use API directly
      if (onAddStock) {
        await onAddStock(
          formData.ticker.trim(),
          parseFloat(formData.shares),
          parseFloat(formData.buyPrice)
        );
      } else {
        await apiService.addStock(
          formData.ticker.trim(),
          parseFloat(formData.shares),
          parseFloat(formData.buyPrice)
        );
      }

      // Success - clear form and show success message
      setFormData({
        ticker: '',
        shares: '',
        buyPrice: '',
      });
      setValidationErrors({});
      setSuccessMessage(`Successfully added ${formData.ticker.toUpperCase()} to portfolio`);
    } catch (error) {
      // Display error message from API
      const errorMsg = error instanceof Error ? error.message : 'Failed to add stock';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-stock-form">
      <h2>Add Stock</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Ticker Input */}
        <div className="form-group">
          <label htmlFor="ticker">Ticker Symbol</label>
          <input
            type="text"
            id="ticker"
            name="ticker"
            value={formData.ticker}
            onChange={handleInputChange}
            placeholder="e.g., AAPL"
            disabled={isSubmitting}
            className={validationErrors.ticker ? 'error' : ''}
          />
          {validationErrors.ticker && (
            <span className="error-message">{validationErrors.ticker}</span>
          )}
        </div>

        {/* Shares Input */}
        <div className="form-group">
          <label htmlFor="shares">Number of Shares</label>
          <input
            type="number"
            id="shares"
            name="shares"
            value={formData.shares}
            onChange={handleInputChange}
            placeholder="e.g., 10"
            step="0.01"
            disabled={isSubmitting}
            className={validationErrors.shares ? 'error' : ''}
          />
          {validationErrors.shares && (
            <span className="error-message">{validationErrors.shares}</span>
          )}
        </div>

        {/* Buy Price Input */}
        <div className="form-group">
          <label htmlFor="buyPrice">Buy Price ($)</label>
          <input
            type="number"
            id="buyPrice"
            name="buyPrice"
            value={formData.buyPrice}
            onChange={handleInputChange}
            placeholder="e.g., 150.00"
            step="0.01"
            disabled={isSubmitting}
            className={validationErrors.buyPrice ? 'error' : ''}
          />
          {validationErrors.buyPrice && (
            <span className="error-message">{validationErrors.buyPrice}</span>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Stock'}
        </button>
      </form>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message" role="alert">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-message-box" role="alert">
          {errorMessage}
        </div>
      )}

      <style jsx>{`
        .add-stock-form {
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
          max-width: 400px;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 1.5rem;
          color: #333;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #555;
        }

        input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #4a90e2;
        }

        input.error {
          border-color: #e74c3c;
        }

        input:disabled {
          background-color: #f0f0f0;
          cursor: not-allowed;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.85rem;
          margin-top: -2px;
        }

        button {
          padding: 12px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button:hover:not(:disabled) {
          background-color: #357abd;
        }

        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .success-message {
          margin-top: 16px;
          padding: 12px;
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .error-message-box {
          margin-top: 16px;
          padding: 12px;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
