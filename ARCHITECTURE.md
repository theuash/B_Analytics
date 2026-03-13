# Architecture - Dashboard Analytics

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
│  React 18 + Vite + Recharts + Tailwind CSS (Port 5173)         │
├─────────────────────────────────────────────────────────────────┤
│  - QueryInput Component                                         │
│  - Dashboard Component                                          │
│  - ChartRenderer (Recharts)                                     │
│  - SampleQueries Component                                      │
│  - API Client Service (Axios)                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    HTTP/REST/JSON
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                        API Layer                                │
│  FastAPI + Python (Port 8000)                                   │
├─────────────────────────────────────────────────────────────────┤
│  Endpoints:                                                     │
│  - POST /query - Process natural language query                │
│  - POST /upload-csv - Handle file uploads                      │
│  - GET /schema - Return database schema                        │
│  - GET /sample-queries - Return example queries                │
│  - GET /health - Health check                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    Python Functions
                         │
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
  ┌────────┐      ┌──────────────┐    ┌──────────────┐
  │ Gemini │      │ Data         │    │ Config &     │
  │ AI LLM │      │ Processor    │    │ Auth         │
  │        │      │              │    │              │
  │ Query  │      │ SQL Query    │    │ CORS Setup   │
  │ Trans- │      │ Executor     │    │ Env Vars     │
  │ lator  │      │              │    │              │
  └────────┘      │ CSV Handler  │    │ Rate Limit   │
                  │              │    │ (Future)     │
                  └──────┬───────┘    └──────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   SQLite Database      │
            │   dashboard.db         │
            │                        │
            │  Table: sales          │
            │  - date                │
            │  - region              │
            │  - product_category    │
            │  - revenue             │
            │  - units_sold          │
            │  - quarter             │
            └────────────────────────┘
```

## Component Architecture

### Frontend Structure

```
src/
├── App.jsx                          # Main application component
│   ├── State management (query, result, loading, error)
│   ├── Header with API status
│   ├── Hero section with intro
│   └── Query input and results routing
│
├── components/
│   ├── QueryInput.jsx              # Text input + file upload
│   │   ├── Natural language textarea
│   │   ├── Submit button with loading state
│   │   └── CSV file upload
│   │
│   ├── Dashboard.jsx               # Results display container
│   │   ├── Loading state
│   │   ├── Error alert
│   │   ├── Chart display
│   │   ├── Query info (SQL shown)
│   │   └── Statistics cards
│   │
│   ├── ChartRenderer.jsx           # Dynamic chart selection
│   │   ├── Line chart (time series)
│   │   ├── Bar chart (categories)
│   │   ├── Pie chart (proportions)
│   │   ├── Scatter plot (correlation)
│   │   └── Table view (details)
│   │
│   ├── SampleQueries.jsx           # Suggestion component
│   │   ├── Sample query display
│   │   ├── One-click selection
│   │   └── Collapsible suggestions
│   │
│   └── ParallaxHeader.jsx          # 3D parallax intro
│       ├── Mouse tracking
│       ├── Animated background
│       └── Scroll detection
│
├── services/
│   └── api.js                      # HTTP client wrapper
│       ├── Base URL configuration
│       ├── health check
│       ├── Query submission
│       ├── CSV upload
│       └── Error handling
│
├── index.css                       # Global styles + animations
└── main.jsx                        # React root render
```

### Backend Structure

```
backend/
├── main.py                         # FastAPI application
│   ├── CORS configuration
│   ├── Routes (query, upload, schema, etc.)
│   ├── Request/response models
│   └── Error handling middleware
│
├── config.py                       # Configuration loader
│   ├── Environment variables
│   ├── API keys
│   ├── Database URL
│   └── CORS origins
│
├── gemini_integration.py           # AI query building
│   ├── GeminiQueryBuilder class
│   ├── Prompt engineering
│   ├── JSON extraction
│   ├── Response validation
│   └── Error recovery
│
├── data_processor.py               # Data handling
│   ├── CSV loading
│   ├── SQLite creation
│   ├── SQL execution
│   ├── Schema extraction
│   └── Pandas operations
│
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment template
└── /dashboard.db                   # SQLite database (auto-created)
```

## Data Flow

### Query Processing Pipeline

```
                             ┌─────────────────┐
                             │ User Query      │
                             │ "Show revenue   │
                             │  by region"     │
                             └────────┬────────┘
                                      │
                                      ▼
              ┌───────────────────────────────────────┐
              │  Frontend: QueryInput Component       │
              │  - Captures text                      │
              │  - Validates length                   │
              │  - Shows loading spinner              │
              └───────────────┬───────────────────────┘
                              │
                              │ POST JSON
                              │
              ┌───────────────▼───────────────────────┐
              │  Backend: /query Endpoint             │
              │  - Receives query string              │
              │  - Initializes processor              │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  Schema Extraction                    │
              │  - Database columns                   │
              │  - Column types                       │
              │  - Sample values                      │
              │  - Row count                          │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  Gemini AI Processing                 │
              │  - System prompt with schema          │
              │  - User query                         │
              │  - Temperature: 0.3 (stable)          │
              │  - Returns: JSON with SQL             │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  JSON Extraction & Parsing            │
              │  - Extract from markdown blocks       │
              │  - Handle nested JSON                 │
              │  - Validate required fields           │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  SQL Query Validation                 │
              │  - Prevent SQL injection              │
              │  - Check table/column existence       │
              │  - Reject dangerous operations        │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  SQL Execution                        │
              │  - Connect to SQLite                  │
              │  - Execute query                      │
              │  - Convert rows to dict format        │
              │  - Handle errors gracefully           │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  Response Construction                │
              │  - Query result data                  │
              │  - Chart configuration                │
              │  - Title & description                │
              │  - SQL query (for transparency)       │
              └───────────────┬───────────────────────┘
                              │
                              │ Return JSON
                              │
              ┌───────────────▼───────────────────────┐
              │  Frontend: Dashboard Component        │
              │  - Parse response                     │
              │  - Show loading finished              │
              │  - Display chart config               │
              └───────────────┬───────────────────────┘
                              │
              ┌───────────────▼───────────────────────┐
              │  ChartRenderer Component               │
              │  - Select chart based on type         │
              │  - Format data for Recharts           │
              │  - Render interactive chart           │
              │  - Display statistics                 │
              └───────────────────────────────────────┘
```

## State Management

### Frontend State (React)

```javascript
// App component state
const [query, setQuery]           = useState('')         // Current query
const [result, setResult]         = useState(null)       // API response
const [isLoading, setIsLoading]   = useState(false)      // Loading status
const [error, setError]           = useState(null)       // Error message
const [serverReady, setServerReady] = useState(false)    // API connectivity
```

### Response Object Structure

```javascript
{
  success: true,
  title: "Revenue by Region",
  description: "Total revenue for each region",
  chart_type: "bar",
  data: [
    { region: "North", revenue: 150000 },
    { region: "South", revenue: 120000 },
    // ...
  ],
  x_axis: "region",
  y_axis: "revenue",
  sql_query: "SELECT region, SUM(revenue) as revenue FROM sales GROUP BY region"
}
```

## Key Design Patterns

### 1. Dependency Injection
```python
# Singleton pattern for data processor
_processor = None

def get_processor(csv_path=None):
    global _processor
    if _processor is None:
        _processor = DataProcessor(csv_path)
    return _processor
```

### 2. Factory Pattern
```python
# Create instances via factory
def get_gemini_builder():
    return GeminiQueryBuilder()
```

### 3. Separation of Concerns
- **API Layer**: FastAPI handles HTTP
- **Business Logic**: Data processor executes queries
- **AI Layer**: Gemini handles translation
- **Config Layer**: Settings manages environment

### 4. Error Boundaries
```javascript
// React error boundary for crash prevention
<ErrorBoundary fallback={<ErrorMessage />}>
  <Dashboard />
</ErrorBoundary>
```

## Performance Considerations

### Query Execution Time Targets
- User Input → API Call: < 100ms
- Gemini AI Processing: 2-3s
- SQL Query Execution: < 500ms
- Chart Rendering: < 300ms
- **Total**: < 5 seconds

### Optimization Strategies

1. **Frontend**
   - Code splitting with React.lazy()
   - Memoization of chart components
   - Debounced query submissions

2. **Backend**
   - Query caching for repeated queries
   - Connection pooling (production)
   - Indexed database columns
   - Temperature-controlled AI (0.3 = consistent)

3. **Network**
   - Gzip compression
   - Response streaming for large datasets
   - Request deduplication

## Security Architecture

### Input Validation
```python
# Pydantic validation
class QueryRequest(BaseModel):
    query: str
    
    @validator('query')
    def validate_query(cls, v):
        if len(v) > 1000:
            raise ValueError("Query too long")
        return v
```

### SQL Injection Prevention
```python
# Prevent dangerous SQL operations
dangerous_keywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT']
if any(kw in sql.upper() for kw in dangerous_keywords):
    raise SecurityError("Operation not allowed")
```

### CORS Security
```python
# Restrict to known origins
CORS_ORIGINS = ["https://yourdomain.com"]
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS)
```

### API Key Management
```python
# Load from environment, never hardcode
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    raise ValueError("GOOGLE_API_KEY not set")
```

## Database Schema

### sales Table

```sql
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    region TEXT NOT NULL,
    product_category TEXT NOT NULL,
    revenue REAL NOT NULL,
    units_sold INTEGER NOT NULL,
    quarter TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_date ON sales(date);
CREATE INDEX idx_region ON sales(region);
CREATE INDEX idx_category ON sales(product_category);
```

### Sample Queries

```sql
-- Revenue by region
SELECT region, SUM(revenue) FROM sales GROUP BY region;

-- Monthly trends
SELECT DATE(date) as month, SUM(revenue) FROM sales 
GROUP BY DATE(date) ORDER BY DATE(date);

-- Top products
SELECT product_category, SUM(revenue) as total 
FROM sales GROUP BY product_category 
ORDER BY total DESC LIMIT 5;
```

## Extensibility Points

Future enhancements can hook into:

1. **New Chart Types**
   - Add to ChartRenderer.jsx
   - Implement Recharts component
   - Add to chart_type validation

2. **Multiple Data Sources**
   - Implement DataSource interface
   - Support PostgreSQL, MySQL, etc.
   - Add cloud data (BigQuery, Redshift)

3. **Advanced Querying**
   - Implement query builder GUI
   - Add saved queries/favorites
   - Support complex joins

4. **Caching & Performance**
   - Add Redis caching layer
   - Implement query result caching
   - Add materialized views

5. **Authentication**
   - User accounts and login
   - Role-based access control
   - Audit logging

---

For more details, see the specific documentation files.
