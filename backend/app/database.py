"""
database.py — SQLite database setup and query execution.
Loads CSV data into SQLite on startup; supports custom CSV uploads.
"""

import sqlite3
import pandas as pd
import os
import threading

# Thread-local storage for SQLite connections (SQLite is not thread-safe by default)
_local = threading.local()

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sales.db")
DEFAULT_CSV = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample_sales.csv")

# ---------- connection helpers ----------

def get_connection() -> sqlite3.Connection:
    """Return a thread-local SQLite connection."""
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(DATABASE_PATH)
        _local.conn.row_factory = sqlite3.Row
    return _local.conn


def close_connection():
    """Close the thread-local connection if open."""
    if hasattr(_local, "conn") and _local.conn:
        _local.conn.close()
        _local.conn = None


# ---------- initialisation ----------

def init_db():
    """Create the default sales table from the bundled CSV."""
    if not os.path.exists(DEFAULT_CSV):
        raise FileNotFoundError(f"Default CSV not found at {DEFAULT_CSV}")

    df = pd.read_csv(DEFAULT_CSV)
    conn = get_connection()
    df.to_sql("sales", conn, if_exists="replace", index=False)
    conn.commit()
    print(f"[DB] Loaded {len(df)} rows into 'sales' table.")


def load_csv_to_table(csv_path: str, table_name: str) -> dict:
    """
    Load an arbitrary CSV file into the database as a new table.
    Returns schema info: {table_name, columns: [{name, dtype}], row_count}.
    """
    df = pd.read_csv(csv_path)
    conn = get_connection()
    df.to_sql(table_name, conn, if_exists="replace", index=False)
    conn.commit()

    columns = [{"name": col, "dtype": str(df[col].dtype)} for col in df.columns]
    return {
        "table_name": table_name,
        "columns": columns,
        "row_count": len(df),
    }


# ---------- query execution ----------

def execute_query(sql: str) -> list[dict]:
    """
    Execute a SELECT-only SQL query and return the results as a list of dicts.
    Raises ValueError for non-SELECT statements.
    """
    # Safety: Only allow SELECT statements
    stripped = sql.strip().upper()
    if not stripped.startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed.")

    # Block dangerous keywords
    dangerous = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "TRUNCATE", "EXEC"]
    for kw in dangerous:
        # Check for keyword as a separate word
        if f" {kw} " in f" {stripped} ":
            raise ValueError(f"Query contains forbidden keyword: {kw}")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(sql)
    rows = cursor.fetchall()
    columns = [description[0] for description in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


# ---------- schema introspection ----------

def get_table_names() -> list[str]:
    """Return all user table names in the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    return [row[0] for row in cursor.fetchall()]


def get_table_schema(table_name: str = "sales") -> list[dict]:
    """Return column info for the given table: [{name, type}]."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name});")
    return [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]


def get_full_schema() -> dict:
    """Return schema for every table in the database."""
    tables = get_table_names()
    schema = {}
    for t in tables:
        schema[t] = get_table_schema(t)
    return schema


def get_sample_data(table_name: str = "sales", limit: int = 5) -> list[dict]:
    """Return a few sample rows from the given table for context."""
    return execute_query(f"SELECT * FROM {table_name} LIMIT {limit}")
