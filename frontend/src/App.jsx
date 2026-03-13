<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import { BarChart3, Zap, Github } from 'lucide-react'
import QueryInput from './components/QueryInput'
import Dashboard from './components/Dashboard'
import SampleQueries from './components/SampleQueries'
import { dashboardAPI } from './services/api'

function App() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverReady, setServerReady] = useState(false)

  // Check if server is running
  useEffect(() => {
    dashboardAPI.health()
      .then(() => setServerReady(true))
      .catch(() => setServerReady(false))
  }, [])

  const handleSubmitQuery = async (userQuery) => {
    setQuery(userQuery)
    setResult(null)
    setError(null)
    setIsLoading(true)

    try {
      const response = await dashboardAPI.processQuery(userQuery)
      if (response.success) {
        setResult(response)
        setError(null)
      } else {
        setError(response.error || 'Failed to process query')
        setResult(null)
      }
    } catch (err) {
      setError('Failed to connect to the backend. Is the server running on http://localhost:8000?')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    try {
      const response = await dashboardAPI.uploadCSV(file)
      if (response.success) {
        setError(null)
      } else {
        setError('Failed to upload CSV: ' + response.error)
      }
    } catch (err) {
      setError('Failed to upload CSV')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard Analytics</h1>
              <p className="text-sm text-slate-400">AI-Powered Business Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs px-3 py-1 rounded-full ${serverReady ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {serverReady ? '✓ API Connected' : '✗ API Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        {!result && !isLoading && (
          <div className="mb-12 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-full mb-6">
              <Zap size={16} />
              <span className="text-sm font-medium">Convert your data questions into beautiful dashboards instantly</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4 leading-tight">
              Ask Questions.
              <br />
              <span className="gradient-text">Get Insights.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Type in natural English and our AI will automatically generate the perfect visualization for your data.
            </p>
          </div>
        )}

        {/* Sample Queries */}
        {!result && !isLoading && serverReady && (
          <SampleQueries onSelectQuery={handleSubmitQuery} isLoading={isLoading} />
        )}

        {/* Query Input */}
        <div className="mb-8 card-3d">
          <QueryInput
            onSubmit={handleSubmitQuery}
            isLoading={isLoading}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Dashboard */}
        <div>
          <Dashboard
            query={query}
            result={result}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Footer */}
        {!error && (
          <footer className="mt-16 pt-8 border-t border-slate-700/50 text-center text-slate-400 text-sm">
            <p>Built with React, FastAPI, and Google Gemini</p>
          </footer>
        )}
      </main>
    </div>
  )
}

export default App
=======
/**
 * App.jsx — Root application component.
 * Manages state for queries, dashboard results, conversation history,
 * and CSV uploads.
 */

import React, { useState, useEffect, useCallback } from 'react';
import QueryInput from './components/QueryInput';
import Dashboard from './components/Dashboard';
import { sendQuery, sendFollowUp, uploadCSV, getTables } from './api';

export default function App() {
  /* ── State ── */
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);        // conversation turns [{role, content}]
  const [tables, setTables] = useState(['sales']);
  const [activeTable, setActiveTable] = useState('sales');
  const [uploadMsg, setUploadMsg] = useState('');

  /* ── Fetch available tables on mount ── */
  useEffect(() => {
    getTables()
      .then(res => { if (res.tables?.length) setTables(res.tables); })
      .catch(() => {});
  }, []);

  /* ── Handle a new query ── */
  const handleQuery = useCallback(async (queryText) => {
    setIsLoading(true);
    setUploadMsg('');

    // Add user message to history
    const userTurn = { role: 'user', content: queryText };
    const newHistory = [...history, userTurn];

    try {
      let data;
      if (history.length > 0) {
        // Follow-up with context
        data = await sendFollowUp(queryText, history, activeTable);
      } else {
        // Fresh query
        data = await sendQuery(queryText, activeTable);
      }

      const aiTurn = { role: 'model', content: data.summary || 'Here are the results.' };
      setHistory([...newHistory, aiTurn]);
      setResults(data);
    } catch (err) {
      setResults({ charts: [], summary: '', error: err.message });
      setHistory(newHistory);
    } finally {
      setIsLoading(false);
    }
  }, [history, activeTable]);

  /* ── Handle CSV upload ── */
  const handleUpload = useCallback(async (file) => {
    setIsLoading(true);
    setUploadMsg('');
    try {
      const res = await uploadCSV(file);
      setActiveTable(res.table_name);
      setTables(prev => prev.includes(res.table_name) ? prev : [...prev, res.table_name]);
      setUploadMsg(res.message);
      // Clear previous results for new table
      setResults(null);
      setHistory([]);
    } catch (err) {
      setUploadMsg(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Reset conversation ── */
  const handleNewChat = () => {
    setResults(null);
    setHistory([]);
    setUploadMsg('');
  };

  return (
    <div className="relative min-h-screen">
      {/* ── Parallax background ── */}
      <div className="parallax-container">
        <div className="parallax-orb" />
        <div className="parallax-orb" />
        <div className="parallax-orb" />
      </div>
      <div className="grid-pattern" />

      {/* ── Content ── */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs text-primary-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Powered by Google Gemini AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            Data<span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">Lens</span> AI
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Ask questions in plain English — get interactive dashboards instantly
          </p>
        </header>

        {/* ── Query Input ── */}
        <QueryInput
          onSubmit={handleQuery}
          onUpload={handleUpload}
          isLoading={isLoading}
          activeTable={activeTable}
          tables={tables}
          onTableChange={setActiveTable}
        />

        {/* Upload feedback */}
        {uploadMsg && (
          <div className="max-w-4xl mx-auto mt-4">
            <div className="glass-card p-3 text-sm text-center text-primary-300 animate-slide-up">
              {uploadMsg}
            </div>
          </div>
        )}

        {/* ── New chat button ── */}
        {history.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium
                         bg-surface-800/60 border border-white/[0.06] text-slate-400
                         hover:text-white hover:border-primary-500/20 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Conversation
            </button>
          </div>
        )}

        {/* ── Dashboard ── */}
        <Dashboard
          results={results}
          isLoading={isLoading}
          history={history}
        />

        {/* ── Footer ── */}
        <footer className="text-center mt-16 pb-8 text-xs text-slate-600">
          Built with FastAPI · React · Recharts · Google Gemini
        </footer>
      </div>
    </div>
  );
}
>>>>>>> 0661e51384df2bbd95f08e75ce0d663ce36526c8
