# Running the Dashboard Analytics Application

## Quick Start (2 minutes)

### Terminal 1: Start Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Edit .env and add your GOOGLE_API_KEY
echo "GOOGLE_API_KEY=your_key_here" > .env

python -m uvicorn main:app --reload
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 3: Run Demo (optional)
```bash
python demo.py
```

Then visit: **http://localhost:5173/**

---

## Demo Queries

The application is pre-loaded with 100+ rows of sales data across 2023-2024.

### Example 1: Simple Aggregation
```
"Show me total revenue by region"
```
- **What it does**: Sums revenue grouped by region
- **Chart type**: Bar chart
- **Expected result**: 4 bars (North, South, East, West)

### Example 2: Time Series
```
"Monthly sales trends for Q3"
```
- **What it does**: Shows revenue trend over months
- **Chart type**: Line chart
- **Expected result**: Line showing 3 months of data

### Example 3: Top Products
```
"Top 5 product categories by revenue in 2024"
```
- **What it does**: Ranks products and filters by year
- **Chart type**: Bar or Pie chart
- **Expected result**: Breakdown of top categories

---

## Key Features to Try

### 1. Natural Language
Type any business question:
- "What were our best-selling products?"
- "Show revenue trends by month"
- "Compare sales between regions"

### 2. CSV Upload
- Click "Upload CSV"
- Select your data file
- Run queries on it immediately

### 3. Interactive Charts
- Hover for details
- Zoom/pan on line charts
- Click legend items to filter

### 4. View SQL
- Click "View SQL Query" to see generated SQL
- Understand how AI interprets your question

### 5. Statistics
- See total, average, and record count
- Quick insights from any dashboard

---

## Troubleshooting

**Issue**: Can't connect to API
**Fix**: Ensure backend is running on http://localhost:8000

**Issue**: No data appears
**Fix**: Check if sample_sales.csv exists in data/ directory

**Issue**: Gemini API errors
**Fix**: Verify GOOGLE_API_KEY is set in backend/.env

**Issue**: Port already in use
**Fix**: 
```bash
# Use different port
python -m uvicorn main:app --port 8001
npm run dev -- --port 3000
```

---

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  React + Vite + Recharts
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/REST
         │
    ┌────┴─────────────┐
    │  FastAPI Backend │  Python + FastAPI
    │   (Port 8000)    │
    └────┬─────────────┘
         │
    ┌────┴──────┬──────────┬──────────┐
    │            │          │          │
┌───▼───┐ ┌─────▼────┐ ┌────▼────┐ ┌─▼─────────┐
│SQLite │ │ Gemini   │ │  Pandas │ │ CSV Files │
│  DB   │ │   API    │ │ Queries │ │           │
└───────┘ └──────────┘ └─────────┘ └───────────┘
```

---

## Performance Targets

- ⚡ Query execution: < 1 second
- ⚡ AI processing: 2-4 seconds
- ⚡ Chart rendering: < 500ms
- ⚡ Total dashboard: < 5 seconds

---

## API Endpoints (for testing)

### Basic Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Get schema
curl http://localhost:8000/schema

# Get sample queries
curl http://localhost:8000/sample-queries
```

### Query Endpoints
```bash
# Simple query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me total revenue by region"}'

# Upload CSV
curl -X POST http://localhost:8000/upload-csv \
  -F "file=@your_data.csv"
```

### View Interactive Docs
Open: **http://localhost:8000/docs**

---

## Next Steps

1. ✅ Get frontend and backend running
2. ✅ Try the 3 example queries
3. ✅ Test with your own questions
4. ✅ Upload your own data
5. ✅ Deploy to production

---

## Support

- Comprehensive README: See [README.md](README.md)
- Setup Guide: See [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Backend Docs: See [backend/README.md](backend/README.md)
- Frontend Docs: See [frontend/README.md](frontend/README.md)

Happy exploring! 🚀
