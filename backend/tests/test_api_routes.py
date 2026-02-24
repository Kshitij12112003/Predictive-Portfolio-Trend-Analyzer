"""Unit tests for API route handlers."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.data.database_manager import DatabaseManager
from backend.services.portfolio_service import PortfolioService


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def clean_database():
    """Clean the database before and after each test."""
    from backend.main import portfolio_service
    portfolio_service.clear()
    yield
    portfolio_service.clear()


class TestRootEndpoint:
    """Tests for the root endpoint."""
    
    def test_root_endpoint(self, client):
        """Test that the root endpoint returns a welcome message."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "StockShelf API is running"}


class TestPortfolioEndpoints:
    """Tests for portfolio management endpoints."""
    
    def test_add_stock_success(self, client, clean_database):
        """Test adding a stock to the portfolio successfully."""
        response = client.post(
            "/api/portfolio/add",
            json={"ticker": "AAPL", "shares": 10.0, "buy_price": 150.0}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "AAPL" in data["message"]
        assert data["portfolio_item"]["ticker"] == "AAPL"
        assert data["portfolio_item"]["shares_owned"] == 10.0
        assert data["portfolio_item"]["average_buy_price"] == 150.0
    
    def test_add_stock_invalid_ticker_empty(self, client, clean_database):
        """Test adding a stock with empty ticker."""
        response = client.post(
            "/api/portfolio/add",
            json={"ticker": "", "shares": 10.0, "buy_price": 150.0}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    def test_add_stock_invalid_shares_negative(self, client, clean_database):
        """Test adding a stock with negative shares."""
        response = client.post(
            "/api/portfolio/add",
            json={"ticker": "AAPL", "shares": -10.0, "buy_price": 150.0}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    def test_add_stock_invalid_buy_price_zero(self, client, clean_database):
        """Test adding a stock with zero buy price."""
        response = client.post(
            "/api/portfolio/add",
            json={"ticker": "AAPL", "shares": 10.0, "buy_price": 0.0}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "VALIDATION_ERROR"
    
    def test_get_portfolio_empty(self, client, clean_database):
        """Test getting an empty portfolio."""
        response = client.get("/api/portfolio")
        
        assert response.status_code == 200
        data = response.json()
        assert "portfolio" in data
        assert data["portfolio"] == []
    
    def test_get_portfolio_with_stocks(self, client, clean_database):
        """Test getting portfolio with stocks."""
        # Add two stocks
        client.post(
            "/api/portfolio/add",
            json={"ticker": "AAPL", "shares": 10.0, "buy_price": 150.0}
        )
        client.post(
            "/api/portfolio/add",
            json={"ticker": "GOOGL", "shares": 5.0, "buy_price": 2800.0}
        )
        
        response = client.get("/api/portfolio")
        
        assert response.status_code == 200
        data = response.json()
        assert "portfolio" in data
        assert len(data["portfolio"]) == 2
        
        tickers = [item["ticker"] for item in data["portfolio"]]
        assert "AAPL" in tickers
        assert "GOOGL" in tickers
    
    def test_delete_stock_success(self, client, clean_database):
        """Test deleting a stock from portfolio."""
        # Add a stock first
        client.post(
            "/api/portfolio/add",
            json={"ticker": "AAPL", "shares": 10.0, "buy_price": 150.0}
        )
        
        # Delete it
        response = client.delete("/api/portfolio/AAPL")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "AAPL" in data["message"]
        
        # Verify it's gone
        portfolio_response = client.get("/api/portfolio")
        assert len(portfolio_response.json()["portfolio"]) == 0
    
    def test_delete_stock_not_found(self, client, clean_database):
        """Test deleting a stock that doesn't exist."""
        response = client.delete("/api/portfolio/NONEXISTENT")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert data["detail"]["error"]["code"] == "STOCK_NOT_FOUND"


class TestStockDataEndpoints:
    """Tests for stock data endpoints."""
    
    def test_get_stock_history_invalid_ticker(self, client):
        """Test getting history for an invalid ticker."""
        response = client.get("/api/stock/history/INVALIDTICKER123")
        
        # Should return 404 or 503 depending on yfinance behavior
        assert response.status_code in [404, 503]
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]
    
    def test_get_stock_forecast_invalid_ticker(self, client):
        """Test getting forecast for an invalid ticker."""
        response = client.get("/api/stock/forecast/INVALIDTICKER123")
        
        # Should return 422 or 503 depending on yfinance behavior
        assert response.status_code in [422, 503]
        data = response.json()
        assert "detail" in data
        assert "error" in data["detail"]


class TestErrorHandling:
    """Tests for error handling middleware."""
    
    def test_validation_error_format(self, client, clean_database):
        """Test that validation errors have consistent format."""
        response = client.post(
            "/api/portfolio/add",
            json={"ticker": "", "shares": -5.0, "buy_price": 0.0}
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "code" in data["error"]
        assert "message" in data["error"]
        assert "details" in data["error"]
        assert isinstance(data["error"]["details"], list)
