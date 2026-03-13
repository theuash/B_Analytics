"""
Data processing and query execution engine.
"""
import pandas as pd
import sqlite3
import os
from typing import Dict, Any, List, Tuple
import json


class DataProcessor:
    """Handles data loading, querying, and schema extraction."""
    
    def __init__(self, csv_path: str = None):
        """
        Initialize data processor.
        
        Args:
            csv_path: Path to CSV file. If None, uses sample data.
        """
        self.df = None
        self.db_path = "dashboard.db"
        
        if csv_path and os.path.exists(csv_path):
            self.load_csv(csv_path)
        else:
            self.load_sample_data()
    
    def load_sample_data(self):
        """Load sample sales data from CSV."""
        csv_path = os.path.join(os.path.dirname(__file__), "../data/sample_sales.csv")
        try:
            self.df = pd.read_csv(csv_path)
            self.df['date'] = pd.to_datetime(self.df['date'])
            self._create_sqlite_db()
            print(f"Loaded sample data: {len(self.df)} rows")
        except Exception as e:
            print(f"Error loading sample data: {e}")
            raise
    
    def load_csv(self, csv_path: str):
        """Load CSV file into dataframe."""
        try:
            self.df = pd.read_csv(csv_path)
            # Try to parse date columns
            for col in self.df.columns:
                if 'date' in col.lower():
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
            self._create_sqlite_db()
            print(f"Loaded CSV: {len(self.df)} rows")
        except Exception as e:
            print(f"Error loading CSV: {e}")
            raise
    
    def _create_sqlite_db(self):
        """Create SQLite database from dataframe."""
        try:
            conn = sqlite3.connect(self.db_path)
            self.df.to_sql('sales', conn, if_exists='replace', index=False)
            conn.close()
        except Exception as e:
            print(f"Error creating SQLite db: {e}")
    
    def execute_query(self, sql_query: str) -> Tuple[List[Dict], str]:
        """
        Execute SQL query and return results.
        
        Args:
            sql_query: SQL query string
            
        Returns:
            Tuple of (results list, error message or empty string)
        """
        try:
            # Validate query - prevent dangerous operations
            if any(keyword in sql_query.upper() for keyword in ['DROP', 'DELETE', 'UPDATE', 'INSERT']):
                return [], "Dangerous operation not allowed"
            
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(sql_query)
            results = [dict(row) for row in cursor.fetchall()]
            conn.close()
            
            return results, ""
        except sqlite3.OperationalError as e:
            return [], f"SQL Error: {str(e)}"
        except Exception as e:
            return [], f"Error executing query: {str(e)}"
    
    def get_schema(self) -> Dict[str, Any]:
        """Get database schema information."""
        try:
            columns = list(self.df.columns)
            column_types = {col: str(self.df[col].dtype) for col in columns}
            
            sample_values = {}
            for col in columns:
                unique_vals = self.df[col].unique()[:5]
                sample_values[col] = [str(v) for v in unique_vals]
            
            return {
                "columns": columns,
                "column_types": column_types,
                "sample_values": sample_values,
                "row_count": len(self.df)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def execute_pandas_operation(self, operation: str) -> Tuple[List[Dict], str]:
        """
        Execute pandas operation for flexibility.
        
        Args:
            operation: Pandas operation string
            
        Returns:
            Tuple of (results, error)
        """
        try:
            # This is a safety measure - in production, implement proper sandboxing
            result = eval(operation, {"df": self.df, "pd": pd})
            if isinstance(result, pd.DataFrame):
                return result.to_dict('records'), ""
            return [result], ""
        except Exception as e:
            return [], f"Error: {str(e)}"


# Global instance
_processor = None


def get_processor(csv_path: str = None) -> DataProcessor:
    """Get or create data processor instance."""
    global _processor
    if _processor is None:
        _processor = DataProcessor(csv_path)
    return _processor


def create_new_processor(csv_path: str = None) -> DataProcessor:
    """Create a new data processor instance."""
    global _processor
    _processor = DataProcessor(csv_path)
    return _processor
