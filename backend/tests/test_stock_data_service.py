"""
Unit tests for StockDataService.
"""

import pytest
import pandas as pd
from backend.services.stock_data_service import StockDataService


class TestStockDataService:
    """Test suite for StockDataService."""
    
    @pytest.fixture
    def service(self):
        """Create a fresh StockDataService instance for each test."""
        return StockDataService()
    
    def test_fetch_historical_data_valid_ticker(self, service):
        """Test fetching historical data for a valid ticker."""
        # Use a well-known ticker
        df = service.fetch_historical_data("AAPL", years=2)
        
        # Verify structure
        assert isinstance(df, pd.DataFrame)
        assert 'Date' in df.columns
        assert 'Close' in df.columns
        assert len(df) > 0
        
        # Verify data quality
        assert all(df['Close'] > 0)
        assert len(df) >= 30  # Should have at least 30 days
    
    def test_fetch_historical_data_invalid_ticker(self, service):
        """Test that invalid tickers raise appropriate errors."""
        with pytest.raises(ValueError) as exc_info:
            service.fetch_historical_data("INVALID_TICKER_XYZ123")
        
        assert "No data found" in str(exc_info.value) or "invalid" in str(exc_info.value).lower()
    
    def test_fetch_historical_data_empty_ticker(self, service):
        """Test that empty ticker raises ValueError."""
        with pytest.raises(ValueError) as exc_info:
            service.fetch_historical_data("")
        
        assert "cannot be empty" in str(exc_info.value)
    
    def test_validate_ticker_valid(self, service):
        """Test ticker validation with a valid ticker."""
        result = service.validate_ticker("AAPL")
        assert result is True
    
    def test_validate_ticker_invalid(self, service):
        """Test ticker validation with an invalid ticker."""
        result = service.validate_ticker("INVALID_XYZ123")
        assert result is False
    
    def test_validate_ticker_empty(self, service):
        """Test ticker validation with empty string."""
        result = service.validate_ticker("")
        assert result is False
    
    def test_caching_mechanism(self, service):
        """Test that caching works for repeated requests."""
        # First fetch
        df1 = service.fetch_historical_data("AAPL", years=2)
        
        # Second fetch (should be from cache)
        df2 = service.fetch_historical_data("AAPL", years=2)
        
        # Verify both return data
        assert len(df1) > 0
        assert len(df2) > 0
        
        # Verify they have the same length (cached result)
        assert len(df1) == len(df2)
    
    def test_clear_cache(self, service):
        """Test that cache can be cleared."""
        # Fetch data to populate cache
        service.fetch_historical_data("AAPL", years=2)
        
        # Clear cache
        service.clear_cache()
        
        # Cache should be empty
        assert len(service._cache) == 0
    
    def test_data_structure_correctness(self, service):
        """Test that returned data has correct structure."""
        df = service.fetch_historical_data("MSFT", years=1)
        
        # Check columns
        assert list(df.columns) == ['Date', 'Close']
        
        # Check data types
        assert pd.api.types.is_datetime64_any_dtype(df['Date'])
        assert pd.api.types.is_numeric_dtype(df['Close'])
        
        # Check for no null values
        assert df['Date'].notna().all()
        assert df['Close'].notna().all()
