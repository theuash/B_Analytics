# Backend API Server for Dashboard Analytics

Backend service for the Conversational AI Dashboard application.

## Setup

```bash
python -m venv venv
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
DATABASE_URL=sqlite:///./dashboard.db
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

## Running the Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
