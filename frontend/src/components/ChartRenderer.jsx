import React from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Table, TableBody, TableCell, TableHead, TableRow
} from 'recharts'

const ChartRenderer = ({ config, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400">No data to display</p>
      </div>
    )
  }

  const commonProps = {
    margin: { top: 5, right: 30, left: 0, bottom: 5 }
  }

  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
    color: '#e2e8f0'
  }

  switch (config.chart_type?.toLowerCase()) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.x_axis || 'name'} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Line
              type="monotone"
              dataKey={config.y_axis || 'value'}
              stroke="#60a5fa"
              dot={{ fill: '#60a5fa', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.x_axis || 'name'} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey={config.y_axis || 'value'} fill="#a78bfa" />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'pie':
      const COLORS = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#fbbf24']
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={config.y_axis || 'value'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      )

    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey={config.x_axis || 'x'} stroke="#94a3b8" />
            <YAxis dataKey={config.y_axis || 'y'} stroke="#94a3b8" />
            <Tooltip contentStyle={tooltipStyle} />
            <Scatter name="Data" data={data} fill="#f472b6" />
          </ScatterChart>
        </ResponsiveContainer>
      )

    case 'table':
    default:
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700">
              <tr>
                {Object.keys(data[0] || {}).map((key) => (
                  <th key={key} className="px-4 py-2 text-left text-slate-200 font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                  {Object.values(row).map((val, colIdx) => (
                    <td key={colIdx} className="px-4 py-2 text-slate-300">
                      {typeof val === 'number' ? val.toFixed(2) : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

export default ChartRenderer
