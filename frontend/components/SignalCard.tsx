/**
 * SignalCard Component
 * Displays trading signal (BUY/SELL/HOLD) with visual indicators
 * Requirements: 6.5, 6.6
 */

'use client';

import React from 'react';

interface SignalCardProps {
  signal: 'BUY' | 'SELL' | 'HOLD';
  trendPercentage: number;
  ticker: string;
  loading?: boolean;
  error?: string;
}

/**
 * SignalCard component displays trading recommendation
 * - BUY: Green background with up arrow
 * - SELL: Red background with down arrow
 * - HOLD: Yellow background with horizontal arrow
 */
export default function SignalCard({
  signal,
  trendPercentage,
  ticker,
  loading = false,
  error = '',
}: SignalCardProps) {
  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading signal...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading signal</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Determine styling based on signal type
  const getSignalStyles = () => {
    switch (signal) {
      case 'BUY':
        return {
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: '↑',
          description: 'Strong upward trend detected',
        };
      case 'SELL':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: '↓',
          description: 'Strong downward trend detected',
        };
      case 'HOLD':
        return {
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: '→',
          description: 'Stable trend, no strong movement',
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          icon: '?',
          description: 'Unknown signal',
        };
    }
  };

  const styles = getSignalStyles();
  const formattedPercentage = trendPercentage >= 0 
    ? `+${trendPercentage.toFixed(2)}%` 
    : `${trendPercentage.toFixed(2)}%`;

  return (
    <div className={`${styles.bgColor} rounded-lg shadow-md p-6 border-2 ${styles.borderColor}`}>
      <div className="flex items-center justify-between">
        {/* Signal Icon and Label */}
        <div className="flex items-center space-x-4">
          <div className={`text-5xl ${styles.iconColor} font-bold`}>
            {styles.icon}
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${styles.textColor}`}>
              {signal}
            </h3>
            <p className={`text-sm ${styles.textColor} opacity-80`}>
              {styles.description}
            </p>
          </div>
        </div>

        {/* Trend Percentage */}
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">7-Day Forecast</p>
          <p className={`text-3xl font-bold ${styles.textColor}`}>
            {formattedPercentage}
          </p>
          <p className="text-xs text-gray-500 mt-1">{ticker}</p>
        </div>
      </div>

      {/* Additional Info */}
      <div className={`mt-4 pt-4 border-t ${styles.borderColor}`}>
        <p className="text-xs text-gray-600">
          {signal === 'BUY' && 'Forecast shows price increase > 5%. Consider buying.'}
          {signal === 'SELL' && 'Forecast shows price decrease > 5%. Consider selling.'}
          {signal === 'HOLD' && 'Forecast shows price change between -5% and +5%. Hold position.'}
        </p>
      </div>
    </div>
  );
}
