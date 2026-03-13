"""
main.py — FastAPI application entry point.
Exposes endpoints for NL querying, CSV upload, and schema inspection.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import shutil
import tempfile

from .database import init_db, execute_query, get_full_schema, get_sample_data, load_csv_to_table, get_table_names
from .gemini_client import generate_query
from .models import QueryRequest, FollowUpRequest, QueryResponse, UploadResponse, SchemaResponse
from .utils import sanitize_table_name


# ---------- Lifespan ----------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialise database on startup."""
    init_db()
    yield


# ---------- App ----------

app = FastAPI(
    title="NLP Data Dashboard API",
    description="Convert natural language questions into interactive data dashboards powered by Google Gemini.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Endpoints ----------

@app.get("/")
async def root():
    return {"message": "NLP Data Dashboard API is running.", "docs": "/docs"}


@app.post("/api/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    """
    Accept a natural-language query, translate it via Gemini into SQL + chart config,
    execute the SQL, and return the results.
    """
    try:
        schema = get_full_schema()
        sample = get_sample_data(request.table_name, limit=3)

        # Call Gemini
        ai_result = await generate_query(
            user_query=request.query,
            schema=schema,
            sample_rows=sample,
        )

        if ai_result.get("error"):
            return QueryResponse(
                charts=[],
                summary=ai_result.get("summary", ""),
                error=ai_result["error"],
            )

        # Execute each chart's SQL and pair results with config
        charts = []
        for chart_conf in ai_result.get("charts", []):
            sql = chart_conf.get("sql_query", "")
            try:
                data = execute_query(sql) if sql else []
            except Exception as e:
                data = []
                chart_conf["description"] = f"Query error: {str(e)}"

            charts.append({
                "config": {
                    "chart_type": chart_conf.get("chart_type", "table"),
                    "title": chart_conf.get("title", "Results"),
                    "x_axis": chart_conf.get("x_axis"),
                    "y_axis": chart_conf.get("y_axis"),
                    "description": chart_conf.get("description", ""),
                    "sql_query": sql,
                },
                "data": data,
            })

        return QueryResponse(
            charts=charts,
            summary=ai_result.get("summary", ""),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/follow-up", response_model=QueryResponse)
async def handle_follow_up(request: FollowUpRequest):
    """
    Handle a follow-up question with conversation history for context.
    """
    try:
        schema = get_full_schema()
        sample = get_sample_data(request.table_name, limit=3)

        ai_result = await generate_query(
            user_query=request.query,
            schema=schema,
            sample_rows=sample,
            history=request.history,
        )

        if ai_result.get("error"):
            return QueryResponse(
                charts=[],
                summary=ai_result.get("summary", ""),
                error=ai_result["error"],
            )

        charts = []
        for chart_conf in ai_result.get("charts", []):
            sql = chart_conf.get("sql_query", "")
            try:
                data = execute_query(sql) if sql else []
            except Exception as e:
                data = []
                chart_conf["description"] = f"Query error: {str(e)}"

            charts.append({
                "config": {
                    "chart_type": chart_conf.get("chart_type", "table"),
                    "title": chart_conf.get("title", "Results"),
                    "x_axis": chart_conf.get("x_axis"),
                    "y_axis": chart_conf.get("y_axis"),
                    "description": chart_conf.get("description", ""),
                    "sql_query": sql,
                },
                "data": data,
            })

        return QueryResponse(
            charts=charts,
            summary=ai_result.get("summary", ""),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file and load it into the database as a new table.
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    table_name = sanitize_table_name(file.filename)

    # Save to a temp file, then load
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        info = load_csv_to_table(tmp_path, table_name)
        return UploadResponse(
            table_name=info["table_name"],
            columns=info["columns"],
            row_count=info["row_count"],
            message=f"Successfully loaded {info['row_count']} rows into table '{table_name}'.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.get("/api/schema", response_model=SchemaResponse)
async def get_schema():
    """Return the full database schema for all tables."""
    return SchemaResponse(tables=get_full_schema())


@app.get("/api/tables")
async def list_tables():
    """Return the list of available table names."""
    return {"tables": get_table_names()}
