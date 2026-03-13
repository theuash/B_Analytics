"""
Gemini AI integration for converting natural language to queries.
"""
import google.generativeai as genai
import json
import os
from config import settings
from typing import Dict, Any, List
import re
import logging

logger = logging.getLogger(__name__)


class GeminiQueryBuilder:
    """Handles conversion of natural language to structured queries."""
    
    def __init__(self):
        """Initialize Gemini client with API key."""
        self.api_key = settings.google_api_key
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-pro')
                self.available = True
                logger.info("Gemini AI initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini: {e}")
                self.available = False
        else:
            logger.warning("GOOGLE_API_KEY not set")
            self.available = False
    
    def build_query(self, natural_query: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert natural language query to structured format.
        
        Args:
            natural_query: User's plain English query
            schema: Database schema information
            
        Returns:
            Dictionary with query instructions and chart configuration
        """
        if not self.available:
            return {
                "success": False,
                "data": None,
                "error": "Gemini API not configured. Please set GOOGLE_API_KEY in environment."
            }
        
        try:
            # Build schema description
            schema_desc = self._build_schema_description(schema)
            
            # Craft the system prompt
            system_prompt = f"""You are an expert SQL query generator and data analyst. Given a natural language query, 
generate ONLY a valid JSON response with these fields:
- sql_query: Valid SQL SELECT statement
- chart_type: one of [bar, line, pie, scatter, table]
- title: Clear chart title
- description: What the data shows
- x_axis: Which field goes on X axis
- y_axis: Which field goes on Y axis or value field for aggregations
- filters_applied: List of any filters
- aggregation: Type of aggregation (sum, avg, count, max, min)

Available database schema:
{schema_desc}

SQL RULES:
1. Table name is "sales" - always use it
2. Use LOWER() for case-insensitive string comparisons
3. Use DATE(date) for date comparisons
4. Use GROUP BY for aggregations
5. Use ORDER BY for sorting
6. Always use valid column names from schema
7. Never use columns that aren't in the schema

CHART SELECTION:
- Time series → line chart
- Comparing categories → bar chart  
- Parts of whole → pie chart
- Correlation → scatter chart
- Details → table

Return ONLY JSON object, no markdown, no explanation."""

            response = self.model.generate_content(
                f"{system_prompt}\n\nQuery: {natural_query}",
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,  # Lower temperature for consistency
                    top_p=0.9,
                )
            )
            
            # Extract and parse JSON
            json_str = self._extract_json(response.text)
            result = json.loads(json_str)
            
            # Validate response
            required_fields = ['sql_query', 'chart_type', 'title', 'x_axis', 'y_axis']
            missing = [f for f in required_fields if f not in result]
            if missing:
                logger.warning(f"Missing fields in AI response: {missing}")
                result.update({f: "" for f in missing if f not in result})
            
            return {
                "success": True,
                "data": result,
                "error": None
            }
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            return {
                "success": False,
                "data": None,
                "error": f"Failed to parse AI response: Invalid JSON"
            }
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return {
                "success": False,
                "data": None,
                "error": f"AI processing error: {str(e)}"
            }
    
    def _build_schema_description(self, schema: Dict[str, Any]) -> str:
        """Build human-readable schema description."""
        description = "Table: sales\n"
        description += f"Total records: {schema.get('row_count', 'unknown')}\n\n"
        description += "Columns:\n"
        
        for column in schema.get('columns', []):
            col_type = schema['column_types'].get(column, 'VARCHAR')
            description += f"  - {column} ({col_type})"
            
            if column in schema.get('sample_values', {}):
                samples = schema['sample_values'][column][:2]
                sample_str = ", ".join([str(s)[:20] for s in samples])
                description += f" [examples: {sample_str}]"
            description += "\n"
        
        return description
    
    def _extract_json(self, text: str) -> str:
        """Extract JSON object from text response."""
        text = text.strip()
        
        # Try markdown JSON block first
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
        if json_match:
            return json_match.group(1)
        
        # Try to find JSON object (handles nested objects)
        try:
            # Find first {
            start_idx = text.find('{')
            if start_idx == -1:
                raise ValueError("No JSON object found")
            
            # Find matching closing brace
            brace_count = 0
            in_string = False
            escape = False
            
            for i in range(start_idx, len(text)):
                char = text[i]
                
                if escape:
                    escape = False
                    continue
                    
                if char == '\\':
                    escape = True
                    continue
                
                if char == '"' and not escape:
                    in_string = not in_string
                    continue
                
                if not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            return text[start_idx:i+1]
            
            # If we get here, try the whole remaining string
            return text[start_idx:]
        except:
            pass
        
        # Fallback: return text as-is
        return text


def get_gemini_builder() -> GeminiQueryBuilder:
    """Factory function to get Gemini query builder instance."""
    return GeminiQueryBuilder()
