/**
 * StockChart Component
 * Displays historical stock prices and forecast predictions using Plotly
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PricePoint, ForecastPoint } from '@/types';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface StockChartProps {
  ticker: string;
  historicalData: PricePoint[];
  forecastData: ForecastPoint[];
  loading?: boolean;
  error?: string;
}

/**
 * StockChart component renders an interactive Plotly chart
 * - Historical prices as a blue line
 * - Forecast predictions as a dashed orange line
 * - Confidence bounds as a shaded area
 * - Interactive zoom, pan, and hover tooltips
 */
export default function StockChart({
  ticker,
  historicalData,
  forecastData,
  loading = false,
  error = '',
}: StockChartProps) {
  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading chart</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Handle empty data state
  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available. Select a stock to view its chart.</p>
      </div>
    );
  }

  // Prepare historical data trace
  const historicalTrace = {
    x: historicalData.map((point) => point.date),
    y: historicalData.map((point) => point.close),
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: 'Historical Price',
    line: {
      color: '#2563eb', // blue-600
      width: 2,
    },
    hovertemplate: '<b>Date:</b> %{x}<br><b>Price:</b> $%{y:.2f}<extra></extra>',
  };

  const traces: any[] = [historicalTrace];

  // Add forecast data if available
  if (forecastData && forecastData.length > 0) {
    // Forecast line trace
    const forecastTrace = {
      x: forecastData.map((point) => point.date),
      y: forecastData.map((point) => point.predictedPrice),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'Forecast',
      line: {
        color: '#f97316', // orange-500
        width: 2,
        dash: 'dash',
      },
      hovertemplate: '<b>Date:</b> %{x}<br><b>Forecast:</b> $%{y:.2f}<extra></extra>',
    };

    // Upper confidence bound trace
    const upperBoundTrace = {
      x: forecastData.map((point) => point.date),
      y: forecastData.map((point) => point.upperBound),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'Upper Bound',
      line: {
        color: 'rgba(249, 115, 22, 0.2)', // transparent orange
        width: 0,
      },
      showlegend: false,
      hoverinfo: 'skip' as const,
    };

    // Lower confidence bound trace with fill
    const lowerBoundTrace = {
      x: forecastData.map((point) => point.date),
      y: forecastData.map((point) => point.lowerBound),
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'Confidence Interval',
      fill: 'tonexty' as const,
      fillcolor: 'rgba(249, 115, 22, 0.2)', // transparent orange
      line: {
        color: 'rgba(249, 115, 22, 0.2)', // transparent orange
        width: 0,
      },
      hovertemplate: '<b>Date:</b> %{x}<br><b>Lower:</b> $%{y:.2f}<extra></extra>',
    };

    traces.push(upperBoundTrace, lowerBoundTrace, forecastTrace);
  }

  // Chart layout configuration
  const layout = {
    title: {
      text: `${ticker} - Stock Price Chart`,
      font: {
        size: 20,
        color: '#1f2937', // gray-800
      },
    },
    xaxis: {
      title: {
        text: 'Date',
      },
      type: 'date' as const,
      gridcolor: '#e5e7eb', // gray-200
    },
    yaxis: {
      title: {
        text: 'Price (USD)',
      },
      gridcolor: '#e5e7eb', // gray-200
      tickformat: '$.2f',
    },
    hovermode: 'x unified' as const,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: {
      l: 60,
      r: 30,
      t: 60,
      b: 60,
    },
    legend: {
      x: 0,
      y: 1,
      xanchor: 'left' as const,
      yanchor: 'top' as const,
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#e5e7eb',
      borderwidth: 1,
    },
  };

  // Chart configuration for interactivity
  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d' as const, 'select2d' as const],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png' as const,
      filename: `${ticker}_chart`,
      height: 600,
      width: 1000,
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '500px' }}
        useResizeHandler={true}
      />
    </div>
  );
}
