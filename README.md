# Predictive-Portfolio-Trend-Analyzer
# 📈 StockShelf

A local stock portfolio tracking and forecasting dashboard that enables you to monitor personal stock investments and predict price trends using Prophet time series forecasting.

## Features

- **Portfolio Management**: Add, view, and remove stocks from your personal portfolio
- **Historical Data**: Fetch and visualize 2 years of historical stock prices
- **Price Forecasting**: Generate 7-day price predictions using Facebook Prophet
- **Trading Signals**: Get BUY/SELL/HOLD recommendations based on forecast trends
- **Interactive Charts**: Explore data with zoom, pan, and hover tooltips using Plotly
- **Local Storage**: All portfolio data stored locally in SQLite database
- **No External Dependencies**: Runs entirely on localhost (except for fetching stock data)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  - React components with TypeScript                          │
│  - Plotly.js for interactive charts                          │
│  - Axios for API communication                               │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  - yfinance: Fetch stock data from Yahoo Finance            │
│  - Prophet: Time series forecasting                          │
│  - SQLite: Local portfolio storage                           │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **pip** (Python package manager)
- **npm** (Node.js package manager)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. The SQLite database will be created automatically on first run.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate virtual environment (if using one):
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

You can view the API documentation at `http://localhost:8000/docs`

### Start the Frontend Development Server

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Start the Next.js development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### Adding Stocks to Your Portfolio

1. In the sidebar, enter the stock ticker symbol (e.g., "AAPL", "GOOGL")
2. Enter the number of shares you own
3. Enter your average buy price per share
4. Click "Add Stock"

The stock will be added to your portfolio list below the form.

### Viewing Stock Data and Forecasts

1. Click on any stock in your portfolio list
2. The main dashboard will display:
   - **Signal Card**: Trading recommendation (BUY/SELL/HOLD) with trend percentage
   - **Stock Chart**: Historical prices (blue line) and 7-day forecast (orange dashed line)
   - **Confidence Interval**: Shaded area showing forecast uncertainty

### Understanding Trading Signals

- **BUY (Green)**: Forecast shows price increase > 5%
- **SELL (Red)**: Forecast shows price decrease > 5%
- **HOLD (Yellow)**: Forecast shows price change between -5% and +5%

### Removing Stocks

Click the "Delete" button next to any stock in your portfolio list to remove it.

## API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/portfolio/add` - Add a stock to portfolio
- `GET /api/portfolio` - Get all portfolio holdings
- `DELETE /api/portfolio/{ticker}` - Remove a stock from portfolio
- `GET /api/stock/history/{ticker}` - Get historical price data
- `GET /api/stock/forecast/{ticker}` - Get 7-day forecast and trading signal

Full API documentation is available at `http://localhost:8000/docs` when the backend is running.

## Project Structure

```
stockshelf/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── models.py               # Pydantic data models
│   ├── data/
│   │   └── database_manager.py # SQLite database management
│   ├── services/
│   │   ├── portfolio_service.py    # Portfolio CRUD operations
│   │   ├── stock_data_service.py   # Stock data fetching
│   │   └── forecast_service.py     # Prophet forecasting
│   ├── tests/                  # Backend unit and property tests
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main dashboard page
│   ├── components/
│   │   ├── AddStockForm.tsx    # Stock addition form
│   │   ├── PortfolioList.tsx   # Portfolio display
│   │   ├── StockChart.tsx      # Plotly chart component
│   │   ├── SignalCard.tsx      # Trading signal display
│   │   └── AppLayout.tsx       # Main layout component
│   ├── services/
│   │   └── ApiService.ts       # Backend API client
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── package.json            # Node.js dependencies
│
└── README.md                   # This file
```

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` when starting backend
- **Solution**: Make sure you've activated the virtual environment and installed all dependencies:
  ```bash
  source venv/bin/activate
  pip install -r requirements.txt
  ```

**Problem**: Database errors on startup
- **Solution**: Delete the `portfolio.db` file and restart the backend. The database will be recreated automatically.

**Problem**: yfinance fails to fetch stock data
- **Solution**: 
  - Check your internet connection
  - Verify the ticker symbol is valid
  - Yahoo Finance may be temporarily unavailable - try again later

**Problem**: Prophet model training fails
- **Solution**: 
  - Ensure the stock has sufficient historical data (at least 30 days)
  - Some stocks may have irregular trading patterns that Prophet cannot model

### Frontend Issues

**Problem**: "Unable to connect to the server" error
- **Solution**: Make sure the backend is running on `http://localhost:8000`

**Problem**: Chart not displaying
- **Solution**: 
  - Check browser console for errors
  - Ensure Plotly.js is properly installed: `npm install`
  - Try refreshing the page

**Problem**: Build errors with Next.js
- **Solution**: 
  - Delete `.next` folder and `node_modules`
  - Reinstall dependencies: `npm install`
  - Rebuild: `npm run dev`

### General Issues

**Problem**: Port already in use
- **Solution**: 
  - Backend (8000): Kill the process using port 8000 or change the port in `main.py`
  - Frontend (3000): Kill the process using port 3000 or use `npm run dev -- -p 3001`

**Problem**: Slow forecast generation
- **Solution**: 
  - Prophet model training can take 10-30 seconds for the first forecast
  - Subsequent forecasts for the same stock are cached for 5 minutes
  - Consider using stocks with cleaner historical data

## Testing

### Backend Tests

Run backend tests:
```bash
cd backend
pytest
```

Run with coverage:
```bash
pytest --cov=. --cov-report=html
```

### Frontend Tests

Run frontend tests:
```bash
cd frontend
npm test
```

## Technologies Used

### Backend
- **FastAPI**: Modern Python web framework
- **yfinance**: Yahoo Finance data fetching
- **Prophet**: Facebook's time series forecasting
- **SQLite**: Lightweight embedded database
- **Pandas**: Data manipulation
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Plotly.js**: Interactive charting
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS (via Next.js)

## License

This project is for educational purposes.

## Contributing

This is a personal project. Feel free to fork and modify for your own use.

## Acknowledgments

- Yahoo Finance for providing stock market data via yfinance
- Facebook for the Prophet forecasting library
- The open-source community for all the amazing tools and libraries
