import React, { useState, useEffect } from 'react'
import { Sparkles, Lightbulb } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const SampleQueries = ({ onSelectQuery, isLoading }) => {
  const [samples, setSamples] = useState([])
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    dashboardAPI.getSampleQueries().then((data) => {
      setSamples(data.samples || [])
    }).catch(console.error)
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Lightbulb size={16} />
        Show suggestions
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <h3 className="font-semibold text-slate-100">Suggested Queries</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-slate-200"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {samples.map((query, idx) => (
          <button
            key={idx}
            onClick={() => {
              onSelectQuery(query)
              setIsOpen(false)
            }}
            disabled={isLoading}
            className="text-left text-sm bg-slate-700/50 hover:bg-slate-600 border border-slate-600 hover:border-blue-500 text-slate-300 p-3 rounded transition-all disabled:opacity-50"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SampleQueries
