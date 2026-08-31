import React from 'react';
import { Droplet, AlertTriangle, ShieldCheck, ShieldAlert, Zap, Sliders, PhoneCall, RefreshCw } from 'lucide-react';
import { TelemetryState } from '../types';

interface HeaderProps {
  telemetry: TelemetryState;
  onToggleMainValve: () => void;
  onOpenSettings: () => void;
  onOpenEmergency: () => void;
  propertyType: string;
  onChangePropertyType: (type: string) => void;
  isSimulating: boolean;
  currency: string;
  onChangeCurrency: (c: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  onToggleMainValve,
  onOpenSettings,
  onOpenEmergency,
  propertyType,
  onChangePropertyType,
  currency,
  onChangeCurrency,
}) => {
  const isValveOpen = telemetry.mainValveState === 'open';
  const hasActiveLeak = telemetry.activeLeaks.length > 0;

  return (
    <header className="bg-blue-600 text-white sticky top-0 z-40 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Geometry Logo */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center shrink-0 shadow-xs relative">
              <div className="w-4 h-4 bg-blue-600 rotate-45"></div>
              {hasActiveLeak && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-xl font-black tracking-tight text-white uppercase">
                  AquaGuard <span className="font-light text-blue-200">Sense</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-700/80 text-blue-100 border border-blue-400/40">
                  IoT v2.4
                </span>
              </div>
              <p className="text-[11px] text-blue-100/80 font-medium hidden sm:block">
                Precision Hydraulic Telemetry & Autonomous Conservation
              </p>
            </div>
          </div>

          {/* Property Selector */}
          <div className="flex items-center gap-2">
            <select
              value={propertyType}
              onChange={(e) => onChangePropertyType(e.target.value)}
              className="bg-blue-700/90 text-white text-xs font-semibold rounded-md px-2.5 py-1.5 border border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors cursor-pointer"
            >
              <option value="Residential Home (3-BHK)" className="bg-slate-900 text-white">🏡 Residential (3-BHK)</option>
              <option value="Campus & Hostel Wing" className="bg-slate-900 text-white">🏫 Campus & Hostel Wing</option>
              <option value="Apartment Society Block" className="bg-slate-900 text-white">🏢 Apartment Block</option>
              <option value="Community Hospital Zone" className="bg-slate-900 text-white">🏥 Healthcare Clinic</option>
            </select>
          </div>
        </div>

        {/* Status Indicators & Control Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
          {/* Institutional / Facility ID */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-blue-100 font-bold uppercase tracking-wider">
            <span className="opacity-70">ID:</span>
            <span className="font-mono text-white">#AG-4920</span>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center bg-blue-700/80 rounded-md p-0.5 border border-blue-400/50 text-xs">
            {['$', '₹', '€'].map((curr) => (
              <button
                key={curr}
                onClick={() => onChangeCurrency(curr)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  currency === curr
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Sustainability Score Badge */}
          <div className="flex items-center gap-1.5 bg-blue-500/80 border border-blue-400 px-3 py-1 rounded-full text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-100" />
            <span className="text-blue-100 text-[11px] font-bold uppercase tracking-wider">Eco:</span>
            <span className="font-black text-white">{telemetry.ecoScore}</span>
            <span className="text-[10px] text-blue-200">/100</span>
          </div>

          {/* System Status Pill */}
          {hasActiveLeak ? (
            <div className="bg-red-500 px-3 py-1 rounded-full flex items-center gap-1.5 border border-red-400 text-xs font-bold text-white animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>{telemetry.activeLeaks.length} LEAK DETECTED</span>
            </div>
          ) : (
            <div className="bg-blue-500 px-3.5 py-1 rounded-full flex items-center gap-2 border border-blue-400 text-xs font-bold text-white">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="tracking-wider">SYSTEM STABLE</span>
            </div>
          )}

          {/* Master Valve Toggle Button */}
          <button
            onClick={onToggleMainValve}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 ${
              isValveOpen
                ? 'bg-white text-blue-700 hover:bg-blue-50 border border-white'
                : 'bg-red-500 hover:bg-red-600 text-white border border-red-400 animate-pulse'
            }`}
            title="Toggle Main Ingress Smart Solenoid Valve"
          >
            {isValveOpen ? (
              <>
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>VALVE: OPEN</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>VALVE: SHUT</span>
              </>
            )}
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenEmergency}
            className="p-1.5 rounded-md bg-red-700/90 hover:bg-red-800 text-white border border-red-500/70 transition-colors"
            title="Emergency SOS Water Response Protocol"
          >
            <PhoneCall className="w-4 h-4" />
          </button>

          {/* Automation Config Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white border border-blue-400/60 transition-colors"
            title="Smart Automation Thresholds"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
