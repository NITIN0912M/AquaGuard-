import React from 'react';
import { Utensils, Bath, Shirt, Sprout, Waves, ToggleLeft, ToggleRight, Radio, BatteryCharging, CheckCircle, AlertCircle } from 'lucide-react';
import { ZoneData } from '../types';

interface ZoneMonitorProps {
  zones: ZoneData[];
  onToggleZoneValve: (zoneId: string) => void;
  currency: string;
}

export const ZoneMonitor: React.FC<ZoneMonitorProps> = ({
  zones,
  onToggleZoneValve,
  currency,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Bath':
        return <Bath className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'Sprout':
        return <Sprout className="w-4 h-4" />;
      case 'Waves':
      default:
        return <Waves className="w-4 h-4" />;
    }
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm space-y-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-md border border-blue-200 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight">
              Sub-Metering & Zone Isolation Matrix
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Discrete IoT flow transmitters with automated solenoid shutoff per fixture zone.
            </p>
          </div>
        </div>
        <div className="text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded border border-blue-200">
          {zones.filter((z) => z.valveOpen).length} / {zones.length} Zones Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => {
          const usagePercent = Math.min(100, Math.round((zone.todayUsage / zone.targetUsage) * 100));
          const isOver = zone.todayUsage > zone.targetUsage;

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                !zone.valveOpen
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : zone.status === 'abnormal' || zone.status === 'critical'
                  ? 'bg-red-50 border-red-300 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-blue-300 shadow-2xs'
              }`}
            >
              {/* Header: Icon, Name, Valve Switch */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                      !zone.valveOpen
                        ? 'bg-slate-200 text-slate-500 border-slate-300'
                        : zone.flowRate > 0
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {getIcon(zone.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      {zone.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 block font-medium">{zone.location}</span>
                  </div>
                </div>

                {/* Individual Zone Valve Toggle */}
                <button
                  onClick={() => onToggleZoneValve(zone.id)}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer ${
                    zone.valveOpen
                      ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                  }`}
                  title={`Toggle ${zone.name} Solenoid Valve`}
                >
                  {zone.valveOpen ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-green-700" />
                      <span>ON</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-red-700" />
                      <span>OFF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Metrics */}
              <div className="my-3 grid grid-cols-2 gap-2 bg-white p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Live Flow</span>
                  <span className="text-sm font-extrabold text-slate-800 font-mono">
                    {zone.flowRate.toFixed(1)}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">L/min</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Today's Vol</span>
                  <span className="text-sm font-extrabold text-blue-600 font-mono">
                    {zone.todayUsage.toFixed(1)}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">/ {zone.targetUsage} L</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar & Health Status */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Daily Quota</span>
                  <span className={`font-bold ${isOver ? 'text-red-600' : 'text-slate-700'}`}>
                    {usagePercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-red-500'
                        : usagePercent > 80
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 font-mono">
                  <span className="flex items-center gap-1 font-sans">
                    <BatteryCharging className="w-3 h-3 text-green-600" />
                    Sensor: {zone.sensorHealth}%
                  </span>
                  <span>Pressure: {zone.pressure.toFixed(1)} PSI</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
