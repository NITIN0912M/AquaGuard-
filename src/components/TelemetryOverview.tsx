import React from 'react';
import { Gauge, Activity, Droplets, Database, Zap, DollarSign, TrendingDown, AlertCircle } from 'lucide-react';
import { TelemetryState } from '../types';

interface TelemetryOverviewProps {
  telemetry: TelemetryState;
  currency: string;
  onTogglePump: () => void;
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({
  telemetry,
  currency,
  onTogglePump,
}) => {
  const budgetPercentage = Math.min(
    100,
    Math.round((telemetry.todayCumulativeLiters / telemetry.dailyBudgetLiters) * 100)
  );

  const isOverBudget = telemetry.todayCumulativeLiters > telemetry.dailyBudgetLiters;
  const remainingLiters = Math.max(0, telemetry.dailyBudgetLiters - telemetry.todayCumulativeLiters);

  // Pressure health check
  const isPressureNormal = telemetry.systemPressure >= 40 && telemetry.systemPressure <= 65;
  const isHighPressure = telemetry.systemPressure > 65;

  // Conversion rate for currency estimation ($0.0035 / Litre default municipal baseline)
  const ratePerLiter = currency === '₹' ? 0.35 : currency === '€' ? 0.0038 : 0.0035;
  const todayCost = (telemetry.todayCumulativeLiters * ratePerLiter).toFixed(2);

  // SVG Circle calculation for Circular Progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // 282.74
  const strokeDashoffset = circumference - (budgetPercentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Daily Budget Card with Geometric Circular Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Daily Consumption</h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
            {budgetPercentage}% USED
          </span>
        </div>

        <div className="my-3 flex items-center justify-center relative">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="9"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={isOverBudget ? '#ef4444' : budgetPercentage > 85 ? '#f59e0b' : '#2563eb'}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl lg:text-3xl font-black text-slate-800 font-mono tracking-tight">
                {telemetry.todayCumulativeLiters.toFixed(0)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                / {telemetry.dailyBudgetLiters}L
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 flex items-center justify-between">
          {isOverBudget ? (
            <span className="text-red-600 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> +{(telemetry.todayCumulativeLiters - telemetry.dailyBudgetLiters).toFixed(0)}L over
            </span>
          ) : (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> {remainingLiters.toFixed(0)}L left
            </span>
          )}
          <span className="font-bold text-slate-700 font-mono">
            Est: <span className="text-blue-600">{currency}{todayCost}</span>
          </span>
        </div>
      </div>

      {/* 2. Real-time Flow Rate Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Real-Time Flow</h3>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded font-bold uppercase ${
              telemetry.totalFlowRate > 15
                ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                : telemetry.totalFlowRate > 0
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {telemetry.totalFlowRate > 15 ? 'HIGH SURGE' : telemetry.totalFlowRate > 0 ? 'STREAMING' : 'IDLE'}
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-black text-slate-800 font-mono tracking-tight">
              {telemetry.totalFlowRate.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-blue-600 uppercase">L / min</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            ≈ {(telemetry.totalFlowRate * 60).toFixed(0)} Liters / hour instantaneous
          </p>
        </div>

        {/* Geometric Multi-bar Flow visualizer */}
        <div className="space-y-1.5 border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between gap-1 h-8 px-1">
            {[0.2, 0.4, 0.6, 0.8, 1.0, 0.7, 0.9, 0.5, 0.3, 0.6, 0.8, 0.95].map((scale, i) => {
              const flowFactor = Math.min(1, telemetry.totalFlowRate / 18);
              const heightPercent = Math.max(15, Math.round(scale * flowFactor * 100));
              return (
                <div
                  key={i}
                  className={`w-full rounded-t transition-all duration-300 ${
                    telemetry.totalFlowRate > 15
                      ? 'bg-red-500'
                      : i % 2 === 0
                      ? 'bg-blue-600'
                      : 'bg-blue-300'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>0 L/min</span>
            <span>20 L/min MAX</span>
          </div>
        </div>
      </div>

      {/* 3. System Water Pressure Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Line Pressure</h3>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded font-bold uppercase ${
              isPressureNormal
                ? 'bg-green-50 text-green-700 border border-green-200'
                : isHighPressure
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {isPressureNormal ? 'STABLE' : isHighPressure ? 'HIGH SURGE' : 'DROP ALERT'}
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-black text-slate-800 font-mono tracking-tight">
              {telemetry.systemPressure.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-indigo-600 uppercase">PSI</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            ≈ {(telemetry.systemPressure * 0.0689476).toFixed(2)} Bar (Target: 45–60 PSI)
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-1.5">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="w-[35%] bg-amber-400 h-full" />
            <div className="w-[30%] bg-emerald-500 h-full" />
            <div className="w-[35%] bg-red-400 h-full" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
            <span>0 PSI</span>
            <span className="text-emerald-700 font-extrabold">IDEAL: 50 PSI</span>
            <span>100 PSI</span>
          </div>
        </div>
      </div>

      {/* 4. Overhead Tank / Reservoir Level Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-300 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-sky-500"></div>
        <div className="flex items-center justify-between">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tank Reservoir</h3>
          <button
            onClick={onTogglePump}
            className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase transition-all flex items-center gap-1 shadow-xs ${
              telemetry.pumpStatus === 'pumping'
                ? 'bg-blue-600 text-white animate-pulse'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Smart Inlet Booster Pump"
          >
            <Zap className="w-3 h-3" />
            {telemetry.pumpStatus === 'pumping' ? 'PUMP ACTIVE' : 'STANDBY'}
          </button>
        </div>

        <div className="my-2 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-800 font-mono tracking-tight">
                {telemetry.tankLevelPercent}%
              </span>
              <span className="text-xs font-bold text-slate-500">
                ({telemetry.tankCurrentLiters} / {telemetry.tankCapacityLiters}L)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {telemetry.pumpStatus === 'pumping' ? 'Refilling at +14 L/min' : 'Auto refill threshold: 30%'}
            </p>
          </div>

          {/* Clean Geometric Tank Cylinder */}
          <div className="w-11 h-14 rounded-md border-2 border-slate-300 bg-slate-100 relative overflow-hidden flex flex-col justify-end p-0.5 shrink-0 shadow-inner">
            <div
              className="w-full bg-blue-600 rounded-xs transition-all duration-700 relative"
              style={{ height: `${telemetry.tankLevelPercent}%` }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-white/40" />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${telemetry.tankLevelPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
