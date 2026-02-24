"""
Unit tests for ForecastService.
"""

import pytest
import pandas as pd
from datetime import datetime, timedelta
from backend.services.forecast_service import (
    ForecastService,
    Signal,
    ForecastPoint,
    ForecastResult
)


@pytest.fixture
def forecast_service():
    """Create a ForecastService instance for testing."""
    return ForecastService()


@pytest.fixture
def sample_historical_data():
    """Create sample historical data for testing."""
    dates = pd.date_range(end=datetime.now(), periods=100, freq='D')
    prices = [100 + i * 0.5 for i in range(100)]  # Upward trend
    return pd.DataFrame({'Date': dates, 'Close': prices})


@pytest.fixture
def minimal_historical_data():
    """Create minimal historical data (30 days)."""
    dates = pd.date_range(end=datetime.now(), periods=30, freq='D')
    prices = [100 + i * 0.5 for i in range(30)]
    return pd.DataFrame({'Date': dates, 'Close': prices})


@pytest.fixture
def insufficient_historical_data():
    """Create insufficient historical data (< 30 days)."""
    dates = pd.date_range(end=datetime.now(), periods=20, freq='D')
    prices = [100 + i * 0.5 for i in range(20)]
    return pd.DataFrame({'Date': dates, 'Close': prices})


class TestForecastService:
    """Test suite for ForecastService."""
    
    def test_generate_forecast_success(self, forecast_service, sample_historical_data):
        """Test successful forecast generation."""
        result = forecast_service.generate_forecast(sample_historical_data, "AAPL")
        
        assert isinstance(result, ForecastResult)
        assert result.ticker == "AAPL"
        assert len(result.forecast_points) == 7
        assert isinstance(result.signal, Signal)
        assert isinstance(result.trend_percentage, float)
        assert result.current_price > 0
    
    def test_generate_forecast_with_minimal_data(self, forecast_service, minimal_historical_data):
        """Test forecast generation with exactly 30 days of data."""
        result = forecast_service.generate_forecast(minimal_historical_data, "TEST")
        
        assert isinstance(result, ForecastResult)
        assert len(result.forecast_points) == 7
    
    def test_generate_forecast_insufficient_data(self, forecast_service, insufficient_historical_data):
        """Test that insufficient data raises ValueError."""
        with pytest.raises(ValueError, match="Minimum 30 days required"):
            forecast_service.generate_forecast(insufficient_historical_data, "TEST")
    
    def test_generate_forecast_empty_data(self, forecast_service):
        """Test that empty data raises ValueError."""
        empty_df = pd.DataFrame()
        with pytest.raises(ValueError, match="Historical data cannot be empty"):
            forecast_service.generate_forecast(empty_df, "TEST")
    
    def test_generate_forecast_none_data(self, forecast_service):
        """Test that None data raises ValueError."""
        with pytest.raises(ValueError, match="Historical data cannot be empty"):
            forecast_service.generate_forecast(None, "TEST")
    
    def test_generate_forecast_missing_columns(self, forecast_service):
        """Test that missing required columns raises ValueError."""
        invalid_df = pd.DataFrame({'Wrong': [1, 2, 3], 'Columns': [4, 5, 6]})
        with pytest.raises(ValueError, match="must contain 'Date' and 'Close' columns"):
            forecast_service.generate_forecast(invalid_df, "TEST")
    
    def test_forecast_points_structure(self, forecast_service, sample_historical_data):
        """Test that forecast points have correct structure."""
        result = forecast_service.generate_forecast(sample_historical_data, "AAPL")
        
        for point in result.forecast_points:
            assert isinstance(point, ForecastPoint)
            assert isinstance(point.date, datetime)
            assert isinstance(point.predicted_price, float)
            assert isinstance(point.lower_bound, float)
            assert isinstance(point.upper_bound, float)
            # Confidence bounds should be ordered
            assert point.lower_bound <= point.predicted_price <= point.upper_bound
    
    def test_calculate_signal_buy(self, forecast_service):
        """Test BUY signal generation (> 5% increase)."""
        signal = forecast_service.calculate_signal(100.0, 110.0)  # 10% increase
        assert signal == Signal.BUY
    
    def test_calculate_signal_sell(self, forecast_service):
        """Test SELL signal generation (> 5% decrease)."""
        signal = forecast_service.calculate_signal(100.0, 90.0)  # 10% decrease
        assert signal == Signal.SELL
    
    def test_calculate_signal_hold_positive(self, forecast_service):
        """Test HOLD signal for small positive change."""
        signal = forecast_service.calculate_signal(100.0, 103.0)  # 3% increase
        assert signal == Signal.HOLD
    
    def test_calculate_signal_hold_negative(self, forecast_service):
        """Test HOLD signal for small negative change."""
        signal = forecast_service.calculate_signal(100.0, 97.0)  # 3% decrease
        assert signal == Signal.HOLD
    
    def test_calculate_signal_hold_no_change(self, forecast_service):
        """Test HOLD signal for no change."""
        signal = forecast_service.calculate_signal(100.0, 100.0)  # 0% change
        assert signal == Signal.HOLD
    
    def test_calculate_signal_boundary_buy(self, forecast_service):
        """Test signal at BUY boundary (exactly 5.01%)."""
        signal = forecast_service.calculate_signal(100.0, 105.01)
        assert signal == Signal.BUY
    
    def test_calculate_signal_boundary_sell(self, forecast_service):
        """Test signal at SELL boundary (exactly -5.01%)."""
        signal = forecast_service.calculate_signal(100.0, 94.99)
        assert signal == Signal.SELL
    
    def test_calculate_trend_percentage_positive(self, forecast_service):
        """Test trend percentage calculation for positive change."""
        trend = forecast_service.calculate_trend_percentage(100.0, 110.0)
        assert abs(trend - 10.0) < 0.01
    
    def test_calculate_trend_percentage_negative(self, forecast_service):
        """Test trend percentage calculation for negative change."""
        trend = forecast_service.calculate_trend_percentage(100.0, 90.0)
        assert abs(trend - (-10.0)) < 0.01
    
    def test_calculate_trend_percentage_zero_change(self, forecast_service):
        """Test trend percentage calculation for no change."""
        trend = forecast_service.calculate_trend_percentage(100.0, 100.0)
        assert abs(trend) < 0.01
    
    def test_calculate_trend_percentage_zero_current_price(self, forecast_service):
        """Test that zero current price raises ValueError."""
        with pytest.raises(ValueError, match="Current price cannot be zero"):
            forecast_service.calculate_trend_percentage(0.0, 100.0)
    
    def test_forecast_caching(self, forecast_service, sample_historical_data):
        """Test that forecasts are cached and reused."""
        # Generate first forecast
        result1 = forecast_service.generate_forecast(sample_historical_data, "CACHE_TEST")
        
        # Generate second forecast immediately (should be cached)
        result2 = forecast_service.generate_forecast(sample_historical_data, "CACHE_TEST")
        
        # Results should be identical (same object from cache)
        assert result1 is result2
        assert result1.ticker == result2.ticker
        assert len(result1.forecast_points) == len(result2.forecast_points)
    
    def test_clear_cache(self, forecast_service, sample_historical_data):
        """Test cache clearing functionality."""
        # Generate and cache a forecast
        result1 = forecast_service.generate_forecast(sample_historical_data, "CLEAR_TEST")
        
        # Clear cache
        forecast_service.clear_cache()
        
        # Generate again (should be new object)
        result2 = forecast_service.generate_forecast(sample_historical_data, "CLEAR_TEST")
        
        # Results should not be the same object
        assert result1 is not result2
    
    def test_forecast_result_to_dict(self, forecast_service, sample_historical_data):
        """Test ForecastResult serialization to dictionary."""
        result = forecast_service.generate_forecast(sample_historical_data, "DICT_TEST")
        result_dict = result.to_dict()
        
        assert isinstance(result_dict, dict)
        assert result_dict['ticker'] == "DICT_TEST"
        assert isinstance(result_dict['forecast_points'], list)
        assert len(result_dict['forecast_points']) == 7
        assert result_dict['signal'] in ['BUY', 'SELL', 'HOLD']
        assert isinstance(result_dict['trend_percentage'], float)
        assert isinstance(result_dict['current_price'], float)
    
    def test_forecast_point_to_dict(self):
        """Test ForecastPoint serialization to dictionary."""
        date = datetime(2024, 1, 1)
        point = ForecastPoint(
            date=date,
            predicted_price=100.0,
            lower_bound=95.0,
            upper_bound=105.0
        )
        
        point_dict = point.to_dict()
        
        assert isinstance(point_dict, dict)
        assert point_dict['date'] == date.isoformat()
        assert point_dict['predicted_price'] == 100.0
        assert point_dict['lower_bound'] == 95.0
        assert point_dict['upper_bound'] == 105.0
    
    def test_different_tickers_isolated(self, forecast_service, sample_historical_data):
        """Test that forecasts for different tickers are isolated."""
        # Create different data for two tickers
        data1 = sample_historical_data.copy()
        data2 = sample_historical_data.copy()
        data2['Close'] = data2['Close'] * 2  # Different prices
        
        result1 = forecast_service.generate_forecast(data1, "TICKER1")
        result2 = forecast_service.generate_forecast(data2, "TICKER2")
        
        # Results should be different
        assert result1.ticker != result2.ticker
        assert result1.current_price != result2.current_price
