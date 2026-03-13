/**
 * api.js — API client for communicating with the FastAPI backend.
 */

const BASE_URL = '/api';

/**
 * Send a natural language query to the backend.
 * @param {string} query - The user's plain-English question
 * @param {string} tableName - Target table (default: "sales")
 * @returns {Promise<object>} - { charts, summary, error }
 */
export async function sendQuery(query, tableName = 'sales') {
  const res = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, table_name: tableName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Send a follow-up query with conversation history.
 * @param {string} query
 * @param {Array} history - [{role, content}, ...]
 * @param {string} tableName
 * @returns {Promise<object>}
 */
export async function sendFollowUp(query, history = [], tableName = 'sales') {
  const res = await fetch(`${BASE_URL}/follow-up`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, history, table_name: tableName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

/**
 * Upload a CSV file to the backend.
 * @param {File} file
 * @returns {Promise<object>} - { table_name, columns, row_count, message }
 */
export async function uploadCSV(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed (${res.status})`);
  }
  return res.json();
}

/**
 * Retrieve the database schema.
 * @returns {Promise<object>} - { tables: { tableName: [{name, type}] } }
 */
export async function getSchema() {
  const res = await fetch(`${BASE_URL}/schema`);
  if (!res.ok) throw new Error('Failed to fetch schema');
  return res.json();
}

/**
 * Retrieve the list of available tables.
 * @returns {Promise<object>} - { tables: [string] }
 */
export async function getTables() {
  const res = await fetch(`${BASE_URL}/tables`);
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}
