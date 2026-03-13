# Dashboard Analytics - Conversational AI for Business Intelligence

A fully functional web application that allows non-technical users to generate interactive data dashboards from natural language queries using AI.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi)
![Recharts](https://img.shields.io/badge/Recharts-2.10-purple?logo=recharts)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?logo=tailwindcss)

## Features

✨ **Natural Language Queries** - Ask questions in plain English
🤖 **AI-Powered Translation** - Google Gemini API converts queries to SQL
📊 **Auto Chart Selection** - Intelligently selects the best visualization (line, bar, pie, scatter, table)
🎨 **Beautiful UI** - Modern, responsive design with interactive charts
📁 **CSV Upload** - Upload your own data and query it
⚡ **Real-time Processing** - Dashboards generate in under 5 seconds
🔒 **Secure** - API keys stored in environment variables
📱 **Fully Responsive** - Works on desktop, tablet, and mobile

## Technology Stack

### Frontend
- **React 18** with Vite
- **Recharts** for interactive visualizations
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **Pandas** - Data manipulation
- **Google Generative AI** - Gemini LLM integration

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd B_Analytics/backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file with your API key:
```bash
cp .env.example .env
# Edit .env and add your Google Gemini API key
```

5. Run the server:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
Interactive docs at: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd B_Analytics/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## Usage Examples

### Query Examples

1. **Simple Aggregation**
   - "Show me total revenue by region"
   - Expected: Bar chart with regions on x-axis, total revenue on y-axis

2. **Time Series**
   - "What were the monthly sales trends in Q3?"
   - Expected: Line chart showing revenue over time

3. **Multi-faceted Analysis**
   - "Top 5 product categories by revenue shown as a bar chart"
   - Expected: Bar chart with top 5 categories

4. **Comparative Analysis**
   - "Compare electronics sales across all regions"
   - Expected: Grouped bar chart or table

5. **Aggregate with Filter**
   - "Revenue by product category in the North region"
   - Expected: Pie or bar chart showing category breakdown

### Sample Dataset

The system comes with a sample sales dataset (`data/sample_sales.csv`) containing:
- **Date Range**: Jan 2023 - Dec 2024
- **Regions**: North, South, East, West
- **Product Categories**: Electronics, Furniture, Clothing, Food
- **Metrics**: Revenue, Units Sold
- **Records**: 100+ rows with quarterly breakdown

Fields: `date`, `region`, `product_category`, `revenue`, `units_sold`, `quarter`

## API Documentation

### Endpoints

#### GET `/health`
Health check endpoint
```bash
curl http://localhost:8000/health
```

#### GET `/schema`
Get current data schema
```bash
curl http://localhost:8000/schema
```

#### POST `/query`
Process natural language query
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me total revenue by region"}'
```

#### POST `/upload-csv`
Upload and load a CSV file
```bash
curl -X POST http://localhost:8000/upload-csv \
  -F "file=@your_file.csv"
```

#### GET `/sample-queries`
Get suggested queries
```bash
curl http://localhost:8000/sample-queries
```

## Response Format

Query responses include:
```json
{
  "success": true,
  "title": "Revenue by Region",
  "description": "Total revenue for each region in 2024",
  "chart_type": "bar",
  "data": [...],
  "x_axis": "region",
  "y_axis": "revenue",
  "sql_query": "SELECT region, SUM(revenue) as revenue FROM sales GROUP BY region"
}
```

## Prompt Engineering Details

The system uses carefully crafted prompts to ensure:
- ✅ Accurate SQL generation
- ✅ Appropriate chart type selection
- ✅ Ambiguity resolution
- ✅ Hallucination prevention
- ✅ Schema understanding

### Key Prompt Rules
1. Always generate valid SQL with LOWER() for case-insensitive comparisons
2. Handle ambiguity by making reasonable assumptions
3. Never hallucinate - only query existing data
4. For time series, use DATE() and ORDER BY date
5. For categorical data, use GROUP BY and ORDER BY aggregates

## Chart Types Supported

| Chart Type | Best For | Example |
|-----------|----------|---------|
| **Line** | Time series trends | Monthly revenue over time |
| **Bar** | Categorical comparisons | Revenue by region |
| **Pie/Donut** | Parts of a whole | Product category breakdown |
| **Scatter** | Correlations | Revenue vs Units Sold |
| **Table** | Detailed data | Raw record view |

## Error Handling

The system handles:
- ❌ Vague queries with clarification suggestions
- ❌ Invalid SQL with error messages
- ❌ Non-existent columns with friendly feedback
- ❌ Network errors with reconnection prompts
- ❌ File size limits on CSV uploads (10MB default)

## Performance Optimizations

- ⚡ Query execution: < 1 second
- ⚡ AI processing: < 3 seconds
- ⚡ Chart rendering: < 500ms
- ⚡ Total dashboard generation: < 5 seconds

## Deployment

### Docker Setup

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

### Manual Deployment

**Backend (Production):**
```bash
pip install -r requirements.txt
gunicorn main:app -w 4 -b 0.0.0.0:8000
```

**Frontend (Production Build):**
```bash
npm run build
npm install -g serve
serve -s dist -l 3000
```

## Environment Variables

### Backend (.env)
```env
GOOGLE_API_KEY=your_gemini_api_key
DATABASE_URL=sqlite:///./dashboard.db
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
DEBUG=true
```

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:8000
```

## Project Structure

```
B_Analytics/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── gemini_integration.py   # LLM integration
│   ├── data_processor.py       # Data handling
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── QueryInput.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ChartRenderer.jsx
│   │   │   └── SampleQueries.jsx
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── App.jsx             # Main component
│   │   └── index.css           # Styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── data/
│   └── sample_sales.csv        # Sample dataset
└── README.md
```

## Troubleshooting

### Backend won't start
- Check if port 8000 is available: `lsof -i :8000`
- Verify Python version: `python --version`
- Check .env file has GOOGLE_API_KEY set

### Frontend won't connect
- Ensure backend is running on http://localhost:8000
- Check CORS settings in backend/config.py
- Clear browser cache (Ctrl+Shift+Delete)

### No data appears
- Verify sample_sales.csv exists in data/ directory
- Check for SQL errors in browser console
- Try a simpler query first

### Gemini API errors
- Verify API key is valid
- Check rate limits at https://console.cloud.google.com
- Try regenerating the API key

## Future Enhancements

- 🎯 Real-time data source connections
- 🎯 Advanced filtering and drill-downs
- 🎯 Dashboard export (PDF, PNG)
- 🎯 Multi-query aggregation
- 🎯 Query history and favorites
- 🎯 Collaborative dashboard sharing
- 🎯 Custom metrics and KPIs
- 🎯 Automated insights and anomaly detection

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

---

Built with ❤️ using React, FastAPI, and Google Gemini
