import React, { useState, useEffect } from 'react';
import {
  Droplet,
  Activity,
  Radio,
  BarChart3,
  Sparkles,
  Trophy,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Info,
  Layers,
} from 'lucide-react';
import { TelemetryState, LeakIncident, ZoneId } from './types';
import { initialTelemetryState } from './data/initialData';
import { Header } from './components/Header';
import { TelemetryOverview } from './components/TelemetryOverview';
import { LeakDiagnosticSandbox } from './components/LeakDiagnosticSandbox';
import { ZoneMonitor } from './components/ZoneMonitor';
import { AnalyticsView } from './components/AnalyticsView';
import { AiWaterAdvisor } from './components/AiWaterAdvisor';
import { ConservationHub } from './components/ConservationHub';
import { SmartAutomationModal } from './components/SmartAutomationModal';
import { EmergencyModal } from './components/EmergencyModal';

export default function App() {
  const [telemetry, setTelemetry] = useState<TelemetryState>(initialTelemetryState);
  const [propertyType, setPropertyType] = useState('Residential Home (3-BHK)');
  const [currency, setCurrency] = useState('$');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'zones' | 'analytics' | 'ai_audit' | 'community'>('dashboard');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Live Telemetry Simulation Loop (1-second tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        // If main valve is shut off, total flow is 0 and pressure drops
        if (prev.mainValveState === 'closed' || prev.mainValveState === 'auto_locked') {
          return {
            ...prev,
            totalFlowRate: 0,
            systemPressure: Math.max(0, prev.systemPressure - 0.5),
            zones: prev.zones.map((z) => ({ ...z, flowRate: 0 })),
          };
        }

        // Calculate flow rate based on active leaks and normal random fluctuations
        let baseFlow = 2.0 + (Math.sin(Date.now() / 8000) * 1.5);
        let pressureVariance = 52.0 + (Math.cos(Date.now() / 7000) * 1.2);

        // Update active leaks accumulated liters
        const updatedLeaks = prev.activeLeaks.map((leak) => {
          const leakFlowPerSec = (leak.estimatedWastageRate / 3600);
          return {
            ...leak,
            totalWastedLitres: leak.totalWastedLitres + leakFlowPerSec,
          };
        });

        // Add leak flow to base flow
        const leakAdditionalLpm = updatedLeaks.reduce((acc, l) => acc + (l.estimatedWastageRate / 60), 0);
        const currentTotalFlow = Math.max(0, baseFlow + leakAdditionalLpm);

        // If burst pipe leak is active, drop pressure
        if (updatedLeaks.some((l) => l.type === 'burst')) {
          pressureVariance = 28.5 + (Math.random() * 2);
        }

        // Tank logic
        let newTankCurrent = prev.tankCurrentLiters;
        let newPumpStatus = prev.pumpStatus;

        if (prev.pumpStatus === 'pumping') {
          newTankCurrent = Math.min(prev.tankCapacityLiters, prev.tankCurrentLiters + 0.25); // +15 L/min
          if (newTankCurrent >= prev.tankCapacityLiters * 0.98) {
            newPumpStatus = 'standby';
          }
        } else {
          newTankCurrent = Math.max(100, prev.tankCurrentLiters - (currentTotalFlow / 60));
          if (newTankCurrent < prev.tankCapacityLiters * 0.3) {
            newPumpStatus = 'pumping'; // Auto-trigger refill
          }
        }

        const newTankPercent = Math.round((newTankCurrent / prev.tankCapacityLiters) * 100);

        // Accumulate today's usage
        const addedLitres = currentTotalFlow / 60;
        const newTodayLitres = prev.todayCumulativeLiters + addedLitres;

        // Update zones proportionally
        const updatedZones = prev.zones.map((zone) => {
          if (!zone.valveOpen) {
            return { ...zone, flowRate: 0 };
          }
          let zoneFlow = (currentTotalFlow * (zone.targetUsage / prev.dailyBudgetLiters));
          // If leak is in this zone
          const zoneLeak = updatedLeaks.find((l) => l.zoneId === zone.id);
          if (zoneLeak) {
            zoneFlow += (zoneLeak.estimatedWastageRate / 60);
          }
          return {
            ...zone,
            flowRate: zoneFlow,
            todayUsage: zone.todayUsage + (zoneFlow / 60),
            pressure: pressureVariance - (Math.random() * 0.5),
          };
        });

        // Recalculate EcoScore (100 base, penalized by leak presence & budget overrun)
        const budgetOverrun = Math.max(0, (newTodayLitres - prev.dailyBudgetLiters) / prev.dailyBudgetLiters);
        const leakPenalty = updatedLeaks.length * 15;
        const newEcoScore = Math.max(35, Math.min(100, Math.round(100 - (budgetOverrun * 40) - leakPenalty)));

        return {
          ...prev,
          totalFlowRate: currentTotalFlow,
          systemPressure: pressureVariance,
          todayCumulativeLiters: newTodayLitres,
          tankCurrentLiters: Math.round(newTankCurrent),
          tankLevelPercent: newTankPercent,
          pumpStatus: newPumpStatus,
          ecoScore: newEcoScore,
          activeLeaks: updatedLeaks,
          zones: updatedZones,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Master Valve Toggle
  const handleToggleMainValve = async () => {
    const nextAction = telemetry.mainValveState === 'open' ? 'closed' : 'open';
    try {
      await fetch('/api/valve/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction }),
      });
    } catch (e) {
      console.warn('Backend toggle offline, updating client state');
    }

    setTelemetry((prev) => ({
      ...prev,
      mainValveState: nextAction as any,
    }));
  };

  // Pump Toggle
  const handleTogglePump = () => {
    setTelemetry((prev) => ({
      ...prev,
      pumpStatus: prev.pumpStatus === 'pumping' ? 'standby' : 'pumping',
    }));
  };

  // Toggle individual zone valve
  const handleToggleZoneValve = (zoneId: string) => {
    setTelemetry((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === zoneId ? { ...z, valveOpen: !z.valveOpen } : z)),
    }));
  };

  // Simulate or Clear Leak Scenarios
  const handleSimulateLeak = (type: 'burst' | 'running_toilet' | 'micro_leak' | 'irrigation_jam' | 'clear') => {
    if (type === 'clear') {
      setTelemetry((prev) => ({
        ...prev,
        activeLeaks: [],
        leakDetected: false,
      }));
      return;
    }

    let leakData: LeakIncident;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'running_toilet') {
      leakData = {
        id: `leak_${Date.now()}`,
        zoneId: 'bathroom',
        zoneName: 'Master & Common Bath',
        type: 'running_toilet',
        title: 'Continuous Flapper Valve Bleed in Toilet Tank',
        description: 'Persistent baseline acoustic resonance detected during expected quiet hours (~3.5 L/min loss).',
        severity: 'warning',
        estimatedWastageRate: 210, // 3.5 L/min = 210 L/hour
        totalWastedLitres: 12.5,
        estimatedCostWasted: 0.85,
        detectedAt: now,
        status: 'active',
        autoShutoffTriggered: false,
      };
    } else if (type === 'burst') {
      leakData = {
        id: `leak_${Date.now()}`,
        zoneId: 'kitchen',
        zoneName: 'Kitchen & RO Purifier',
        type: 'burst',
        title: 'Severe High-Volume Pipe Rupture Detected',
        description: 'Instantaneous flow surge to 38.0 L/min accompanied by steep 24 PSI line pressure drop!',
        severity: 'critical',
        estimatedWastageRate: 2280, // 38 L/min = 2280 L/hour
        totalWastedLitres: 48.0,
        estimatedCostWasted: 3.6,
        detectedAt: now,
        status: 'active',
        autoShutoffTriggered: true,
      };
    } else if (type === 'micro_leak') {
      leakData = {
        id: `leak_${Date.now()}`,
        zoneId: 'kitchen',
        zoneName: 'Kitchen & RO Purifier',
        type: 'micro_leak',
        title: 'Under-Sink Micro-Drip Baseline Anomaly',
        description: 'Persistent zero-demand drift (0.6 L/min). Potential unseated faucet cartridge or RO drain leak.',
        severity: 'info',
        estimatedWastageRate: 36, // 0.6 L/min = 36 L/hour
        totalWastedLitres: 4.2,
        estimatedCostWasted: 0.25,
        detectedAt: now,
        status: 'active',
        autoShutoffTriggered: false,
      };
    } else {
      leakData = {
        id: `leak_${Date.now()}`,
        zoneId: 'garden',
        zoneName: 'Garden Drip Irrigation',
        type: 'irrigation_jam',
        title: 'Outdoor Irrigation Solenoid Stuck Open',
        description: 'Scheduled lawn watering exceeded maximum 20-minute threshold; continuing unthrottled at 18 L/min.',
        severity: 'warning',
        estimatedWastageRate: 1080,
        totalWastedLitres: 34.0,
        estimatedCostWasted: 2.1,
        detectedAt: now,
        status: 'active',
        autoShutoffTriggered: false,
      };
    }

    setTelemetry((prev) => ({
      ...prev,
      activeLeaks: [leakData],
      leakDetected: true,
    }));
  };

  const handleResolveLeak = (leakId: string) => {
    setTelemetry((prev) => ({
      ...prev,
      activeLeaks: prev.activeLeaks.filter((l) => l.id !== leakId),
      leakDetected: prev.activeLeaks.length > 1,
    }));
  };

  const handleEmergencyAutoShutoff = () => {
    setTelemetry((prev) => ({
      ...prev,
      mainValveState: 'auto_locked',
      totalFlowRate: 0,
      activeLeaks: prev.activeLeaks.map((l) => ({ ...l, status: 'mitigated' as const })),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. Header Navigation Bar */}
      <Header
        telemetry={telemetry}
        onToggleMainValve={handleToggleMainValve}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        propertyType={propertyType}
        onChangePropertyType={setPropertyType}
        isSimulating={telemetry.activeLeaks.length > 0}
        currency={currency}
        onChangeCurrency={setCurrency}
      />

      {/* 2. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6 pb-24 md:pb-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-200 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry & Leak Center</span>
            {telemetry.activeLeaks.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'zones'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Zone Sub-Metering ({telemetry.zones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Consumption Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ai_audit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Water Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'community'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Conservation Quests</span>
          </button>
        </div>

        {/* Dynamic View Panels */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Telemetry Gauges */}
            <TelemetryOverview
              telemetry={telemetry}
              currency={currency}
              onTogglePump={handleTogglePump}
            />

            {/* Acoustic Leak Detection Sandbox & Anomaly Simulator */}
            <LeakDiagnosticSandbox
              telemetry={telemetry}
              onSimulateLeak={handleSimulateLeak}
              onAutoShutoff={handleEmergencyAutoShutoff}
              onResolveLeak={handleResolveLeak}
              currency={currency}
            />

            {/* Quick Analytics & Zone Summary Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ZoneMonitor
                zones={telemetry.zones.slice(0, 4)}
                onToggleZoneValve={handleToggleZoneValve}
                currency={currency}
              />
              <AnalyticsView telemetry={telemetry} currency={currency} />
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ZoneMonitor
              zones={telemetry.zones}
              onToggleZoneValve={handleToggleZoneValve}
              currency={currency}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AnalyticsView telemetry={telemetry} currency={currency} />
          </div>
        )}

        {activeTab === 'ai_audit' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AiWaterAdvisor
              telemetry={telemetry}
              propertyType={propertyType}
              currency={currency}
            />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ConservationHub
              ecoScore={telemetry.ecoScore}
              currency={currency}
            />
          </div>
        )}
      </main>

      {/* 3. Modals */}
      <SmartAutomationModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        dailyBudget={telemetry.dailyBudgetLiters}
        onUpdateDailyBudget={(newBudget) =>
          setTelemetry((prev) => ({ ...prev, dailyBudgetLiters: newBudget }))
        }
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        telemetry={telemetry}
        onEmergencyShutoff={handleEmergencyAutoShutoff}
      />
    </div>
  );
}
