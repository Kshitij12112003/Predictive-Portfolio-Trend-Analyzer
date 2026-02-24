"""Request models for StockShelf API."""

from pydantic import BaseModel, Field, field_validator


class AddStockRequest(BaseModel):
    """Request model for adding a stock to the portfolio."""
    
    ticker: str = Field(..., description="Stock ticker symbol")
    shares: float = Field(..., description="Number of shares owned")
    buy_price: float = Field(..., description="Average buy price per share")
    
    @field_validator('ticker')
    @classmethod
    def validate_ticker_not_empty(cls, v: str) -> str:
        """Validate that ticker is not empty or whitespace-only."""
        if not v or not v.strip():
            raise ValueError("Ticker cannot be empty or whitespace-only")
        return v.strip().upper()
    
    @field_validator('shares')
    @classmethod
    def validate_shares_positive(cls, v: float) -> float:
        """Validate that shares is a positive number."""
        if v <= 0:
            raise ValueError("Shares must be a positive number")
        return v
    
    @field_validator('buy_price')
    @classmethod
    def validate_buy_price_positive(cls, v: float) -> float:
        """Validate that buy_price is a positive number."""
        if v <= 0:
            raise ValueError("Buy price must be a positive number")
        return v
