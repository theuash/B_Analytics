<<<<<<< HEAD
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
=======
/**
 * ChartRenderer.jsx — Dynamically renders the correct chart type
 * based on the config returned by the backend (Gemini AI).
 *
 * Supports: line, bar, pie, scatter, table
 */

import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Brush, Area,
  AreaChart
} from 'recharts';

/* ── Colour palette for chart series ── */
const COLORS = [
  '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
  '#f472b6', '#fb7185', '#f97316', '#facc15',
  '#4ade80', '#2dd4bf', '#22d3ee', '#60a5fa',
];

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !bg-surface-900/90 border-primary-500/20 text-sm min-w-[150px]">
      <p className="text-slate-300 font-medium mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || COLORS[i % COLORS.length] }} className="flex justify-between gap-4">
          <span>{entry.name || entry.dataKey}:</span>
          <span className="font-semibold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

/* ── Line / Area Chart ── */
const RenderLineChart = ({ data, config }) => {
  const yKeys = config.y_axis ? config.y_axis.split(',').map(k => k.trim()) : 
    Object.keys(data[0] || {}).filter(k => k !== config.x_axis);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {yKeys.map((key, i) => (
            <linearGradient key={key} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey={config.x_axis} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
        {yKeys.map((key, i) => (
          <React.Fragment key={key}>
            <Area
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              fill={`url(#gradient-${i})`}
              strokeWidth={2}
            />
          </React.Fragment>
        ))}
        {data.length > 15 && <Brush dataKey={config.x_axis} height={25} stroke="#6366f1" fill="rgba(15,23,42,0.8)" />}
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ── Bar Chart ── */
const RenderBarChart = ({ data, config }) => {
  const yKeys = config.y_axis ? config.y_axis.split(',').map(k => k.trim()) :
    Object.keys(data[0] || {}).filter(k => k !== config.x_axis);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey={config.x_axis} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
        {yKeys.map((key, i) => (
          <Bar
            key={key}
            dataKey={key}
            fill={COLORS[i % COLORS.length]}
            radius={[6, 6, 0, 0]}
            maxBarSize={60}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ── Pie / Donut Chart ── */
const RenderPieChart = ({ data, config }) => {
  const nameKey = config.x_axis || Object.keys(data[0] || {})[0];
  const valueKey = config.y_axis || Object.keys(data[0] || {})[1];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          paddingAngle={3}
          strokeWidth={0}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={{ stroke: '#64748b' }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

/* ── Scatter Plot ── */
const RenderScatterChart = ({ data, config }) => {
  const xKey = config.x_axis || Object.keys(data[0] || {})[0];
  const yKey = config.y_axis || Object.keys(data[0] || {})[1];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
        <XAxis dataKey={xKey} name={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis dataKey={yKey} name={yKey} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Data" data={data} fill="#818cf8">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

/* ── Data Table ── */
const RenderTable = ({ data }) => {
  if (!data.length) return <p className="text-slate-500 text-sm">No data to display.</p>;
  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-800/80 backdrop-blur-sm">
            {columns.map(col => (
              <th key={col} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary-300 border-b border-white/5">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.03] hover:bg-primary-500/5 transition-colors">
              {columns.map(col => (
                <td key={col} className="px-4 py-2.5 text-slate-300 whitespace-nowrap">
                  {typeof row[col] === 'number' ? row[col].toLocaleString() : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ── Main Export ── */
export default function ChartRenderer({ config, data }) {
  const [showSQL, setShowSQL] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="glass-card glass-card-hover p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-white mb-2">{config?.title || 'No Data'}</h3>
        <p className="text-slate-400 text-sm">No data available for this chart.</p>
      </div>
    );
  }

  const chartRenderers = {
    line: RenderLineChart,
    bar: RenderBarChart,
    pie: RenderPieChart,
    scatter: RenderScatterChart,
    table: RenderTable,
  };

  const ChartComponent = chartRenderers[config.chart_type] || RenderTable;

  return (
    <div className="glass-card glass-card-hover glow-border p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-lg font-semibold text-white truncate">{config.title || 'Chart'}</h3>
          {config.description && (
            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{config.description}</p>
          )}
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20 flex-shrink-0">
          {config.chart_type}
        </span>
      </div>

      {/* Chart */}
      <div className="mt-2">
        {config.chart_type === 'table' ? (
          <ChartComponent data={data} />
        ) : (
          <ChartComponent data={data} config={config} />
        )}
      </div>

      {/* SQL Toggle */}
      {config.sql_query && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setShowSQL(!showSQL)}
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1.5"
          >
            <svg className={`w-3 h-3 transition-transform ${showSQL ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showSQL ? 'Hide' : 'Show'} SQL Query
          </button>
          {showSQL && (
            <pre className="sql-block mt-2 animate-fade-in">{config.sql_query}</pre>
          )}
        </div>
      )}
    </div>
  );
}
>>>>>>> 0661e51384df2bbd95f08e75ce0d663ce36526c8
