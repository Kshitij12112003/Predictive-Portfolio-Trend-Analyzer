"""
Unit tests for PortfolioService.

Tests CRUD operations including:
- Adding stocks with duplicate handling
- Retrieving portfolio holdings
- Removing stocks
- Updating stock holdings
- Average price calculation
"""

import pytest
import os
import tempfile
from backend.data.database_manager import DatabaseManager
from backend.services.portfolio_service import PortfolioService, PortfolioItem


@pytest.fixture
def db_manager():
    """Create a temporary database for testing."""
    # Create a temporary file for the test database
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    # Initialize database manager
    manager = DatabaseManager(db_path)
    manager.initialize_database()
    
    yield manager
    
    # Cleanup
    manager.close()
    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def portfolio_service(db_manager):
    """Create a PortfolioService instance with test database."""
    return PortfolioService(db_manager)


class TestPortfolioService:
    """Test suite for PortfolioService."""
    
    def test_add_stock_new(self, portfolio_service):
        """Test adding a new stock to empty portfolio."""
        result = portfolio_service.add_stock("AAPL", 10.0, 150.0)
        
        assert result is not None
        assert result.ticker == "AAPL"
        assert result.shares_owned == 10.0
        assert result.average_buy_price == 150.0
        assert result.id > 0
    
    def test_add_stock_duplicate_calculates_average(self, portfolio_service):
        """Test adding duplicate stock calculates correct average price."""
        # Add initial stock
        portfolio_service.add_stock("AAPL", 10.0, 100.0)
        
        # Add more shares at different price
        result = portfolio_service.add_stock("AAPL", 5.0, 130.0)
        
        # Expected: (100 * 10 + 130 * 5) / (10 + 5) = 1650 / 15 = 110.0
        assert result.ticker == "AAPL"
        assert result.shares_owned == 15.0
        assert abs(result.average_buy_price - 110.0) < 0.001
    
    def test_get_portfolio_empty(self, portfolio_service):
        """Test retrieving empty portfolio."""
        result = portfolio_service.get_portfolio()
        
        assert result == []
    
    def test_get_portfolio_multiple_stocks(self, portfolio_service):
        """Test retrieving portfolio with multiple stocks."""
        portfolio_service.add_stock("AAPL", 10.0, 150.0)
        portfolio_service.add_stock("GOOGL", 5.0, 2800.0)
        portfolio_service.add_stock("MSFT", 20.0, 300.0)
        
        result = portfolio_service.get_portfolio()
        
        assert len(result) == 3
        tickers = [item.ticker for item in result]
        assert "AAPL" in tickers
        assert "GOOGL" in tickers
        assert "MSFT" in tickers
    
    def test_remove_stock_existing(self, portfolio_service):
        """Test removing an existing stock."""
        portfolio_service.add_stock("AAPL", 10.0, 150.0)
        
        result = portfolio_service.remove_stock("AAPL")
        
        assert result is True
        portfolio = portfolio_service.get_portfolio()
        assert len(portfolio) == 0
    
    def test_remove_stock_nonexistent(self, portfolio_service):
        """Test removing a non-existent stock."""
        result = portfolio_service.remove_stock("NONEXISTENT")
        
        assert result is False
    
    def test_update_stock_existing(self, portfolio_service):
        """Test updating an existing stock."""
        portfolio_service.add_stock("AAPL", 10.0, 150.0)
        
        result = portfolio_service.update_stock("AAPL", 25.0, 160.0)
        
        assert result is not None
        assert result.ticker == "AAPL"
        assert result.shares_owned == 25.0
        assert result.average_buy_price == 160.0
    
    def test_update_stock_nonexistent(self, portfolio_service):
        """Test updating a non-existent stock."""
        result = portfolio_service.update_stock("NONEXISTENT", 10.0, 100.0)
        
        assert result is None
    
    def test_portfolio_roundtrip(self, portfolio_service):
        """Test adding and retrieving a stock (round-trip)."""
        # Add stock
        added = portfolio_service.add_stock("TSLA", 15.5, 250.75)
        
        # Retrieve portfolio
        portfolio = portfolio_service.get_portfolio()
        
        # Verify
        assert len(portfolio) == 1
        retrieved = portfolio[0]
        assert retrieved.ticker == "TSLA"
        assert abs(retrieved.shares_owned - 15.5) < 0.001
        assert abs(retrieved.average_buy_price - 250.75) < 0.001
    
    def test_clear_portfolio(self, portfolio_service):
        """Test clearing all stocks from portfolio."""
        portfolio_service.add_stock("AAPL", 10.0, 150.0)
        portfolio_service.add_stock("GOOGL", 5.0, 2800.0)
        
        portfolio_service.clear()
        
        result = portfolio_service.get_portfolio()
        assert len(result) == 0
    
    def test_average_price_calculation_multiple_additions(self, portfolio_service):
        """Test average price calculation with multiple additions."""
        # First addition: 10 shares at $100
        portfolio_service.add_stock("AAPL", 10.0, 100.0)
        
        # Second addition: 5 shares at $130
        result2 = portfolio_service.add_stock("AAPL", 5.0, 130.0)
        # After 2nd: (100*10 + 130*5) / (10+5) = 1650 / 15 = 110.0
        assert abs(result2.average_buy_price - 110.0) < 0.001
        
        # Third addition: 15 shares at $90
        result = portfolio_service.add_stock("AAPL", 15.0, 90.0)
        # After 3rd: (110*15 + 90*15) / (15+15) = 3000 / 30 = 100.0
        assert result.shares_owned == 30.0
        assert abs(result.average_buy_price - 100.0) < 0.001
    
    def test_portfolio_item_to_dict(self):
        """Test PortfolioItem to_dict conversion."""
        item = PortfolioItem(
            id=1,
            ticker="AAPL",
            shares_owned=10.0,
            average_buy_price=150.0,
            created_at="2024-01-01 00:00:00",
            updated_at="2024-01-01 00:00:00"
        )
        
        result = item.to_dict()
        
        assert result["id"] == 1
        assert result["ticker"] == "AAPL"
        assert result["shares_owned"] == 10.0
        assert result["average_buy_price"] == 150.0
    
    def test_portfolio_item_from_dict(self):
        """Test PortfolioItem from_dict conversion."""
        data = {
            "id": 1,
            "ticker": "AAPL",
            "shares_owned": 10.0,
            "average_buy_price": 150.0,
            "created_at": "2024-01-01 00:00:00",
            "updated_at": "2024-01-01 00:00:00"
        }
        
        item = PortfolioItem.from_dict(data)
        
        assert item.id == 1
        assert item.ticker == "AAPL"
        assert item.shares_owned == 10.0
        assert item.average_buy_price == 150.0
