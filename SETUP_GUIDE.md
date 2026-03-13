# Setup Guide - Dashboard Analytics

Complete step-by-step setup instructions for development and production deployment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required
- **Python 3.8+** - Download from https://www.python.org/
- **Node.js 16+** - Download from https://nodejs.org/
- **Git** - Download from https://git-scm.com/

### Optional
- **Docker** - Download from https://www.docker.com/
- **VS Code** - Download from https://code.visualstudio.com/

### API Keys
1. Get a **Google Gemini API Key**:
   - Go to https://aistudio.google.com/
   - Click "Get API Key"
   - Create a new API key in Google Cloud Console
   - Copy the key

## Local Development

### Step 1: Clone or Navigate to Project

```bash
cd B_Analytics
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

#### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

```bash
# Copy the template
cp .env.example .env

# Edit .env file (use your preferred editor)
# Add your Google Gemini API key
```

Example `.backend/.env`:
```env
GOOGLE_API_KEY=AIza...your_key_here...
DATABASE_URL=sqlite:///./dashboard.db
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
DEBUG=true
```

#### 2.4 Start Backend Server

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You'll see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**API Documentation**: Open http://localhost:8000/docs in your browser

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Start Development Server

```bash
npm run dev
```

You'll see:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

**Open** http://localhost:5173/ in your browser

### Step 4: Test the Application

1. **Visit the Dashboard**: http://localhost:5173/
2. **Try a sample query**: "Show me total revenue by region"
3. **Verify the chart appears** with data

## Docker Deployment

### Prerequisites
- Docker installed
- Docker Compose 1.29+

### Step 1: Create Environment File

```bash
# In the B_Analytics directory
cp backend/.env.example .env.docker
nano .env.docker  # Edit with your API key
```

### Step 2: Build Images

```bash
docker-compose build
```

### Step 3: Run Services

```bash
docker-compose up
```

### Step 4: Access Services

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:8000/
- **API Docs**: http://localhost:8000/docs

### Step 5: Stop Services

```bash
docker-compose down
```

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_API_KEY` | Yes | - | Your Google Gemini API key |
| `DATABASE_URL` | No | `sqlite:///./dashboard.db` | Database connection URL |
| `CORS_ORIGINS` | No | `["http://localhost:5173"]` | Allowed CORS origins |
| `DEBUG` | No | `true` | Enable debug mode |

### Frontend Environment Variables

Create `frontend/.env.local`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE` | No | `http://localhost:8000` | Backend API URL |

## Troubleshooting

### Backend Issues

#### Issue: "ModuleNotFoundError: No module named 'fastapi'"

**Solution**: Ensure virtual environment is activated and requirements installed
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### Issue: "Port 8000 already in use"

**Solution**: Find and kill the process using port 8000
```bash
# macOS/Linux
lsof -i :8000
kill -9 <PID>

# Windows PowerShell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

Or use a different port:
```bash
python -m uvicorn main:app --port 8001
```

#### Issue: "GOOGLE_API_KEY not found"

**Solution**: Create .env file in backend/ directory with your API key
```bash
echo "GOOGLE_API_KEY=YOUR_KEY_HERE" > backend/.env
```

#### Issue: "Database is locked"

**Solution**: The SQLite database is being accessed by multiple processes
```bash
# Remove the old database
rm dashboard.db
# Then run the application again
```

### Frontend Issues

#### Issue: "Port 5173 already in use"

**Solution**: Use a different port
```bash
npm run dev -- --port 3000
```

#### Issue: "Cannot GET /"

**Solution**: Ensure you're accessing http://localhost:5173 (not http://localhost:5173/index.html)

#### Issue: "API connection timeout"

**Solution**: Verify backend is running
```bash
# In another terminal
cd backend
python -m uvicorn main:app --reload
```

### General Issues

#### Issue: Data isn't loading

**Checklist**:
1. ✓ Is the CSV file at `data/sample_sales.csv`?
2. ✓ Is the backend API responding? (http://localhost:8000/schema)
3. ✓ Are CORS origins correctly configured?
4. ✓ Is the frontend correctly connecting to the API?

#### Issue: Charts not rendering

**Solution**: Check browser console (F12) for JavaScript errors. Common issues:
- Data format mismatch between backend and frontend
- Missing chart data fields (x_axis, y_axis)
- Invalid JSON response from API

#### Issue: Gemini API errors

**Solution**: Verify your API key and usage limits
```bash
# Test API directly using cURL
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me total revenue by region"}'
```

## Production Deployment

### Frontend (Vercel/Netlify)

1. Build the project:
```bash
cd frontend
npm run build
```

2. Deploy the `dist/` folder to Vercel or Netlify

3. Set environment variable:
```
VITE_API_BASE=https://your-backend-domain.com
```

### Backend (Heroku/Railway)

1. Install Gunicorn:
```bash
pip install gunicorn
```

2. Create `Procfile`:
```
web: gunicorn main:app -w 4 -b 0.0.0.0:$PORT
```

3. Deploy to Heroku:
```bash
heroku create your-app-name
git push heroku main
```

4. Set environment variables:
```bash
heroku config:set GOOGLE_API_KEY=your_key_here
```

## Performance Optimization

### Backend
- Use SQLite connection pooling for production databases
- Implement query caching for frequently asked questions
- Add rate limiting to prevent API abuse

### Frontend
- Enable production builds: `npm run build`
- Use CDN for static assets
- Implement lazy loading for charts

## Security Checklist

- [ ] API keys stored in environment variables (never in code)
- [ ] HTTPS enabled for production
- [ ] CORS origins restricted to known domains
- [ ] SQL injection prevention (input sanitization)
- [ ] Rate limiting enabled
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies updated regularly

## Next Steps

1. ✅ Complete local setup
2. ✅ Test with sample queries
3. ✅ Upload your own CSV data
4. ✅ Customize styling with Tailwind
5. ✅ Deploy to production

## Support

For detailed information, see:
- [Main README](README.md)
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [API Documentation](http://localhost:8000/docs)

---

Happy building! 🚀
