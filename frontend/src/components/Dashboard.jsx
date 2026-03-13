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
