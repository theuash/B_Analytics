"""
gemini_client.py — Google Gemini API integration with prompt engineering.
Converts natural language queries into SQL + chart configurations.
"""

import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API
API_KEY = os.getenv("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

MODEL_NAME = "gemini-1.5-flash"


def _build_system_prompt(schema: dict, sample_rows: list[dict] | None = None) -> str:
    """Build the system prompt that instructs Gemini on how to respond."""

    schema_text = ""
    for table_name, columns in schema.items():
        cols = ", ".join([f"{c['name']} ({c['type']})" for c in columns])
        schema_text += f"  Table '{table_name}': {cols}\n"

    sample_text = ""
    if sample_rows:
        sample_text = "\nSample rows from the main table:\n"
        for row in sample_rows[:3]:
            sample_text += f"  {row}\n"

    return f"""You are a data analytics assistant that converts natural language questions into SQL queries and chart configurations.

DATABASE SCHEMA:
{schema_text}
{sample_text}

RULES:
1. Generate ONLY valid SQLite SELECT queries. Never use INSERT, UPDATE, DELETE, DROP, or any DDL.
2. Always reference only the columns and tables listed in the schema above. Do NOT invent columns.
3. If the user's question cannot be answered with the available data, set "error" to a helpful message explaining why, and set "charts" to an empty array.
4. Choose the MOST appropriate chart type based on the data:
   - "line" for time series / trends over dates
   - "bar" for categorical comparisons
   - "pie" for parts-of-a-whole / proportions (ideally ≤ 8 slices)
   - "scatter" for correlations between two numeric values
   - "table" for detailed breakdowns or when no specific chart fits
5. A single user query may warrant MULTIPLE charts. Return up to 4 charts if appropriate.
6. Always include a natural-language "summary" of the findings.
7. For date/time grouping use strftime() for SQLite, e.g. strftime('%Y-%m', date).
8. The "x_axis" and "y_axis" must exactly match column aliases in your SELECT statement.

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown fences:
{{
  "charts": [
    {{
      "sql_query": "SELECT ...",
      "chart_type": "bar",
      "title": "Revenue by Region",
      "x_axis": "region",
      "y_axis": "revenue",
      "description": "Compares total revenue across regions"
    }}
  ],
  "summary": "A brief natural language summary of the insights."
}}

If the query is vague or ambiguous, still try your best but note the assumption in the summary.
If the query is impossible to answer with available data, return:
{{
  "charts": [],
  "summary": "...",
  "error": "Explanation of why this can't be answered."
}}
"""


def parse_gemini_response(text: str) -> dict:
    """Parse the raw Gemini response text into a Python dict."""
    # Strip markdown code fences if present
    cleaned = text.strip()
    if cleaned.startswith("```"):
        # Remove opening fence (```json or ```)
        first_newline = cleaned.index("\n")
        cleaned = cleaned[first_newline + 1:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        return {
            "charts": [],
            "summary": "",
            "error": f"Failed to parse AI response: {str(e)}",
        }


async def generate_query(
    user_query: str,
    schema: dict,
    sample_rows: list[dict] | None = None,
    history: list[dict] | None = None,
) -> dict:
    """
    Send the user's natural language query to Gemini and return parsed JSON.
    Supports follow-up context via `history`.
    """
    if not API_KEY:
        return {
            "charts": [],
            "summary": "",
            "error": "Gemini API key is not configured. Please set GEMINI_API_KEY in the .env file.",
        }

    system_prompt = _build_system_prompt(schema, sample_rows)

    # Build messages
    messages = []

    # Add conversation history for follow-ups
    if history:
        for turn in history:
            role = turn.get("role", "user")
            messages.append({"role": role, "parts": [turn.get("content", "")]})

    # Current query
    messages.append({"role": "user", "parts": [user_query]})

    try:
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=system_prompt,
        )
        response = model.generate_content(messages)
        return parse_gemini_response(response.text)
    except Exception as e:
        return {
            "charts": [],
            "summary": "",
            "error": f"Gemini API error: {str(e)}",
        }
