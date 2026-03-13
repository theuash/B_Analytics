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
