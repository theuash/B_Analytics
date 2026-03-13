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
