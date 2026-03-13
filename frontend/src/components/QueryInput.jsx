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
