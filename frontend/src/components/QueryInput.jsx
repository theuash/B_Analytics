<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader, AlertCircle, CheckCircle, Upload, RefreshCw } from 'lucide-react'

const QueryInput = ({ onSubmit, isLoading, onFileUpload }) => {
  const [query, setQuery] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSubmit(query)
      setQuery('')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      onFileUpload(file)
    }
  }

  return (
    <div className="space-y-4">
      {/* Query Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit(e)
              }
            }}
            placeholder="Ask a question about your data... (e.g., 'Show me total revenue by region' or 'Top 5 products by sales')"
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg p-4 transition-all duration-200 flex items-center justify-center min-w-max"
          >
            {isLoading ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>

      {/* File Upload */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <Upload size={18} />
          Upload CSV
        </button>
        {fileName && (
          <span className="text-sm text-slate-400">
            Loaded: <span className="text-slate-300 font-medium">{fileName}</span>
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default QueryInput
=======
/**
 * QueryInput.jsx — Natural language query input with chat history,
 * CSV upload, and example query suggestions.
 */

import React, { useState, useRef } from 'react';

const EXAMPLE_QUERIES = [
  "Total revenue by region",
  "Monthly sales trend for 2023",
  "Top 5 product categories by revenue",
  "Compare units sold across quarters",
  "Revenue breakdown by product category as a pie chart",
  "Show sales for Q3 filtered by East region",
];

export default function QueryInput({
  onSubmit,
  onUpload,
  isLoading,
  activeTable,
  tables = [],
  onTableChange,
}) {
  const [query, setQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSubmit(query.trim());
    setQuery('');
  };

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  /* ── CSV Upload handlers ── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) onUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ── Main Input Card ── */}
      <div className="glass-card glow-border p-6 animate-slide-up">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-lg shadow-lg shadow-primary-500/20">
            📊
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              DataLens AI
            </h1>
            <p className="text-xs text-slate-500">Ask anything about your data</p>
          </div>
        </div>

        {/* Query Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            <input
              id="query-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your data…"
              disabled={isLoading}
              className="w-full px-5 py-4 pr-14 rounded-xl bg-surface-900/60 border border-white/[0.06]
                         text-white placeholder-slate-500 text-sm
                         focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10
                         transition-all duration-300 disabled:opacity-50"
            />
            <button
              id="submit-query"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg
                         bg-gradient-to-r from-primary-500 to-purple-500 text-white
                         flex items-center justify-center
                         hover:shadow-lg hover:shadow-primary-500/25 active:scale-95
                         transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Table selector + Upload */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {/* Table selector */}
          {tables.length > 1 && (
            <select
              id="table-select"
              value={activeTable}
              onChange={(e) => onTableChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-surface-900/60 border border-white/[0.06]
                         text-sm text-slate-300 focus:outline-none focus:border-primary-500/40"
            >
              {tables.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          {/* CSV Upload */}
          <button
            id="upload-csv-btn"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-surface-900/60 border border-white/[0.06] text-slate-400
                       hover:text-primary-300 hover:border-primary-500/20 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
            </svg>
            Upload CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <span className="text-[10px] text-slate-600 ml-auto">
            Querying: <span className="text-slate-400 font-medium">{activeTable}</span>
          </span>
        </div>

        {/* ── Example Queries ── */}
        <div className="mt-5 pt-4 border-t border-white/[0.04]">
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2.5 font-medium">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExampleClick(ex)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400
                           bg-white/[0.02] border border-white/[0.04]
                           hover:bg-primary-500/10 hover:text-primary-300 hover:border-primary-500/15
                           transition-all duration-200"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CSV Drag-and-Drop Zone ── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`mt-4 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-primary-400 bg-primary-500/5'
            : 'border-white/[0.04] hover:border-white/[0.08]'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg className={`w-8 h-8 transition-colors ${isDragOver ? 'text-primary-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-xs text-slate-500">
            {isDragOver ? 'Drop your CSV file here!' : 'Drag & drop a CSV file to query your own data'}
          </p>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 0661e51384df2bbd95f08e75ce0d663ce36526c8
