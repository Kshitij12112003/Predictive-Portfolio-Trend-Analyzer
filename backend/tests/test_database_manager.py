"""
Unit tests for DatabaseManager class.

Tests database initialization, connection handling, and query execution.
"""

import pytest
import sqlite3
import os
import tempfile
from backend.data.database_manager import DatabaseManager


@pytest.fixture
def temp_db():
    """Create a temporary database for testing."""
    temp_dir = tempfile.mkdtemp()
    db_path = os.path.join(temp_dir, "test.db")
    db_manager = DatabaseManager(db_path)
    yield db_manager
    db_manager.close()
    # Cleanup
    if os.path.exists(db_path):
        os.remove(db_path)
    os.rmdir(temp_dir)


def test_initialize_database_creates_table(temp_db):
    """Test that initialize_database creates the portfolio table."""
    temp_db.initialize_database()
    
    # Verify table exists by querying sqlite_master
    result = temp_db.execute_query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='portfolio'",
        fetch_one=True
    )
    
    assert result is not None
    assert result['name'] == 'portfolio'


def test_initialize_database_correct_schema(temp_db):
    """Test that the portfolio table has the correct schema."""
    temp_db.initialize_database()
    
    # Get table info
    result = temp_db.execute_query(
        "PRAGMA table_info(portfolio)",
        fetch_all=True
    )
    
    # Verify columns
    column_names = [col['name'] for col in result]
    assert 'id' in column_names
    assert 'ticker' in column_names
    assert 'shares_owned' in column_names
    assert 'average_buy_price' in column_names
    assert 'created_at' in column_names
    assert 'updated_at' in column_names


def test_get_connection_returns_connection(temp_db):
    """Test that get_connection returns a valid SQLite connection."""
    conn = temp_db.get_connection()
    
    assert conn is not None
    assert isinstance(conn, sqlite3.Connection)


def test_get_connection_reuses_connection(temp_db):
    """Test that get_connection reuses the same connection (connection pooling)."""
    conn1 = temp_db.get_connection()
    conn2 = temp_db.get_connection()
    
    assert conn1 is conn2


def test_execute_query_insert(temp_db):
    """Test execute_query for INSERT operations."""
    temp_db.initialize_database()
    
    # Insert a record
    lastrowid = temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("AAPL", 10.0, 150.0)
    )
    
    assert lastrowid > 0


def test_execute_query_fetch_one(temp_db):
    """Test execute_query with fetch_one parameter."""
    temp_db.initialize_database()
    
    # Insert a record
    temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("AAPL", 10.0, 150.0)
    )
    
    # Fetch the record
    result = temp_db.execute_query(
        "SELECT * FROM portfolio WHERE ticker = ?",
        ("AAPL",),
        fetch_one=True
    )
    
    assert result is not None
    assert result['ticker'] == 'AAPL'
    assert result['shares_owned'] == 10.0
    assert result['average_buy_price'] == 150.0


def test_execute_query_fetch_all(temp_db):
    """Test execute_query with fetch_all parameter."""
    temp_db.initialize_database()
    
    # Insert multiple records
    temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("AAPL", 10.0, 150.0)
    )
    temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("GOOGL", 5.0, 2800.0)
    )
    
    # Fetch all records
    results = temp_db.execute_query(
        "SELECT * FROM portfolio",
        fetch_all=True
    )
    
    assert len(results) == 2
    assert results[0]['ticker'] == 'AAPL'
    assert results[1]['ticker'] == 'GOOGL'


def test_execute_query_parameterized(temp_db):
    """Test that execute_query properly handles parameterized queries."""
    temp_db.initialize_database()
    
    # Insert with parameters
    temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("AAPL", 10.0, 150.0)
    )
    
    # Query with parameters
    result = temp_db.execute_query(
        "SELECT * FROM portfolio WHERE ticker = ? AND shares_owned = ?",
        ("AAPL", 10.0),
        fetch_one=True
    )
    
    assert result is not None
    assert result['ticker'] == 'AAPL'


def test_execute_query_update(temp_db):
    """Test execute_query for UPDATE operations."""
    temp_db.initialize_database()
    
    # Insert a record
    temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("AAPL", 10.0, 150.0)
    )
    
    # Update the record
    rowcount = temp_db.execute_query(
        "UPDATE portfolio SET shares_owned = ? WHERE ticker = ?",
        (20.0, "AAPL")
    )
    
    assert rowcount == 1
    
    # Verify update
    result = temp_db.execute_query(
        "SELECT shares_owned FROM portfolio WHERE ticker = ?",
        ("AAPL",),
        fetch_one=True
    )
    assert result['shares_owned'] == 20.0


def test_execute_query_delete(temp_db):
    """Test execute_query for DELETE operations."""
    temp_db.initialize_database()
    
    # Insert a record
    temp_db.execute_query(
        "INSERT INTO portfolio (ticker, shares_owned, average_buy_price) VALUES (?, ?, ?)",
        ("AAPL", 10.0, 150.0)
    )
    
    # Delete the record
    rowcount = temp_db.execute_query(
        "DELETE FROM portfolio WHERE ticker = ?",
        ("AAPL",)
    )
    
    assert rowcount == 1
    
    # Verify deletion
    result = temp_db.execute_query(
        "SELECT * FROM portfolio WHERE ticker = ?",
        ("AAPL",),
        fetch_one=True
    )
    assert result is None


def test_close_connection(temp_db):
    """Test that close() properly closes the connection."""
    conn = temp_db.get_connection()
    assert conn is not None
    
    temp_db.close()
    
    # After closing, _connection should be None
    assert temp_db._connection is None
