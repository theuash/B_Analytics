#!/usr/bin/env python3
"""
Demo script to showcase the Dashboard Analytics system.
Demonstrates three progressively complex queries.
"""

import requests
import time
import json
from typing import Dict, Any

API_BASE = "http://localhost:8000"

# Color codes for terminal output
GREEN = '\033[92m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RED = '\033[91m'
ENDC = '\033[0m'
BOLD = '\033[1m'

def print_header(title: str):
    """Print formatted header."""
    print(f"\n{BOLD}{BLUE}{'='*60}{ENDC}")
    print(f"{BOLD}{BLUE}{title.center(60)}{ENDC}")
    print(f"{BOLD}{BLUE}{'='*60}{ENDC}\n")

def print_query(num: int, query: str, desc: str):
    """Print query information."""
    print(f"{YELLOW}Query {num}: {BOLD}{query}{ENDC}")
    print(f"{BLUE}Description: {desc}{ENDC}\n")

def print_result(response: Dict[str, Any]):
    """Print formatted response."""
    if response.get('success'):
        print(f"{GREEN}✓ Success{ENDC}")
        print(f"  Title: {response.get('title', 'N/A')}")
        print(f"  Chart Type: {BOLD}{response.get('chart_type', 'N/A').upper()}{ENDC}")
        print(f"  Description: {response.get('description', 'N/A')}")
        print(f"  Records: {len(response.get('data', []))}")
        if response.get('sql_query'):
            print(f"\n  {BOLD}SQL Generated:{ENDC}")
            print(f"  {response.get('sql_query')}\n")
        
        # Show sample data
        if response.get('data'):
            print(f"  {BOLD}Sample Data:{ENDC}")
            data = response.get('data', [])[:3]
            for row in data:
                print(f"    {row}")
    else:
        print(f"{RED}✗ Error: {response.get('error', 'Unknown error')}{ENDC}")

def test_health():
    """Check if API is running."""
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print(f"{GREEN}✓ API is running{ENDC}")
            return True
    except:
        pass
    return False

def run_demo():
    """Run the demonstration."""
    print_header("Dashboard Analytics - Demo")
    
    # Check API
    print("Checking API connection...")
    if not test_health():
        print(f"{RED}✗ Cannot connect to API at {API_BASE}{ENDC}")
        print("Make sure the backend is running:")
        print("  cd backend")
        print("  python -m uvicorn main:app --reload")
        return
    
    # Query 1: Simple Aggregation
    print_header("Query 1: Simple Aggregation")
    query1 = "Show me total revenue by region"
    print_query(
        1,
        query1,
        "Basic aggregation - sum revenue grouped by region. Expected: Bar chart"
    )
    
    try:
        print("Processing...")
        start = time.time()
        response1 = requests.post(
            f"{API_BASE}/query",
            json={"query": query1}
        ).json()
        elapsed = time.time() - start
        print_result(response1)
        print(f"⏱ Time: {elapsed:.2f}s\n")
    except Exception as e:
        print(f"{RED}Error: {e}{ENDC}\n")
    
    time.sleep(1)
    
    # Query 2: Time Series with Filter
    print_header("Query 2: Time Series with Filter")
    query2 = "Monthly sales revenue for Q3 2023 as a line chart"
    print_query(
        2,
        query2,
        "Time series analysis - monthly revenue trend. Expected: Line chart"
    )
    
    try:
        print("Processing...")
        start = time.time()
        response2 = requests.post(
            f"{API_BASE}/query",
            json={"query": query2}
        ).json()
        elapsed = time.time() - start
        print_result(response2)
        print(f"⏱ Time: {elapsed:.2f}s\n")
    except Exception as e:
        print(f"{RED}Error: {e}{ENDC}\n")
    
    time.sleep(1)
    
    # Query 3: Multi-faceted Analysis
    print_header("Query 3: Multi-faceted Analysis")
    query3 = "Top 5 product categories by revenue in the North and East regions"
    print_query(
        3,
        query3,
        "Complex query - top products with filters. Expected: Bar chart"
    )
    
    try:
        print("Processing...")
        start = time.time()
        response3 = requests.post(
            f"{API_BASE}/query",
            json={"query": query3}
        ).json()
        elapsed = time.time() - start
        print_result(response3)
        print(f"⏱ Time: {elapsed:.2f}s\n")
    except Exception as e:
        print(f"{RED}Error: {e}{ENDC}\n")
    
    # Summary
    print_header("Demo Summary")
    print(f"{GREEN}✓ Successfully demonstrated three progressively complex queries{ENDC}")
    print("\nQuery 1: Simple aggregation with grouping")
    print("Query 2: Time-series filtering")
    print("Query 3: Top-N with multiple filters")
    print("\nNext Steps:")
    print("1. Open frontend at http://localhost:5173/")
    print("2. Try queries yourself")
    print("3. Upload your own CSV data")
    print("4. Explore different chart types\n")

if __name__ == "__main__":
    run_demo()
