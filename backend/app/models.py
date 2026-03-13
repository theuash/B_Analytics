"""
models.py — Pydantic schemas for request / response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ---------- Requests ----------

class QueryRequest(BaseModel):
    """Natural-language query from the user."""
    query: str = Field(..., min_length=1, description="Plain-English question about the data")
    table_name: str = Field("sales", description="Target table to query")


class FollowUpRequest(BaseModel):
    """Follow-up query that includes conversation history."""
    query: str = Field(..., min_length=1)
    table_name: str = Field("sales")
    history: list[dict] = Field(default_factory=list, description="Previous conversation turns")


# ---------- Chart configuration (returned by Gemini) ----------

class ChartConfig(BaseModel):
    """Configuration for a single chart, parsed from Gemini's response."""
    chart_type: str = Field(..., description="line | bar | pie | scatter | table")
    title: str = Field("", description="Chart title")
    x_axis: Optional[str] = Field(None, description="Column name for x-axis")
    y_axis: Optional[str] = Field(None, description="Column name for y-axis")
    description: str = Field("", description="Brief description of what the chart shows")
    sql_query: str = Field("", description="The SQL query used to fetch data")


# ---------- Responses ----------

class QueryResponse(BaseModel):
    """Full response sent to the frontend containing data + chart configs."""
    charts: list[dict] = Field(default_factory=list, description="List of {config, data} objects")
    summary: str = Field("", description="Natural-language summary of the results")
    error: Optional[str] = Field(None, description="Error message, if any")


class UploadResponse(BaseModel):
    """Response after a CSV file upload."""
    table_name: str
    columns: list[dict]
    row_count: int
    message: str = ""


class SchemaResponse(BaseModel):
    """Current database schema information."""
    tables: dict = Field(default_factory=dict)
