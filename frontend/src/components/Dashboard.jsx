<<<<<<< HEAD
import React from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import ChartRenderer from './ChartRenderer'

const Dashboard = ({ query, result, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin mb-4">
          <Loader size={48} className="text-blue-500" />
        </div>
        <p className="text-slate-300 text-lg">Generating your dashboard...</p>
        <p className="text-slate-500 text-sm mt-2">Processing: <span className="text-slate-400 italic">{query}</span></p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 flex gap-4">
        <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
        <div>
          <h3 className="text-red-200 font-semibold mb-2">Error Processing Query</h3>
          <p className="text-red-100">{error}</p>
          <p className="text-red-300 text-sm mt-3">Try rephrasing your question or check the sample queries for guidance.</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="border-b border-slate-700 pb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">
          {result.title || 'Dashboard'}
        </h2>
        {result.description && (
          <p className="text-slate-400 text-lg">{result.description}</p>
        )}
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 gap-8">
        {/* Main Chart */}
        <div className="card-3d bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:shadow-xl transition-all">
          <ChartRenderer config={result} data={result.data} />
        </div>

        {/* Query Info */}
        {result.sql_query && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <details className="cursor-pointer">
              <summary className="flex items-center gap-2 text-slate-300 hover:text-slate-100 font-semibold">
                <span>View SQL Query</span>
              </summary>
              <pre className="mt-4 bg-slate-800 p-4 rounded text-sm text-slate-300 overflow-x-auto text-xs">
                {result.sql_query}
              </pre>
            </details>
          </div>
        )}

        {/* Data Stats */}
        {result.data && result.data.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-400 text-sm">Records</p>
              <p className="text-2xl font-bold text-blue-400">{result.data.length}</p>
            </div>
            {result.y_axis && (
              <>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {result.data
                      .reduce((sum, item) => sum + (parseFloat(item[result.y_axis]) || 0), 0)
                      .toFixed(0)}
                  </p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Average</p>
                  <p className="text-2xl font-bold text-pink-400">
                    {(result.data
                      .reduce((sum, item) => sum + (parseFloat(item[result.y_axis]) || 0), 0) /
                      result.data.length).toFixed(0)}
                  </p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Chart Type</p>
                  <p className="text-2xl font-bold text-emerald-400 capitalize">{result.chart_type}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
=======
/**
 * Dashboard.jsx — Responsive dashboard grid that displays charts,
 * a summary card, and conversation history.
 * Features parallax-style scroll effects and 3D card hover.
 */

import React from 'react';
import ChartRenderer from './ChartRenderer';

/* ── Loading skeleton ── */
const LoadingSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto mt-8 animate-fade-in">
    <div className="flex items-center gap-3 mb-6">
      <div className="typing-dot" />
      <div className="typing-dot" />
      <div className="typing-dot" />
      <span className="text-sm text-slate-500 ml-2">Analyzing your question…</span>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="glass-card p-6">
          <div className="skeleton h-5 w-3/4 mb-4" />
          <div className="skeleton h-[300px] w-full" />
        </div>
      ))}
    </div>
  </div>
);

/* ── Summary Card ── */
const SummaryCard = ({ summary }) => (
  <div className="glass-card glow-border p-5 animate-slide-up">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-primary-300 mb-1">AI Insight</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
      </div>
    </div>
  </div>
);

/* ── Error Card ── */
const ErrorCard = ({ error }) => (
  <div className="glass-card border-red-500/20 p-5 animate-slide-up">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-red-300 mb-1">Could not process query</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
      </div>
    </div>
  </div>
);

/* ── Conversation turn ── */
const ChatBubble = ({ role, content }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
      role === 'user'
        ? 'bg-primary-500/15 text-primary-100 rounded-br-md'
        : 'glass-card !rounded-bl-md text-slate-300 p-4'
    }`}>
      {content}
    </div>
  </div>
);

/* ── Main Dashboard Export ── */
export default function Dashboard({ results, isLoading, history }) {
  if (isLoading) return <LoadingSkeleton />;
  if (!results && history.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 space-y-6">
      {/* Conversation history */}
      {history.length > 0 && (
        <div className="space-y-3 mb-6">
          {history.map((turn, i) => (
            <ChatBubble key={i} role={turn.role} content={turn.content} />
          ))}
        </div>
      )}

      {/* Latest results */}
      {results && (
        <>
          {/* Error */}
          {results.error && <ErrorCard error={results.error} />}

          {/* Summary */}
          {results.summary && <SummaryCard summary={results.summary} />}

          {/* Charts Grid */}
          {results.charts && results.charts.length > 0 && (
            <div className={`grid gap-6 ${
              results.charts.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {results.charts.map((chart, i) => (
                <div
                  key={i}
                  className="card-3d"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="card-3d-inner">
                    <ChartRenderer config={chart.config} data={chart.data} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
>>>>>>> 0661e51384df2bbd95f08e75ce0d663ce36526c8
