import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, Calendar, AlertOctagon } from 'lucide-react';
import { TelemetryState } from '../types';

interface AnalyticsViewProps {
  telemetry: TelemetryState;
  currency: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ telemetry, currency }) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const weeklyTrends = [
    { day: 'Mon', usage: 285, target: 320, efficiency: 91 },
    { day: 'Tue', usage: 310, target: 320, efficiency: 88 },
    { day: 'Wed', usage: 260, target: 320, efficiency: 95 },
    { day: 'Thu', usage: 340, target: 320, efficiency: 79 },
    { day: 'Fri', usage: 295, target: 320, efficiency: 89 },
    { day: 'Sat', usage: 380, target: 320, efficiency: 74 },
    { day: 'Sun (Today)', usage: telemetry.todayCumulativeLiters, target: 320, efficiency: telemetry.ecoScore },
  ];

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md border border-blue-200 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Water Consumption Analytics & Behavioral Trends
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Comparative diurnal telemetry against regional water conservation baselines.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              timeframe === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today (Diurnal)
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7-Day Trend
          </button>
        </div>
      </div>

      {/* Chart Row 1: Diurnal Flow or Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area / Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-50/70 p-4 md:p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {timeframe === 'today'
                  ? '24-Hour Diurnal Demand Curve (Liters)'
                  : 'Weekly Conservation vs Target Benchmark'}
              </h3>
              <p className="text-xs text-slate-500">
                {timeframe === 'today'
                  ? 'Highlights peak consumption windows and night baseline zero verification.'
                  : 'Continuous weekly tracking towards net-zero wastage.'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-blue-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Actual
              </span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Baseline Target
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {timeframe === 'today' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry.hourlyUsage}>
                  <defs>
                    <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="L" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    name="Actual Usage (L)"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#usageGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    name="Target Baseline (L)"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="L" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="usage" name="Consumed (L)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Daily Quota (L)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
            <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              Peak Hour: 08:00 AM (Morning Shower Peak - 45.2 L)
            </span>
            <span className="text-green-700 font-bold">
              Night Flow (02:00 AM - 04:00 AM): 0.2 L (Clean Zero-Baseline)
            </span>
          </div>
        </div>

        {/* Fixture / Appliance Breakdown Donut (1 col) */}
        <div className="bg-slate-50/70 p-4 md:p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-blue-600" />
                End-Use Category Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Where your water is consumed today.
            </p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={telemetry.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="usage"
                >
                  {telemetry.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-500 font-medium">Total</span>
              <span className="text-sm font-extrabold text-slate-800 font-mono">
                {telemetry.todayCumulativeLiters.toFixed(0)} L
              </span>
            </div>
          </div>

          {/* Category Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
            {telemetry.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.category}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {cat.usage.toFixed(1)} L ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
