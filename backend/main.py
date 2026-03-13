"""
Main FastAPI application for the dashboard analytics system.
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import traceback
import os
import tempfile

from config import settings
from gemini_integration import get_gemini_builder
from data_processor import get_processor, create_new_processor

# Initialize FastAPI app
app = FastAPI(
    title="Dashboard Analytics API",
    description="Conversational AI for business intelligence dashboards",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class QueryRequest(BaseModel):
    """Natural language query request."""
    query: str
    use_uploaded_data: bool = False


class QueryResponse(BaseModel):
    """Response with chart data and configuration."""
    success: bool
    title: str = ""
    description: str = ""
    chart_type: str = ""
    data: List[Dict[str, Any]] = []
    x_axis: str = ""
    y_axis: str = ""
    sql_query: str = ""
    error: Optional[str] = None


class DashboardData(BaseModel):
    """Multiple charts for a dashboard."""
    success: bool
    charts: List[QueryResponse] = []
    error: Optional[str] = None


# API Endpoints

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "api": "Dashboard Analytics"}


@app.get("/schema")
async def get_schema():
    """Get current data schema."""
    try:
        processor = get_processor()
        schema = processor.get_schema()
        return {"success": True, "schema": schema}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/query")
async def process_query(request: QueryRequest) -> QueryResponse:
    """
    Process natural language query and generate dashboard.
    """
    try:
        # Get data processor and schema
        processor = get_processor()
        schema = processor.get_schema()
        
        if "error" in schema:
            return QueryResponse(
                success=False,
                error="Failed to load data schema"
            )
        
        # Get Gemini builder
        builder = get_gemini_builder()
        
        # Convert natural language to structured query
        ai_result = builder.build_query(request.query, schema)
        
        if not ai_result["success"]:
            return QueryResponse(
                success=False,
                error=ai_result["error"]
            )
        
        query_config = ai_result["data"]
        
        # Execute SQL query
        sql_query = query_config.get("sql_query", "")
        results, error = processor.execute_query(sql_query)
        
        if error:
            return QueryResponse(
                success=False,
                error=error
            )
        
        return QueryResponse(
            success=True,
            title=query_config.get("title", "Dashboard"),
            description=query_config.get("description", ""),
            chart_type=query_config.get("chart_type", "table"),
            data=results,
            x_axis=query_config.get("x_axis", ""),
            y_axis=query_config.get("y_axis", ""),
            sql_query=sql_query
        )
    
    except Exception as e:
        traceback.print_exc()
        return QueryResponse(
            success=False,
            error=f"Server error: {str(e)}"
        )


@app.post("/multi-query")
async def process_multi_query(request: QueryRequest) -> DashboardData:
    """
    Process complex query that might need multiple visualizations.
    """
    try:
        # For multi-query, we can break down complex queries
        # For now, execute single query and potentially generate related charts
        
        processor = get_processor()
        schema = processor.get_schema()
        builder = get_gemini_builder()
        
        # Parse the query using Gemini
        ai_result = builder.build_query(request.query, schema)
        
        if not ai_result["success"]:
            return DashboardData(
                success=False,
                error=ai_result["error"]
            )
        
        query_config = ai_result["data"]
        sql_query = query_config.get("sql_query", "")
        results, error = processor.execute_query(sql_query)
        
        if error:
            return DashboardData(
                success=False,
                error=error
            )
        
        main_chart = QueryResponse(
            success=True,
            title=query_config.get("title", "Dashboard"),
            description=query_config.get("description", ""),
            chart_type=query_config.get("chart_type", "table"),
            data=results,
            x_axis=query_config.get("x_axis", ""),
            y_axis=query_config.get("y_axis", ""),
            sql_query=sql_query
        )
        
        return DashboardData(
            success=True,
            charts=[main_chart]
        )
    
    except Exception as e:
        traceback.print_exc()
        return DashboardData(
            success=False,
            error=f"Server error: {str(e)}"
        )


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload and load a new CSV file for queries.
    """
    try:
        if file.size > settings.max_upload_size:
            raise HTTPException(status_code=400, detail="File too large")
        
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files allowed")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Create new processor with uploaded file
        processor = create_new_processor(tmp_path)
        schema = processor.get_schema()
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        return {
            "success": True,
            "message": f"Uploaded {len(processor.df)} rows",
            "schema": schema
        }
    
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sample-queries")
async def get_sample_queries():
    """Get sample queries for user guidance."""
    return {
        "samples": [
            "Show me total revenue by region for 2024",
            "What were the monthly sales trends in Q3?",
            "Top 5 product categories by revenue",
            "Compare electronics sales across all regions",
            "How many units were sold in each quarter?",
            "Show revenue trends over time with a line chart",
            "Breakdown of revenue by product category as a pie chart",
            "Which region had the highest sales in 2023?"
        ]
    }


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "Dashboard Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "GET /health",
            "schema": "GET /schema",
            "sample_queries": "GET /sample-queries",
            "query": "POST /query",
            "multi_query": "POST /multi-query",
            "upload_csv": "POST /upload-csv"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
