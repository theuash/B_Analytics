# NLP Data Dashboard — Backend

FastAPI-powered backend that translates natural language queries into SQL + chart configurations using Google Gemini.

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure your API key
copy .env.example .env
# Edit .env and paste your Gemini API key

# 4. Run the server
uvicorn app.main:app --reload --port 8000
```

API docs available at **http://localhost:8000/docs**

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/query` | Send a natural language query |
| POST | `/api/follow-up` | Refine a previous query with context |
| POST | `/api/upload` | Upload a CSV file |
| GET | `/api/schema` | Get database schema |
| GET | `/api/tables` | List available tables |
