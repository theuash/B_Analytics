# DataLens AI — NLP-Powered Data Dashboard

> Ask questions in plain English — get interactive dashboards instantly.

An AI‑powered analytics tool that lets non‑technical users type natural‑language questions and receive real‑time interactive dashboards with charts, tables, and insights.

## ✨ Features

- **Natural Language Queries** — Type questions like *"Show monthly revenue trend for Q3 by region"*
- **AI Chart Selection** — Gemini picks the best chart type (line, bar, pie, scatter, table)
- **Follow‑up Chat** — Refine your view with context-aware follow‑up questions
- **CSV Upload** — Bring your own data and start querying immediately
- **Interactive Charts** — Tooltips, zoom/brush, hover effects (Recharts)
- **Premium Dark UI** — Glassmorphism, parallax effects, 3D card hover
- **SQL Transparency** — View the generated SQL for each chart

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · Vite 5 · Tailwind CSS 3 |
| Charting | Recharts |
| Backend | Python · FastAPI |
| AI / LLM | Google Gemini 2.0 Flash |
| Database | SQLite (+ pandas for CSV uploads) |

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API key** ([get one here](https://aistudio.google.com/app/apikey))

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure API key
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
# Edit .env and paste your GEMINI_API_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### 3. Try It!

1. Type: **"Total revenue by region"**
2. Type: **"Monthly sales trend for 2023"**
3. Type: **"Top 5 product categories by revenue in the East region, shown as a bar chart and also show a pie chart for the same"**
4. Upload your own CSV and query it!

## 📁 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI endpoints
│   │   ├── database.py        # SQLite management
│   │   ├── gemini_client.py   # Gemini AI integration
│   │   ├── models.py          # Pydantic schemas
│   │   └── utils.py           # Helpers
│   ├── data/
│   │   └── sample_sales.csv   # 200-row sample dataset
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryInput.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ChartRenderer.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔒 Security

- API keys are stored in `.env` (never committed)
- Only `SELECT` SQL queries are executed
- Dangerous SQL keywords are blocked

## 📄 License

MIT
