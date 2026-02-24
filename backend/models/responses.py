"""Response models for StockShelf API."""

from datetime import datetime
from typing import List
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class Signal(str, Enum):
    """Trading signal enumeration."""
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class PortfolioItem(BaseModel):
    """Response model for a portfolio item."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: int = Field(..., description="Unique identifier")
    ticker: str = Field(..., description="Stock ticker symbol")
    shares_owned: float = Field(..., description="Number of shares owned")
    average_buy_price: float = Field(..., description="Average buy price per share")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class PricePoint(BaseModel):
    """Model for a single historical price data point."""
    
    date: datetime = Field(..., description="Date of the price")
    close: float = Field(..., description="Closing price")


class HistoricalDataResponse(BaseModel):
    """Response model for historical stock data."""
    
    ticker: str = Field(..., description="Stock ticker symbol")
    data: List[PricePoint] = Field(..., description="List of historical price points")


class ForecastPoint(BaseModel):
    """Model for a single forecast data point."""
    
    date: datetime = Field(..., description="Forecast date")
    predicted_price: float = Field(..., description="Predicted price")
    lower_bound: float = Field(..., description="Lower confidence bound")
    upper_bound: float = Field(..., description="Upper confidence bound")


class ForecastResponse(BaseModel):
    """Response model for stock forecast data."""
    
    ticker: str = Field(..., description="Stock ticker symbol")
    forecast: List[ForecastPoint] = Field(..., description="List of forecast points")
    signal: Signal = Field(..., description="Trading signal (BUY/SELL/HOLD)")
    trend_percentage: float = Field(..., description="Percentage change from current to forecast")
    current_price: float = Field(..., description="Current stock price")
