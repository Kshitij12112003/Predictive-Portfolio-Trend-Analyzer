"""Unit tests for Pydantic models."""

import pytest
from datetime import datetime
from pydantic import ValidationError
from models import (
    AddStockRequest,
    PortfolioItem,
    HistoricalDataResponse,
    ForecastResponse,
    PricePoint,
    ForecastPoint,
    Signal
)


class TestAddStockRequest:
    """Tests for AddStockRequest model."""
    
    def test_valid_request(self):
        """Test creating a valid AddStockRequest."""
        request = AddStockRequest(
            ticker="AAPL",
            shares=10.5,
            buy_price=150.25
        )
        assert request.ticker == "AAPL"
        assert request.shares == 10.5
        assert request.buy_price == 150.25
    
    def test_ticker_uppercase_conversion(self):
        """Test that ticker is converted to uppercase."""
        request = AddStockRequest(
            ticker="aapl",
            shares=10,
            buy_price=150
        )
        assert request.ticker == "AAPL"
    
    def test_empty_ticker_rejected(self):
        """Test that empty ticker is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            AddStockRequest(ticker="", shares=10, buy_price=150)
        assert "Ticker cannot be empty" in str(exc_info.value)
    
    def test_whitespace_ticker_rejected(self):
        """Test that whitespace-only ticker is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            AddStockRequest(ticker="   ", shares=10, buy_price=150)
        assert "Ticker cannot be empty" in str(exc_info.value)
    
    def test_zero_shares_rejected(self):
        """Test that zero shares is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            AddStockRequest(ticker="AAPL", shares=0, buy_price=150)
        assert "Shares must be a positive number" in str(exc_info.value)
    
    def test_negative_shares_rejected(self):
        """Test that negative shares is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            AddStockRequest(ticker="AAPL", shares=-5, buy_price=150)
        assert "Shares must be a positive number" in str(exc_info.value)
    
    def test_zero_buy_price_rejected(self):
        """Test that zero buy price is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            AddStockRequest(ticker="AAPL", shares=10, buy_price=0)
        assert "Buy price must be a positive number" in str(exc_info.value)
    
    def test_negative_buy_price_rejected(self):
        """Test that negative buy price is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            AddStockRequest(ticker="AAPL", shares=10, buy_price=-150)
        assert "Buy price must be a positive number" in str(exc_info.value)


class TestPortfolioItem:
    """Tests for PortfolioItem model."""
    
    def test_valid_portfolio_item(self):
        """Test creating a valid PortfolioItem."""
        now = datetime.now()
        item = PortfolioItem(
            id=1,
            ticker="AAPL",
            shares_owned=10.5,
            average_buy_price=150.25,
            created_at=now,
            updated_at=now
        )
        assert item.id == 1
        assert item.ticker == "AAPL"
        assert item.shares_owned == 10.5
        assert item.average_buy_price == 150.25


class TestHistoricalDataResponse:
    """Tests for HistoricalDataResponse model."""
    
    def test_valid_historical_data(self):
        """Test creating a valid HistoricalDataResponse."""
        now = datetime.now()
        response = HistoricalDataResponse(
            ticker="AAPL",
            data=[
                PricePoint(date=now, close=150.0),
                PricePoint(date=now, close=151.0)
            ]
        )
        assert response.ticker == "AAPL"
        assert len(response.data) == 2
        assert response.data[0].close == 150.0


class TestForecastResponse:
    """Tests for ForecastResponse model."""
    
    def test_valid_forecast_response(self):
        """Test creating a valid ForecastResponse."""
        now = datetime.now()
        response = ForecastResponse(
            ticker="AAPL",
            forecast=[
                ForecastPoint(
                    date=now,
                    predicted_price=155.0,
                    lower_bound=150.0,
                    upper_bound=160.0
                )
            ],
            signal=Signal.BUY,
            trend_percentage=3.5,
            current_price=150.0
        )
        assert response.ticker == "AAPL"
        assert len(response.forecast) == 1
        assert response.signal == Signal.BUY
        assert response.trend_percentage == 3.5
        assert response.current_price == 150.0
