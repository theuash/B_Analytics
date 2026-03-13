"""
utils.py — Utility helpers for the backend.
"""

import re
import os


def sanitize_table_name(name: str) -> str:
    """
    Turn a filename or user-supplied string into a safe SQLite table name.
    Only keeps alphanumerics and underscores.
    """
    # Remove extension
    base = os.path.splitext(name)[0]
    # Replace non-alphanumeric chars with underscores
    safe = re.sub(r"[^a-zA-Z0-9_]", "_", base)
    # Remove leading digits
    safe = re.sub(r"^\d+", "", safe)
    # Collapse multiple underscores
    safe = re.sub(r"_+", "_", safe).strip("_")
    return safe.lower() or "uploaded_data"


def format_number(value) -> str:
    """Format a number for display (e.g., 12500 -> '12,500')."""
    try:
        num = float(value)
        if num == int(num):
            return f"{int(num):,}"
        return f"{num:,.2f}"
    except (ValueError, TypeError):
        return str(value)
